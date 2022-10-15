---
sidebar_position: 1
title: Define an OBI
sidebar_label: Define an OBI
---
How to define an OBI object and manage it using kubectl.

According to the [quick start](../Quick%20Start/install.md) section, we have already deployed `observer-metric-server` or `observer-prometheus`, or both. 
Next we will deploy a Node's OBI and a Pod's OBI resources to observe the data acquisition.

### Introduction to the fields

1. spec.metric
This field defines the information needed for monitoring, such as `historyLimit` the number of history records, `timeRangeSeconds` the periodicity of data acquisition, and `aggregation` how the data is aggregated.

2. spec.resource
This field specifies the name of the plugin providing the data. Here the default supplied plugin [observer-metric-server](https://github.com/kube-arbiter/arbiter-plugins/observer-plugins/metric-server) is used, so the contents of the field are metric-server.

3. spec.targetRef
The `targetRef` field defines how the node will be obtained. The list of nodes is obtained by means of a label ` beta.kubernetes.io/arch=amd64`, and then the first node is selected by means of `index`.


### OBI with Node
Below is an OBI associated with a metric-server to get the cpu data of the node.

1. Deploy
```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: ObservabilityIndicant
metadata:
  name: metric-server-node-cpu
  namespace: aribter-system
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
    timeRangeSeconds: 3600
  source: metric-server
  targetRef:
    group: ""
    index: 0
    kind: Node
    labels:
      beta.kubernetes.io/arch: amd64
    name: ""
    namespace: ""
    version: v1
status:
  conditions: []
  phase: ""
  metrics: {}
```

2. Check data

```shell
➜  kubectl -narbiter-system get obi metric-server-node-cpu -o template --template={{.status}}
map[conditions:[map[lastHeartbeatTime:2022-10-14T08:37:58Z lastTransitionTime:2022-10-14T08:37:58Z reason:FetchDataDone type:FetchDataDone]] metrics:map[cpu:[map[endTime:2022-10-14T08:37:58Z records:[map[timestamp:1665736678071 value:731.000]] startTime:2022-10-14T08:37:28Z targetItem:21v-tc-zhangsh-team-1 unit:m]]] phase:]
```

As you can see from the above command output, OBI has obtained the cpu data of the Node normally.


### OBI with Pod

Just like Node's OBI, we still use tags to get the Pod, and metric-server to get the Po's cpu monitoring data.


We need a Pod that can consume cpu to verify the data. You can deploy a Pod with high cpu and memory consumption via [mem-cost-deployment](https://github.com/kube-arbiter/arbiter/manifests/example/mem-cost-deploy.yaml).

1. Deploy

```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: ObservabilityIndicant
metadata:
  name: metric-server-pod-cpu
  namespace: arbiter-system
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
```


2. Check data

```shell
➜ kubectl -narbiter-system get obi metric-server-pod-cpu -otemplate --template={{.status}}
map[conditions:[] metrics:map[cpu:[map[endTime:2022-10-12T02:56:32Z records:[map[timestamp:1665543392742 value:100.000]] startTime:2022-10-12T02:56:02Z targetItem:mem-cost-59668689c-7j5kt unit:m]]] phase:]
```

### Ending
As well as being able to select resources by means of tags and indexes, it is also possible to specify specific resource names directly.