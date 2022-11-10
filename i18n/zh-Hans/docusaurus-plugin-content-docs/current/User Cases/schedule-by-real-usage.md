---
sidebar_position: 3
title: 负载感知调度
sidebar_label: 负载感知调度
---
负载感知调度

:::info

下述的例子来源于我们的 [e2e test](https://github.com/kube-arbiter/arbiter/blob/main/tests/e2e/scheduler_test.go#L226)

:::

### 1. 准备一个 kubernetes 集群

本例中使用的集群包含两个节点：每个节点有 2 个 CPU 核心和 8GiB 的内存。

在这个例子中，我们的 OBI 来自 [metrics-server](https://github.com/kubernetes-sigs/metrics-server) ，所以我们还需要先[安装 metrics-server](https://github.com/kubernetes-sigs/metrics-server#installation)。

```bash
$ kubectl get node
NAME                        STATUS   ROLES                  AGE   VERSION
arbiter-e2e-control-plane   Ready    control-plane,master   13m   v1.21.14
arbiter-e2e-worker          Ready    <none>                 12m   v1.21.14
```

### 2. 创建一个 pod 来消耗 CPU

使用下面的 YAML 文件，用 [kubernetes 官方 e2e 镜像](https://github.com/kubernetes/kubernetes/blob/master/test/images/resource-consumer/README.md) 创建一个 Pod，以消耗 CPU:

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

运行下面的命令来查看两个集群节点的负载，可以看到节点 `arbiter-e2e-worker` 的 CPU 使用率很高。

```bash
$ kubectl top node
NAME                        CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
arbiter-e2e-control-plane   357m         17%    877Mi           12%
arbiter-e2e-worker          1004m        50%    506Mi           7%
```

### 3. 验证默认调度器不受实际资源使用的影响

我们创建一个有 4 个副本的 Deploy，使用以下 YAML 文件:

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

下面的输出表明，pod 被均匀地调度到集群中的节点上。默认的 kube-scheduler 不能监控节点上实际的负载。

```bash
$ kubectl get po -o wide -l app=test-busybox-mul-ms
NAME                                   READY   STATUS    RESTARTS   AGE   IP            NODE                        NOMINATED NODE   READINESS GATES
test-busybox-mul-ms-56678f47f5-6zxrf   1/1     Running   0          62s   10.244.1.18   arbiter-e2e-worker          <none>           <none>
test-busybox-mul-ms-56678f47f5-8zlxj   1/1     Running   0          62s   10.244.0.9    arbiter-e2e-control-plane   <none>           <none>
test-busybox-mul-ms-56678f47f5-mlwqf   1/1     Running   0          62s   10.244.0.10   arbiter-e2e-control-plane   <none>           <none>
test-busybox-mul-ms-56678f47f5-ntds5   1/1     Running   0          62s   10.244.1.17   arbiter-e2e-worker          <none>           <none>
```

### 4. 验证 arbiter-scheduler 能够感知实际的资源使用情况，并对其进行合理的安排

按照上一节 [install](../Quick%20Start/install.md) 中的描述，安装 Arbiter。
并部署一些 OBI 来监控节点的 CPU 和内存，如上一节 [定义一个 OBI](../Tasks/define-a-obi.md) 所述。

然后应用我们的 Arbiter `Score` CR，`score()` 函数是用 JS 写的，你可以写任意的逻辑来给节点打分:

```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: Score
metadata:
  name: show-demo
  namespace: kube-system
spec:
  logic: |
    function score() {
        // Feel free to modify this `score` function to suit your needs.
        // This score function replaces the default score function in the scheduling framework.
        // It inputs the pod and node to be scheduled, and outputs a number (usually 0 to 100).
        // The higher the number, the more the pod tends to be scheduled to this node.
        // The current example shows the scoring based on the actual resource usage of the node.
        if (node.raw == undefined || node.raw.status == undefined || node.raw.status.capacity == undefined || node.raw.metadata == undefined || node.raw.metadata.name == undefined) {
            // console.error and console.log will print log to the arbiter-scheduler's log.
            console.error('[arbiter-js] cant find node manifest.');
            return 0;
        }
        var name = node.raw.metadata.name;
        var capacity = node.raw.status.capacity;
        if (capacity.cpu == undefined) {
            console.error('[arbiter-js] cant find node cpu capacity in capacity', name);
            return 0;
        }
        var cpuTotal = capacity.cpu * 1000;
        var cpuAvg = cpuTotal * 0.5; // same with obi, default value from capacity
        console.log('[arbiter-js] cpuAvg', cpuAvg);
        if (node.metric == undefined || node.metric.cpu == undefined || node.metric.cpu.avg == undefined) {
            console.error('[arbiter-js] cant find node cpu metric', name);
        } else {
            cpuAvg = node.metric.cpu.avg;  // if has metric, use metric instead
            console.log('[arbiter-js] cpuAvg', cpuAvg);
        }
        var cpuScore = (cpuTotal - cpuAvg) / cpuTotal;
        console.log('[arbiter-js] cpuScore:', cpuScore, 'nodeName', name, 'cpuTotal', cpuTotal, 'cpuAvg', cpuAvg);
        return cpuScore * 100;
    }

```

强制删除 pod 以使它们重新调度，你会看到它们都被调度到 CPU 使用率较低的节点上。

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
