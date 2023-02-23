---
sidebar_position: 3
title: Scheduling by resource usage
sidebar_label: Scheduling by resource usage
---
Scheduling based on real resource usage.

:::info

The following example is part of our [e2e test](https://github.com/kube-arbiter/arbiter/blob/main/tests/e2e/scheduler_test.go)

:::

### 1. Prepare a kubernetes cluster

The cluster used in this example contains two nodes: each node has 2 CPU cores and 8 GiB of memory. Each node comes with a custom label `data-test: data-test` to facilitate subsequent testing.

In this example, our OBI comes from the [metrics-server](https://github.com/kubernetes-sigs/metrics-server), so we also need to [install the metrics-server](https://github.com/kubernetes-sigs/metrics-server#installation) if it's not installed.

```bash
$ kubectl get node
NAME                        STATUS   ROLES                  AGE   VERSION
arbiter-e2e-control-plane   Ready    control-plane,master   13m   v1.21.14
arbiter-e2e-worker          Ready    <none>                 12m   v1.21.14
```

### 2. Create a pod to consume cpu

Use the following YAML file to create a Pod with kubernetes official e2e image to consume cpu, this Pod consumes a lot of CPU, but its `resources.request.cpu` value is small:

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
And deploy some OBI to monitor node cpu and memory, as described in the previous section in [Define an OBI](../Tasks/define-a-obi.md). We can use the 4 OBIs in [e2e test](https://github.com/kube-arbiter/arbiter/blob/main/tests/e2e/scheduler_test.go) to get the CPU and memory usage of each of the 2 nodes and record them into the OBI:

```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: ObservabilityIndicant
metadata:
  name: real-metrics-server-node-cpu-0
  labels:
    test: node-cpu-load-aware-ms
spec:
  metric:
    historyLimit: 1
    metricIntervalSeconds: 30
    metrics:
      cpu:
        aggregations:
          - time
        description: ""
        query: ""
        unit: 'm'
    timeRangeSeconds: 600
  source: metrics-server
  targetRef:
    group: ""
    index: 0
    kind: Node
    labels:
      data-test: data-test
    name: ""
    namespace: ""
    version: v1
status:
  conditions: []
  phase: ""
  metrics: {}
---
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: ObservabilityIndicant
metadata:
  name: real-metrics-server-node-mem-0
  labels:
    test: node-cpu-load-aware-ms
spec:
  metric:
    historyLimit: 1
    metricIntervalSeconds: 30
    metrics:
      memory:
        aggregations:
          - time
        description: ""
        query: ""
        unit: "byte"
    timeRangeSeconds: 600
  source: metrics-server
  targetRef:
    group: ""
    index: 0
    kind: Node
    labels:
      data-test: data-test
    name: ""
    namespace: ""
    version: v1
status:
  conditions: []
  phase: ""
  metrics: {}
---
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: ObservabilityIndicant
metadata:
  name: real-metrics-server-node-cpu-1
  labels:
    test: node-cpu-load-aware-ms
spec:
  metric:
    historyLimit: 1
    metricIntervalSeconds: 30
    metrics:
      cpu:
        aggregations:
          - time
        description: ""
        query: ""
        unit: 'm'
    timeRangeSeconds: 600
  source: metrics-server
  targetRef:
    group: ""
    index: 1
    kind: Node
    labels:
      data-test: data-test
    name: ""
    namespace: ""
    version: v1
status:
  conditions: []
  phase: ""
  metrics: {}
---
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: ObservabilityIndicant
metadata:
  name: real-metrics-server-node-mem-1
  labels:
    test: node-cpu-load-aware-ms
spec:
  metric:
    historyLimit: 1
    metricIntervalSeconds: 30
    metrics:
      memory:
        aggregations:
          - time
        description: ""
        query: ""
        unit: "byte"
    timeRangeSeconds: 600
  source: metrics-server
  targetRef:
    group: ""
    index: 1
    kind: Node
    labels:
      data-test: data-test
    name: ""
    namespace: ""
    version: v1
status:
  conditions: []
  phase: ""
  metrics: {}
```

Then apply our arbiter `score.js`, the `score()` function is written in js, you can write arbitrary logic for scoring nodes

```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: Score
metadata:
  name: real-metrics-server
spec:
  weight: 100
  logic: |
    // obi syntax rules: obi_ns-obi_name
    const NodeCPUOBI = new Map([['arbiter-e2e-control-plane', 'OBINS-real-metrics-server-node-cpu-0'], ['arbiter-e2e-worker', 'OBINS-real-metrics-server-node-cpu-1'],]);
    const NodeMemOBI = new Map([['arbiter-e2e-control-plane', 'OBINS-real-metrics-server-node-mem-0'], ['arbiter-e2e-worker', 'OBINS-real-metrics-server-node-mem-1'],]);

    function getPodCpuMemReq() {
        const DefaultCPUReq = 100; // 0.1 core
        const DefaultMemReq = 200 * 1024 * 1024; // 200MB
        var podContainer = pod.raw.spec.containers;
        if (podContainer == undefined) {
            return [DefaultCPUReq, DefaultMemReq];
        }
        var cpuReq = 0;
        var memReq = 0;
        for (var i = 0; i < podContainer.length; i++) {
            var resources = podContainer[i].resources;
            if (resources.requests == undefined) {
                cpuReq += DefaultCPUReq;
                memReq += DefaultMemReq;
                continue
            }
            cpuReq += cpuParser(resources.requests.cpu);
            memReq += memParser(resources.requests.memory);
        }
        var podInitContainers = pod.raw.spec.initContainers;
        if (podInitContainers == undefined) {
            return [cpuReq, memReq];
        }
        var initCPUReq = 0;
        var initMemReq = 0;
        for (var i = 0; i < podInitContainers.length; i++) {
            var resources = podInitContainers[i].resources;
            if (resources.requests == undefined) {
                initCPUReq = DefaultCPUReq;
                initMemReq = DefaultMemReq;
            } else {
                initCPUReq = cpuParser(resources.requests.cpu);
            }
            if (initCPUReq > cpuReq) {
                cpuReq = initCPUReq;
            }
            if (initMemReq > memReq) {
                memReq = initMemReq;
            }
        }
        return [cpuReq, memReq];
    }

    function cpuParser(input) {
        const milliMatch = input.match(/^([0-9]+)m$/);
        if (milliMatch) {
            return parseInt(milliMatch[1]);
        }

        return parseFloat(input) * 1000;
    }

    function memParser(input) {
        const memoryMultipliers = {
            k: 1000, M: 1000 ** 2, G: 1000 ** 3, Ki: 1024, Mi: 1024 ** 2, Gi: 1024 ** 3,
        };
        const unitMatch = input.match(/^([0-9]+)([A-Za-z]{1,2})$/);
        if (unitMatch) {
            return parseInt(unitMatch[1], 10) * memoryMultipliers[unitMatch[2]];
        }

        return parseInt(input, 10);
    }

    function score() {
        // Feel free to modify this score function to suit your needs.
        // This score function replaces the default score function in the scheduling framework.
        // It inputs the pod and node to be scheduled, and outputs a number (usually 0 to 100).
        // The higher the number, the more the pod tends to be scheduled to this node.
        // The current example shows the scoring based on the actual cpu usage of the node.
        var req = getPodCpuMemReq();
        var podCPUReq = req[0];
        var podMemReq = req[1];
        var nodeName = node.raw.metadata.name;
        var capacity = node.raw.status.allocatable;
        var cpuCap = cpuParser(capacity.cpu);
        var memCap = memParser(capacity.memory);
        var cpuUsed = node.cpuReq;
        var memUsed = node.memReq;
        var cpuReal = node.obi[NodeCPUOBI.get(nodeName)].metric.cpu;
        if (cpuReal == undefined || cpuReal.avg == undefined) {
            console.error('[arbiter-js-real-metrics-server] cant find node cpu metric', nodeName);
        } else {
            cpuUsed = cpuReal.avg;  // if has metric, use metric instead
        }
        var memReal = node.obi[NodeMemOBI.get(nodeName)].metric.memory;
        if (memReal == undefined || memReal.avg == undefined) {
            console.error('[arbiter-js-real-metrics-server] cant find node mem metric', nodeName);
        } else {
            memUsed = memReal.avg;  // if has metric, use metric instead
        }
        console.log('[arbiter-js-real-metrics-server] cpuUsed', cpuUsed);
        // LeastAllocated
        var cpuScore = (cpuCap - cpuUsed - podCPUReq) / cpuCap;
        console.log('[arbiter-js-real-metrics-server] cpuScore:', cpuScore, 'nodeName', nodeName, 'cpuCap', cpuCap, 'cpuUsed', cpuUsed, 'podCPUReq', podCPUReq);
        var memScore = (memCap - memUsed - podMemReq) / memCap;
        console.log('[arbiter-js-real-metrics-server] memScore:', memScore, 'nodeName', nodeName, 'memCap', memCap, 'memUsed', memUsed, 'podMemReq', podMemReq);
        return (cpuScore + memScore) / 2 * 100;
    }

```

The above scoring logic mimics the default LeastAllocated scoring algorithm of kubernetes, giving higher scores to nodes with low resource usage and thus scheduling new pods to nodes with low resource usage, the difference is that our scoring logic uses the real resource usage of the nodes obtained from OBI instead of the request and limit values declared in the manifest of the pods.

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
