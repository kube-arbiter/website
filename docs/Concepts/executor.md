---
sidebar_position: 5
title: Executor
sidebar_label: Executor
---

这里通过几个例子来介绍如何通过 Executor 来实现基于 OBI 指标的行为定义，以便让用户快速扩展实现期望的自动化操作。
1. Resource Tagger(Update Resource)
2. Power off node

### Resource Tagger 功能与价值

1. 通过自动检测、对 K8S 集群中运行的资源进行标记，让用户对资源的特性有一个更直观的了解。
2. 调度器可以根据这些标记出来的特性，做调度优化建议，将资源调度到更适合的节点运行。
3. 缺省提供 CPU 敏感、内存敏感两种资源特性的检测和标记，用户可以根据自己的业务需求，自定义资源特性和检测标准。

### Resource Tagger 架构

![image-20220306110303070](./img/resource-tagger-arch-v0.3.png)

### Resource Tagger 工作流程

![image-20220306110303070](./img/resource-tagger-workflow-v0.3.png)

1. 何时对 Deployment 打标记？只要 Deployment 有一个 Pod 被了标记，则对该 Deployment 打标记。如果需要详细的该 Deployment 中有哪些 Pod  被打了标记，可以进一步获取该 Deployment 的 Pod 信息来查询。
2. Aribiter-Resource-Tagger 与 Arbiter-Observer 之间不通过 API 调用来交互，而是数据驱动式交互，通过 ObservabilityIndicant CR 的数据更新与获取来交互。

### Resource Tagger Demo

1. 部署 aribiter resource tagger：包括 resource tagger deployment、CRD、RBAC、Service Account 等。

2. 创建一个 ObservabilityIndicant，用于统计含 Deployment mem-cost 在过去 2 分钟的 CPU, 内存 监控数据。

  ```yaml
  apiVersion: arbiter.k8s.com.cn/v1alpha1
  kind: ObservabilityIndicant
  metadata:
    name: mem-cost-example
    namespace: arbiter
  spec:
    log: {}
    metric:
      metricIntervalSeconds: 30
      metrics:
        cpu:
          aggregation:
          - time
          description: cpu
        memory:
          aggregation:
          - time
          description: zzz
      timeRangeSeconds: 120
    source: metric-server
    targetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: mem-cost
      namespace: arbiter
    trace: {}
  status:
    conditions:
    - lastHeartbeatTime: "2022-07-07T14:03:38Z"
      lastTransitionTime: "2022-07-07T14:03:38Z"
      reason: FetchDataDone
      type: FetchDataDone
    phase: FetchDataDone
    metrics:
      cpu:
      - endTime: "2022-10-14T09:06:00Z"
        records:
        - timestamp: 1665738360444
          value: "2658.000"
        startTime: "2022-10-14T09:05:30Z"
        targetItem: 21v-tc-kubedata-4
        unit: m
    timeInfo:
      endTime: "2022-07-07T14:03:37Z"
      startTime: "2022-07-07T14:03:07Z"
  ```

3. 创建一个 ResourceTaggingPolicy，用于对通过上面创建的 ObservabilityIndicant 收集了监控数据的 Pod 中 cpu 使用核心数以及内存用量，当比例平均值超过 2 则添加标签。 在一个周期后可以看到cr的status已经更新了数据

  ```yaml
  apiVersion: arbiter.k8s.com.cn/v1alpha1
  kind: ObservabilityActionPolicy
    name: actionpolicy-mem-cost
    namespace: arbiter
  spec:
    actionProvider: resourcetagger
    condition:
      expression: avg([metrics.memory.time])/(avg([metrics.cpu.time])/1000000)
      operator: '>'
      podAggregator: avg
      targetValue: "2"
    obIndicantname: mem-cost-example
    actionData:
      labels:
        memory-sensitive: "true"
        metric-source: metric-server
  status:
    actionInfo:
    - conditionValue: "true"
      expressionValue: "72.81"
      resourceName: mem-cost-78ccff7d6b-vbm7n
    timeInfo: {}
  ```

4. 查看 deployment mem-cost 的 Pod YAML 中的 labels 和 annotations，被打上了 “mem: sensitive” 的 tag。

```shell
[root@root ~]# kubectl get po mem-cost-78ccff7d6b-vbm7n -narbiter --show-labels
NAME                        READY   STATUS    RESTARTS   AGE   LABELS
mem-cost-78ccff7d6b-vbm7n   1/1     Running   0          10d   app=mem-cost,memory=sensitive,pod-template-hash=78ccff7d6b
```

### Resource Tagger 数据模型驱动图
![image-20220306110303070](./img/resource-tagger-data-flow.png)
