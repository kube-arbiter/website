---
sidebar_position: 3
title: Scheduling by resource usage
sidebar_label: Scheduling by resource usage
---
Scheduling based on real resource usage.

:::info

The following example is part of our [e2e test](https://github.com/kube-arbiter/arbiter/blob/main/tests/e2e/scheduler_test.go#L226)

:::

### 1. Prepare a kubernetes cluster

The cluster used in this example contains two nodes: each node has 2 CPU cores and 8 GiB of memory.

In this example, our OBI comes from the [metrics-server](https://github.com/kubernetes-sigs/metrics-server), so we also need to [install the metrics-server](https://github.com/kubernetes-sigs/metrics-server#installation) if it's not installed.

```bash
$ kubectl get node
NAME                        STATUS   ROLES                  AGE   VERSION
arbiter-e2e-control-plane   Ready    control-plane,master   13m   v1.21.14
arbiter-e2e-worker          Ready    <none>                 12m   v1.21.14
```

### 2. Create a pod to consume cpu

Use the following YAML file to create a Pod with kubernetes official e2e image to consume cpu:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: test-cost-cpu-load
  name: test-cost-cpu-load
spec:
  replicas: 1
  selector:
    matchLabels:
      app: test-cost-cpu-load
  template:
    metadata:
      labels:
        app: test-cost-cpu-load
    spec:
      containers:
      - command:
        - /consume-cpu/consume-cpu
        - --millicores=1000
        - --duration-sec=6000
        image: kubearbiter/resource-consumer:1.10
        name: consumer
        resources:
          requests:
            cpu: 100m
```

Run the following command to view the loads on both of the cluster nodes, you can see the cpu use in node `arbiter-e2e-worker` is high.

```bash
$ kubectl top node
NAME                        CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
arbiter-e2e-control-plane   357m         17%    877Mi           12%
arbiter-e2e-worker          1004m        50%    506Mi           7%
```

### 3. Verify that the default scheduler is not affected by actual resource usage

we create a deploy with 4 replicas pod, use the following yaml file:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: test-busybox-mul-ms
  name: test-busybox-mul-ms
spec:
  replicas: 4
  selector:
    matchLabels:
      app: test-busybox-mul-ms
  template:
    metadata:
      labels:
        app: test-busybox-mul-ms
    spec:
      containers:
      - command:
        - /bin/sh
        - -ec
        - sleep 1000
        image: busybox
        name: busybox
```

The following output indicates that the pods are evenly scheduled to the nodes in the cluster. default kube-scheduler cannot monitor the loads on the nodes.

```bash
$ kubectl get po -o wide -l app=test-busybox-mul-ms
NAME                                   READY   STATUS    RESTARTS   AGE   IP            NODE                        NOMINATED NODE   READINESS GATES
test-busybox-mul-ms-56678f47f5-6zxrf   1/1     Running   0          62s   10.244.1.18   arbiter-e2e-worker          <none>           <none>
test-busybox-mul-ms-56678f47f5-8zlxj   1/1     Running   0          62s   10.244.0.9    arbiter-e2e-control-plane   <none>           <none>
test-busybox-mul-ms-56678f47f5-mlwqf   1/1     Running   0          62s   10.244.0.10   arbiter-e2e-control-plane   <none>           <none>
test-busybox-mul-ms-56678f47f5-ntds5   1/1     Running   0          62s   10.244.1.17   arbiter-e2e-worker          <none>           <none>
```

### 4. Verify that the arbiter-scheduler can perceive the actual resource usage and schedule it reasonably

Install the Arbiter as described in the previous section in [install](../Quick%20Start/install.md).
And deploy some OBI to monitor node cpu and memory, as described in the previous section in [Define an OBI](../Tasks/define-a-obi.md)
Then apply our arbiter `score.js`, the `score()` function is written in js, you can write arbitrary logic for scoring nodes

```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: Score
metadata:
  name: show-demo
  namespace: kube-system
spec:
  logic: |
    function score() {
        if (node.raw == undefined || node.raw.status == undefined || node.raw.status.capacity == undefined
            || node.raw.metadata == undefined || node.raw.metadata.name == undefined) {
            console.error('[Extend-js] cant find node manifest');
            return 0;
        }
        var name = node.raw.metadata.name;
        var capacity = node.raw.status.capacity;
        if (capacity.cpu == undefined) {
            console.error('[Extend-js]  cant find node cpu capacity in capacity', name);
            return 0;
        }
        var cpuTotal = capacity.cpu * 1000;
        var cpuAvg = cpuTotal * 0.5; // same with obi, default value from capacity
        console.log('[Extend-js] cpuAvg', cpuAvg);
        if (node.metric == undefined || node.metric.cpu == undefined || node.metric.cpu.avg == undefined) {
            console.error('[Extend-js] cant find node cpu metric', name);
        } else {
            cpuAvg = node.metric.cpu.avg;  // if has metric, use metric instead
            console.log('[Extend-js] cpuAvg', cpuAvg);
        }
        var cpuScore = (cpuTotal - cpuAvg) / cpuTotal;
        console.log('[Extend-js] cpuScore:', cpuScore, 'nodeName', name, 'cpuTotal', cpuTotal, 'cpuAvg', cpuAvg);
        return cpuScore * 100;
    }
```

Delete pod to make them reschedule, and you will see they all schedule to node which cpu usage is lower:

```bash
$ kubectl delete po -l app=test-busybox-mul-ms
pod "test-busybox-mul-ms-56678f47f5-6zxrf" deleted
pod "test-busybox-mul-ms-56678f47f5-8zlxj" deleted
pod "test-busybox-mul-ms-56678f47f5-mlwqf" deleted
pod "test-busybox-mul-ms-56678f47f5-ntds5" deleted

$ kubectl get po -l app=test-busybox-mul-ms
NAME                                   READY   STATUS    RESTARTS   AGE   IP            NODE                        NOMINATED NODE   READINESS GATES
test-busybox-mul-ms-56678f47f5-ddgbl   1/1     Running   0          56s   10.244.0.11   arbiter-e2e-control-plane   <none>           <none>
test-busybox-mul-ms-56678f47f5-lkfmb   1/1     Running   0          56s   10.244.0.12   arbiter-e2e-control-plane   <none>           <none>
test-busybox-mul-ms-56678f47f5-p7sjn   1/1     Running   0          56s   10.244.0.13   arbiter-e2e-control-plane   <none>           <none>
test-busybox-mul-ms-56678f47f5-rxqpz   1/1     Running   0          56s   10.244.0.14   arbiter-e2e-control-plane   <none>           <none>
```
