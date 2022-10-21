---
sidebar_position: 1
title: 架构总览
sidebar_label: 架构总览
---

<!-- Cover the overall technical architecture of Arbiter. -->
这里对 Arbiter 的整体技术架构进行介绍。

<!--
## Components
Basically, it consists of 4 components by now, observer, scheduler, executor and a command line tool called 'abctl'.

### Observer
Observer is used to collect various data(metric/log/trace), generate the OBI object, and stored as CRDs inside Kubernetes.

Refer to the [Observer](./observer.md) for details.
-->
## 组件
基本上，它现在由 4 个组件组成，observer、scheduler、executor 和一个名为 “abctl” 的命令行工具。

### Observer
Observer 用于收集各种数据（metric/log/trace），生成 OBI 对象，并作为 CRD 存储在 Kubernetes 集群内。

详细信息请参阅 [Observer](./observer.md)。

<!--
### Scheduler Extension
Scheduler is an alternative scheduler built on top of Kubernetes default scheduler. It contains the default scheduler of Kubernetes and provide a extension point for Arbiter to extend.

For each Arbiter scheduler extension, it'll provide a context for pod scheduling, and can refer to the OBI object above. So it'll have both static and runtime data, including pod, node, metric/log/tracing from OBI, and allow user to write scheduing logic using javascript on their purpose.

Refer to the [Scheduler Extension](./scheduler-extension.md) for details.
-->
### Scheduler 扩展
Scheduler 是构建在 Kubernetes 默认调度程序之上的替代调度程序。它包含了 Kubernetes 的默认调度器，并为 Arbiter 提供了一个扩展点来扩展。

对于每个 Arbiter 调度器扩展，它都会提供一个用于 Pod 调度的上下文，并且可以参考上面的 OBI 对象。
因此，它将具有静态和运行时数据，包括来自 OBI 的 Pod、节点、指标/日志/跟踪，并允许用户使用 javascript 编写调度逻辑。

详细信息参考 [Scheduler Extension](./scheduler-extension.md)。

<!--
### Executor
Executor is the action trigger if any rule is satisfied. Let user to invoke other service or write custom controller based on events from executor.

Refer to the [Executor](./executor.md) for details.

### abctl tool
A tool to let developer or administrator to view resource data from Arbiter more easy, and can also integrate this tool to do automatic tasks from custom scripts.
-->
### Executor
如果满足任何规则，Executor 就是动作触发器。让用户根据来自执行程序的事件调用其他服务或编写自定义控制器。

详细信息参考 [Executor](./executor.md)。

### abctl 工具
一个让开发人员或管理员更轻松地查看来自 Arbiter 的资源数据的工具，并且还可以集成此工具以从自定义脚本执行自动任务。

<!--

## Communication between components
Here is the relationship between the components above.

![Interaction](./img/service-communication.png)
-->
## 组件间通信
组件之间的关系如下。

![相互作用](./img/service-communication.png)
