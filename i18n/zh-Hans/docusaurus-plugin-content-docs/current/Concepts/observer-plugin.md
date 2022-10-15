---
sidebar_position: 4
title: Observer 插件
sidebar_label: Observer 插件
---
# Observer 插件

observer 主要作用就是 watch observabilityIndicant，周期性获取 metrics 数据，而要实现的 plugin 就是作为数据提供方。

实现 plugin 只需要实现一个 Grpc 的接口即可。接口只要包含三个函数：

- **GetPluginName**
    
    该接口主要是用来获取插件名称，以便 oserver 控制器可以忽略某些自己不关注的 cr.

- **GetCapabilities**
    
    获取当前插件支持的能力，例如，获取一段时间cpu的最大值，或者内存的平均值等。
    
    当客户在 cr 中编写要获取的指标聚合值，observer 会根据从当前 plugin 获取到的支持的能力与用户所写的进行整合例如：
    
    用户对与 cpu 需要 ma x和 min 的聚合，但是 plugin 却只提供了 min 的聚合能力，所以 observer 插件在请求数据的时候，只会请求 min 的聚合值。
    
- **GetMetrixs**
    
    返回目标 Pod 的聚合指标数据。
    

实现相关接口后启动 rpc 进程，与 observer 的程序共同部署(sidecar 模式) ，二者通过 `unix domain socket` 进行通信

---

## Grpc 接口定义

```protobuf
syntax = "proto3";
package obi.v1;

option go_package = "lib/go/obi";

service Server {
    rpc GetPluginName (GetPluginNameRequest)
        returns (GetPluginNameResponse) {}

    rpc PluginCapabilities (PluginCapabilitiesRequest)
        returns (PluginCapabilitiesResponse) {}

    rpc GetMetrics (GetMetricsRequest)
        returns (GetMetricsResponse) {}
}

message GetPluginNameRequest {
    // nothing
}

message GetPluginNameResponse {
    string name = 1;
    map<string, string> attr = 2;
}

message PluginCapabilitiesRequest {
    // nothing
}

message MetricInfo {
    // cpu_usage
    string metric_unit = 1;
    string  description = 2;
    repeated string aggregation = 3;
}

message PluginCapabilitiesResponse {
    // {"cpu_usage": {"metric_unit":"c","aggregation": ["a","b"]}}
    map<string, MetricInfo> metric_info = 2;
}

message GetMetricsRequest {
    string pod_name = 1;
    string namespace = 2;

    // which  cpu, memory, io eg.
    string metric_resource_name = 3;

    // cpu_usage, memory_usage eg.
    string metric_name = 4;

    // max, min, avg. And so on, some ways to aggregate data
    repeated string aggregation = 5;

    // 1650867976563 microsecond
    int64 start_time = 6;
    int64 end_time = 7;
}

message GetMetricsResponse {
    string pod_name = 1;
    string namespace = 2;
    string unit = 3;

    // the value field is string that is serialized by json.
    // {"cpu_usage": 0.1}
    map<string,double> values = 4;
}
```

---

## demo

* metric-server
In the arbitor repostiroy using path 'manifests/example/metric'.

* prometheus
In the arbitor repostiroy using path 'manifests/example/prometheus'.
---


## 部署

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: observability
  namespace: arbiter

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: observability
rules:
- apiGroups: ["arbiter.k8s.com.cn"]
  resources: ["observabilityindicants"]
  verbs: ["*"]
- apiGroups: ["apps"]
  resources: ["deployments","statefulsets"]
  verbs: ["*"]
- apiGroups: ["","metrics.k8s.io"]
  resources: ["pods","services","services/proxy"]
  verbs: ["*"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: observability
subjects:
- kind: ServiceAccount
  name: observability
  namespace: arbiter
roleRef:
  kind: ClusterRole
  name: observability
  apiGroup: rbac.authorization.k8s.io%
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: observa-server
  namespace: arbiter
spec:
  replicas: 1
  selector:
    matchLabels:
      app: server-example
  template:
    metadata:
      labels:
        app: server-example
    spec:
      volumes:
      - name: sock-volume
        emptyDir: {}
      serviceAccountName: observability
      containers:
      - name: server
        image: arbiter.k8s.com.cn/arbiter/arbiter-metric-server:v0.0.1
        imagePullPolicy: Always
        volumeMounts:
        - mountPath: /tmp/
          name: sock-volume
        command:
        - arbiter-metric-server
        - -v=4

      - name: obi-controller
        image: arbiter.k8s.com.cn/arbiter/obi-controller:v0.0.1
        imagePullPolicy: Always
        volumeMounts:
        - mountPath: /tmp/
          name: sock-volume
        command:
        - obi-controller
```