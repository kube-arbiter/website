---
sidebar_position: 2
title: Observability Indicator
sidebar_label: Observability Indicator
---
OBI is the short name of Observability Indicator, it's used to get the data from various metric/log/trace tools and try to get a consistent view for Arbiter.

You can check the custom resource definition in the arbitor repostiroy using path 'manifests/crds/arbiter.k8s.com.cn_observabilityindicants.yaml'.

Here we use a sample OBI resource to explain each configuration.

### OBI to read CPU usage from metric server
```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: ObservabilityIndicant
metadata:
  name: prometheus-node-cpu
  namespace: arbiter-test
spec:
  metric:
    historyLimit: 1
    metricIntervalSeconds: 30
    metrics:
      cpu:
        aggregations: [ ]
        description: cpu
        query: (sum(count(node_cpu_seconds_total{mode="idle",node="{{.metadata.name}}"}) by (mode, cpu)) - sum(irate(node_cpu_seconds_total{mode="idle",node="{{.metadata.name}}"}[5m])))*1000
        unit: 'm'
    timeRangeSeconds: 3600
  source: prometheus
  targetRef:
    group: ""
    index: 0
    kind: Node
    labels:
      "data-test": "data-test"
    name: ""
    namespace: ""
    version: v1
status:
  conditions: []
  phase: ""
  metrics: {}
```
In the sample above, we have the following configuration:
1. meatadata, that's the default for all Kubernetes resources
2. source under spec, it's the type of observability tool that Arbiter will read data from, you can only use the type that Arbiter can support. Support metric-server and prometheus for now.
3. metric under spec, it's the data collection policy from the source.

| property         | Usage                                         | Default value |
|--------------    |:-----:                                         |-----------:|
| historyLimit |  The maximum limit of history data that will be saved  |        1 |
| metricIntervalSeconds      | Time interval to retrieve data from source |     30 |
| timeRangeSeconds      | Time range to keep the latest data |     3600 |
| metrics      | The metrics that will be used to query the source, it contains metric name, query languange, unit, aggregations and description|     3600 |
4. targetRef under spec, it's used to get some metadata from the target resource and use the values in the query

| property         | Usage                                         | Default value |
|--------------    |:-----:                                         |-----------:|
| group |  API group of to match with target resource  |        '' |
| index      | The index of the data to be saved to this OBI, in case there are multiple objects matched |     0 |
| kind      | Kind to match with target resource |     '' |
| labels      | Labels to match with target resource |     '' |
| name      | Name to match with target resource |     '' |
| namespace      | Namespace to match with target resource |     '' |
| version      | API version to match with the target resource |     'v1' |

5. status is also the default for Kubernetes resources, it show the current data collected from source using specified query. metrics will have the data and timestamp collected.
