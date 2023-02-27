---
sidebar_position: 3
title: 负载感知调度
sidebar_label: 负载感知调度
---
负载感知调度

:::info

下述的例子来源于我们的 [e2e test](https://github.com/kube-arbiter/arbiter/blob/main/tests/e2e/scheduler_test.go)

:::

整体架构图如下:
![arbiter-real-usage-architecture](./img/arbiter-real-usage-architecture.png)

### 1. 准备一个 kubernetes 集群

本例中使用的集群包含两个节点：每个节点有 2 个 CPU 核心和 8GiB 的内存。每个节点都带有一个自定义的 label `data-test: data-test` 以方便后续的测试。

在这个例子中，我们的 OBI 来自 [metrics-server](https://github.com/kubernetes-sigs/metrics-server) ，所以我们还需要先[安装 metrics-server](https://github.com/kubernetes-sigs/metrics-server#installation)。

```bash
$ kubectl get node
NAME                        STATUS   ROLES                  AGE   VERSION
arbiter-e2e-control-plane   Ready    control-plane,master   13m   v1.21.14
arbiter-e2e-worker          Ready    <none>                 12m   v1.21.14
```

### 2. 创建一个 pod 来消耗 CPU

使用下面的 YAML 文件，用 [kubernetes 官方 e2e 镜像](https://github.com/kubernetes/kubernetes/blob/master/test/images/resource-consumer/README.md) 创建一个 Pod，以消耗 CPU，这个 Pod 会消耗大量的 CPU，但是它的 `resources.request.cpu` 值很小:

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
并部署一些 OBI 来监控节点的 CPU 和内存，如上一节 [定义一个 OBI](../Tasks/define-a-obi.md) 所述，我们可以使用 [e2e test](https://github.com/kube-arbiter/arbiter/blob/main/tests/e2e/scheduler_test.go) 中的 4 个 OBI，分别获取 2 个节点的 CPU 和内存使用情况，记录到 OBI 中

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

然后应用我们的 Arbiter `Score` CR，`score()` 函数是用 JS 写的，你可以写任意的逻辑来给节点打分:

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

上面的打分逻辑模仿了 kubernetes 默认的 LeastAllocated 打分算法，给资源使用低的节点更高的分数，从而实现将新的 pod 调度到资源使用低的节点，区别是我们的打分逻辑使用的是从 OBI 中获取的节点的真实资源使用情况，而不是 pod 的 manifest 中声明的 request 和 limit 值。

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
