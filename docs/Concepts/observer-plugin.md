---
sidebar_position: 4
title: Observer Plugin
sidebar_label: Observer Plugin
---
# Observer Plugin

The main function of `observer` is to watch `observabilityIndicant`, to obtain metrics data periodically, and the plugin to be implemented is to serve as a data provider.

To implement a plugin, you only need to implement a `Grpc` interface. The interface only needs to contain three functions:


- **GetPluginName**
    
    This interface is mainly used to get the plugin name, so that the observer can ignore some crs that it does not pay attention to.

    
- **GetCapabilities**
    
    Get the capabilities supported by the current plugin, for example, get the maximum value of CPU over a period of time, or the average value of memory, etc.
    
    When the customer writes the aggregated value of the indicator to be obtained in cr, the observer will integrate the support ability obtained from the current plugin with what the user writes. For example:
    
    The user needs the aggregation of max and min with the cpu, but the plugin only provides the aggregation capability of min, so when the observer plugin requests data, it will only request the aggregation value of min.

- **GetMetrixs**
    
    Returns aggregated metrics data for the target Pod.
    
After implementing the relevant interface, start the rpc process and deploy it together with the observer program (sidecar mode), the two communicate through the `unix domain socket`.

---

## Grpc Interface definition

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

## Demo

* metric-server
In the arbitor repostiroy using path 'manifests/example/metric'.

* prometheus
In the arbitor repostiroy using path 'manifests/example/prometheus'.

---


## Deploy

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