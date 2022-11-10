---
sidebar_position: 1
title: Introduction
sidebar_label: Introduction
---

#### An extendable scheduling and scaling tool based on Kubernetes

<div style={{textAlign:"center"}}>
    <img src="/img/arbiter-logo.png" width="160" valign="center"/>
</div>

Arbiter is an extendable scheduling and scaling tool built on Kubernetes. It’ll aggregate various types of data and take them into account when managing, scheduling or scaling the applications in the cluster. It can facilitate K8S users to understand and manage resources deployed in the cluster, and then use this tool to improve the resource utilization and runtime efficiency of the applications.

The input can be metrics from your monitoring system, logs from your logging system or traces from your tracing system. Then arbiter can abstract the data to a unified format，so it can be consumed by scheduler, autoscaler or other controllers.
Arbiter can also add labels to your applications based on how the administrator defines the classification and the data it collects. User can understand the characteristics of each application and the overall placement across the cluster, and then tune the factors that can improve it.

The high level architecture of this project:
![图 1](./img/525442b2b566cea76282975aac13d3f8a6eaf5bbdc50fedcfdab3d10f08fa44e.png)

The focus of current project is to integrate with various observability tools and generate the indicator that can be used by Kubernetes scheduler, scaler (HPA / VPA) or other extended executors, to make it more easy to enhance and extend for different scenarios.

##### Quick Start
See our documentation on [Quick Start](./Quick%20Start/install.md)

##### View data using the dashboard
You can also install the dashboard for better visualization, will add later.

#####  Features
1. Get the cluster metrics for resource usage, such as cluster capacity、system resource usage，reserved resource and actual resource usage
2. Usage trend of various resources
3. Grafana template to show cluster metrics
4. Scheduling based on actual resource usage of node
5. Classify the pod/deployment/statefulset/service based on the resource sensitivity and the baseline defined by the administrator
6. Support grouping of nodes for resource isolation
7. Configurable overcommit of pod and node resources

##### Scenarios
Here are some typical scenarios we're trying to provide possible solutions using arbiter, refer to [User Cases](category/user-cases)

## Build and contribute Arbiter
If you want to build Arbiter, refer to [Contribute](category/contribute)

## Roadmap
You can get what we're doing and plan to do here.
#### v0.1 - done
1. Define what's OBI(Observability Indicator) that can convert metrics/logging/tracing to an unified indicator, so we can use OBI for scheduler and scaler.
2. Introduce a context to let user extend scheduler easily using Javascript, and let user write Javascript to implement schedule logic.
3. Create a plugin framework that can integrate with different observability tools as input and generate OBI output, such as metric-server, prometheus etc...
4. Create a command line tool called 'abctl' to get OBI for K8S resources
5. Create sample use cases using current framework to show how it can work, including:
* Schedule Pod based on actual resource usage on nodes
* Schedule Pod based on node labels using different schedule policy
* Tag the pod/service for different resource sensitivity
* Schedule based on pod and node names/labels without define node affinity
* Reserve node resource in the scheduler extension
* Provide executor to demo how to use OBI to support various use cases.

#### v0.2 - working on now
1. Use kube-scheduler-simulator to evaluate the effect of different schedule policy
2. Support logging indicator in the observer plugins
3. Enhance the executor framework, so the user can easily define actions based on the results of OBI.
4. Allow to use Kubernetes scheduler policy dynamically in scheduler extension
5. Add more samples to generate OBI to introduce popular indicators, so the user can use directly

#### v0.3 - Future plans
1. Support tracing indicator in the observer plugins
2. Integrate with more monitoring/logging/tracing tools for more coverage
3. Improve the timeliness of data for better scheduling or scaling
4. Use time serial database to show the data trend for better visualization
5. Integrate with existing Scheduler, HPA and VPA from open source community, so the user can use it out-of-the-box

## Support
If you need support, start with the troubleshooting guide, or contact us using wechat below:

TODO: ADD wechat & dingtalk QR code
