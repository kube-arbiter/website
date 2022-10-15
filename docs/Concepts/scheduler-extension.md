---
sidebar_position: 6
title: Scheduling Extension
sidebar_label: Scheduling Extension
---
Use scheduler extension to use the data from OBI for pod scheduling.

## Introduce
This out-of-tree scheduler plugin is based on the [scheduler framework](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/).

This repo provides scheduler plugins that are exercised in large companies.

And we use [goja project](https://github.com/dop251/goja) to support Full ECMAScript 5.1 support.

The main idea is to introduce OBI into scheduling and implement metrics, logging, and tracing based scheduling.
On the other hand, the scheduling logic can be customized by the JS in CRD, giving the user full freedom to play.

## Architecture

![Architecture](./img/scheduler-arch.png "Architecture of arbiter-scheduler")

## Compatibility Matrix

| arbiter Image                              | Supported Kubernetes Version | Arch  |
| ------------------------------------------ | ---------------------------- | ----- |
| docker.io/kubearbiter/scheduler:v0.0.x     | v1.21+                       | AMD64 |
| docker.io/kubearbiter/scheduler:pre-v0.0.x | v1.18 ~ v1.20                | AMD64 |

## Quick example

see [Scheduling by resource usage](../User%20Cases/schedule-by-real-usage.md)
