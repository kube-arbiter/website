---
sidebar_position: 1
title: 更新资源
sidebar_label: 更新资源
---
Through this part of [QuickStart](../Quick%20Start/install.md), we have installed `observer-metric-server` and `observer-prometheus` and `executor`. Now we need to add meaningful labels to pods and nodes through the executor service to coordinate scheduling.

### 1. Create a Deployment to consume cpu

Create the Deployment with the YAML example below.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mem-cost
  labels:
    app: mem-cost
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mem-cost
  template:
    metadata:
      labels:
        app: mem-cost
    spec:
      containers:
      - name: mem-cost
        image: kubearbiter/resource-consumer:1.10
        command:
        - stress
        args:
        - -m
        - "2"
        - --vm-bytes
        - 32M
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "100m"
```

Check if the pod is running properly.
```bash
➜  ~ kubectl get po -narbiter-test
NAME                                          READY   STATUS    RESTARTS   AGE
observer-metric-server-64f9495b66-xsx2p       2/2     Running   0          1m
```

### 2. Deploy OBI and ObservabilityActionPolicy
```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: ObservabilityIndicant
metadata:
  name: metric-server-pod-cpu
spec:
  metric:
    historyLimit: 1
    metricIntervalSeconds: 30
    metrics:
      cpu:
        aggregations:
        - time
        description: cpu
        query: ""
        unit: 'm'
    timeRangeSeconds: 3600
  source: metric-server
  targetRef:
    group: ""
    index: 0
    kind: Pod
    labels:
      app: mem-cost
    name: ""
    namespace: arbiter-system
    version: v1
status:
  conditions: []
  phase: ""
  metrics: {}
---
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: ObservabilityActionPolicy
metadata:
  name: metric-server-pod-cpu
spec:
  condition:
    expression: avg([metrics.cpu])
    operator: '>='
    targetValue: "0" # 
  obIndicantname: metric-server-pod-cpu
  parameters:
    tagging-key: metric-server-pod-cpu
    tagging-value: sensitive
status:
  actionInfo: []
  timeInfo:
    startTime: "2022-09-26T10:46:25Z"
    endTime: "2022-09-26T10:46:25Z"
    metricIntervalSeconds: 15
```
By setting the condition of `ObservabilityActionPolicy` to be greater than or equal to 0, the executor will definitely add labels to the relevant pods.

### 3. Check data, label correctness
```bash
➜  ~ kubectl -narbiter-test get obi metric-server-pod-cpu -o=template --template={{.status.metrics}}
map[cpu:[map[endTime:2022-10-12T02:56:32Z records:[map[timestamp:1665543392742 value:100.000]] startTime:2022-10-12T02:56:02Z targetItem:mem-cost-59668689c-7j5kt unit:m]]]
```

Through the above command, you can see that OBI has obtained the cpu data of Pod normally.

```bash
➜  executor git:(main) ✗ kubectl get ObservabilityActionPolicy metric-server-pod-cpu -narbiter-test -o=template --template={{.status}}
map[actionInfo:[map[conditionValue:true expressionValue:100.00 resourceName:mem-cost-59668689c-7j5kt]] timeInfo:map[endTime:2022-09-26T10:46:25Z metricIntervalSeconds:15 startTime:2022-09-26T10:46:25Z]]
```

In ObservabilityActionPolicy, you can see the calculated data and whether the logic needs to be executed.


```bash
➜  executor git:(main) ✗ kubectl -narbiter-test get po mem-cost-59668689c-7j5kt --show-labels
NAME                       READY   STATUS    RESTARTS   AGE     LABELS
mem-cost-59668689c-7j5kt   1/1     Running   0          2d15h   app=mem-cost,metric-server-pod-cpu=sensitive,pod-template-hash=59668689c
```

As you can see from the command output above, the Pod has been updated normally.
