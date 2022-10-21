---
sidebar_position: 2
title: Observability Indicator 介绍
sidebar_label: Observability Indicator 介绍
---

<!--
OBI is the short name of Observability Indicator, it's used to get the data from various metric/log/trace tools and try to get a consistent view for Arbiter.

You can check the custom resource definition in the arbitor repostiroy using path 'manifests/crds/arbiter.k8s.com.cn_observabilityindicants.yaml'.

Here we use a sample OBI resource to explain each configuration.
-->
OBI 是 Observability Indicator 的简称，它用于从各种 metric/log/trace 工具中获取数据，并尝试为 Arbiter 获得一致的视图。

您可以使用路径 “manifests/crds/arbiter.k8s.com.cn_observabilityindicants.yaml” arbiter repostiroy 中的自定义资源定义。

在这里，我们使用示例 OBI 资源来解释每个配置。

<!-- ### OBI to read CPU usage from metric server -->
### OBI 通过 metric server 读取 CPU 使用情况
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

<!--
In the sample above, we have the following configuration:
1. metadata, that's the default for all Kubernetes resources
2. source under spec, it's the type of observability tool that Arbiter will read data from, you can only use the type that Arbiter can support. Support metric-server and prometheus for now.
3. metric under spec, it's the data collection policy from the source.
-->
上面的例子，我们做了如下配置：
1. metadata 每个 Kubernetes 资源默认都有的。
2. spec 下的 source 字段，它是 Arbiter 将从中读取数据的可观察性工具的类型，你只能使用 Arbiter 可以支持的类型。目前支持 metric-server 和 prometheus。
3. spec 下的 metric 字段，这是来自源的数据收集策略。

| 属性         | 用法                                         |  默认值 |
|--------------    |:-----:                                         |-----------:|
| historyLimit |  将保存的历史数据的最大限制  |        1 |
| metricIntervalSeconds      | 从源检索数据的时间间隔 |     30 |
| timeRangeSeconds      | 保持最新数据的时间范围 |     3600 |
| metrics      | 将用于查询源的指标，它包含指标名称、查询语言、单位、聚合和描述 |  3600 |

<!--
4. targetRef under spec, it's used to get some metadata from the target resource and use the values in the query
-->
4. spec 下的 targetRef 字段，
它用于从目标资源中获取一些元数据并使用查询中的值。

| 属性         | 用法                                         | 默认值 |
|--------------    |:-----:                                         |-----------:|
| group |  与目标资源匹配的 API 组  |        '' |
| index      | 要保存到此 OBI 的数据的索引，以防多个对象匹配 |     0 |
| kind      | 与目标资源匹配的种类 |     '' |
| labels      | 与目标资源匹配的标签 |     '' |
| name      | 与目标资源匹配的名称 |     '' |
| namespace      | 与目标资源匹配的 namespace |     '' |
| version      | 与目标资源匹配的 API 版本 |     'v1' |

<!-- 5. status is also the default for Kubernetes resources, it show the current data collected from source using specified query. metrics will have the data and timestamp collected. -->
5. status 也是 Kubernetes 资源的默认值，它显示使用指定查询从源收集的当前数据。指标将收集数据和时间戳。
