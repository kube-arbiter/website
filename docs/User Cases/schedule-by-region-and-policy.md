---
sidebar_position: 4
title: Scheduling by label and policy
sidebar_label: Scheduling by label and policy
---
Use different scheduling policy dynamically, so we can schedule pod to different nodes based on various scenarios, for example, the user has testing, dev, production environment, they may want to schedule pod using NodeResourcesMostAllocated policy for better resource usage, and schedule pod using NodeResourcesLeastAllocated policy for performance and stability.

https://kubernetes.io/docs/reference/scheduling/config/
