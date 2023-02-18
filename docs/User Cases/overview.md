---
sidebar_position: 1
title: Overview
sidebar_label: Overview
---
## Scenarios of Arbiter
Here are some typical scenarios we're trying to provide possible solutions using arbiter.


1. Scheduling by actual resource usage of nodes

1) Compare the actual resource usage of nodes, such as CPU, memory, disk, network and other indicators, with the corresponding limit values of the services to be scheduled.

2. Scheduling by cluster, node partition type (e.g. development, test, production) and water level to maximize resource utilization and release idle node resources

1) Partition-based scheduling strategy

3. Labeling of services by resource sensitivity

4. node association based on service label (similar to pod affinity, achieved by unspecified labels and injector)

5. How to deal with uneven node resource utilisation (memory utilisation is much higher than cpu utilisation)

Scheduling of actual resource usage based on nodes + services

6. node resource reservation

Scheduling allows for certain resources to be reserved for certain nodes in case of emergencies

7. Resource oversell ratio configuration

TBD：
1. Support grouping of nodes for resource isolation
2. Configurable overcommit of pod and node resources
