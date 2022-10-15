---
sidebar_position: 4
title: 按标签和策略调度
sidebar_label: 按标签和策略调度
---
Use different scheduling policy dynamically, so we can schedule pod to different nodes based on various scenarios, for example, the user has testing, dev, production environment, they may want to schedule pod using NodeResourcesMostAllocated policy for better resource usage, and schedule pod using NodeResourcesLeastAllocated policy for performance and stability.

https://kubernetes.io/docs/reference/scheduling/config/
