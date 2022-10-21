---
sidebar_position: 4
title: Observer 插件
sidebar_label: Observer 插件
---

<!--
# Observer Plugin

The main function of `observer` is to watch `observabilityIndicant`, to obtain metrics data periodically, and the plugin to be implemented is to serve as a data provider.

To implement a plugin, you only need to implement a `GRPC` interface. The interface only needs to contain three functions:
-->
# Observer 插件

observer 主要作用就是 watch observabilityIndicant，周期性获取 metrics 数据，而要实现的 plugin 就是作为数据提供方。

实现 plugin 只需要实现一个 Grpc 的接口即可。接口只要包含三个函数：

<!--
- **GetPluginName**
    
    This interface is mainly used to get the plugin name, so that the observer can ignore some crs that it does not pay attention to.

    
- **GetCapabilities**
    
    Get the capabilities supported by the current plugin, for example, get the maximum value of CPU over a period of time, or the average value of memory, etc.
    
    When the customer writes the aggregated value of the indicator to be obtained in cr, the observer will integrate the support ability obtained from the current plugin with what the user writes. For example:
    
    The user needs the aggregation of max and min with the cpu, but the plugin only provides the aggregation capability of min, so when the observer plugin requests data, it will only request the aggregation value of min.

- **GetMetrixs**
    
    Returns aggregated metrics data for the target Pod.
-->
- **GetPluginName**
    
    该接口主要是用来获取插件名称，以便 oserver 控制器可以忽略某些自己不关注的 cr.

- **GetCapabilities**
    
    获取当前插件支持的能力，例如，获取一段时间cpu的最大值，或者内存的平均值等。
    
    当客户在 cr 中编写要获取的指标聚合值，observer 会根据从当前 plugin 获取到的支持的能力与用户所写的进行整合例如：
    
    用户对与 cpu 需要 ma x和 min 的聚合，但是 plugin 却只提供了 min 的聚合能力，所以 observer 插件在请求数据的时候，只会请求 min 的聚合值。
    
- **GetMetrixs**
    
    返回目标 Pod 的聚合指标数据。
    

<!--
After implementing the relevant interface, start the rpc process and deploy it together with the observer program (sidecar mode), the two communicate through the `unix domain socket`.
-->
实现相关接口后启动 rpc 进程，与 observer 的程序共同部署(sidecar 模式) ，二者通过 `unix domain socket` 进行通信

---

## Grpc 接口定义
[Grpc 接口](https://github.com/kube-arbiter/arbiter/blob/main/pkg/proto/observiability.proto)