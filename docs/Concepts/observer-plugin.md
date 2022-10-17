---
sidebar_position: 4
title: Observer Plugin
sidebar_label: Observer Plugin
---
# Observer Plugin

The main function of `observer` is to watch `observabilityIndicant`, to obtain metrics data periodically, and the plugin to be implemented is to serve as a data provider.

To implement a plugin, you only need to implement a `GRPC` interface. The interface only needs to contain three functions:


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
[GRPC Interface](https://github.com/kube-arbiter/arbiter/blob/main/pkg/proto/observiability.proto)
