---
sidebar_position: 1
title: 概览
sidebar_label: 概览
---
## Scenarios of Arbiter
Here are some typical scenarios we're trying to provide possible solutions using arbiter.

1、按节点实际使用资源调度

1）根据节点实际的资源使用情况，比如CPU、内存、磁盘、网络等指标，同待调度服务的对应 limit 值进行比较，

2、按集群、节点分区类型（比如开发、测试、生产）及水位调度，尽量提高资源利用率，释放闲置节点资源

1）基于分区的调度策略

3、对服务按资源敏感打标签

4、基于服务label的节点关联（类似 pod 亲和性，通过非指定标签和 injector 实现）

5、如何处理node资源利用率不均匀的现象（内存利用率远大于cpu利用率）
基于节点 + 服务的实际使用资源的调度

6、节点资源预留
通过调度，允许对某些节点预留一定资源，以备不时之需

7、资源超卖比配置

TBD：
1. 有做节点超配
2. 基于服务优先级的超卖比设置