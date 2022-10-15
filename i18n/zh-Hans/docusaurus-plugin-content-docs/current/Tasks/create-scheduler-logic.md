---
sidebar_position: 4
title: 创建调度逻辑
sidebar_label: 创建调度逻辑
---
有一些 [CRD](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions) 可以控制调度：

### Scheduler

```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: Scheduler
metadata:
  name: default
  namespace: kube-system
spec:
  score: show-demo
```

1. 可以创建多个 `Scheduler` CR，但只有与 arbiter-scheduler 同一个 namespace，名称为**`default`**的那一个 CR 会生效。
2. `spec.score` 定义了调度时会使用的 `Score`。

### Score

```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: Score
metadata:
  name: show-demo
  namespace: kube-system
spec:
  logic: |
    function score() {
        // Feel free to modify this `score` function to suit your needs.
        // This score function replaces the default score function in the scheduling framework.
        // It inputs the pod and node to be scheduled, and outputs a number (usually 0 to 100).
        // The higher the number, the more the pod tends to be scheduled to this node.
        // The current example shows the scoring based on the actual resource usage of the node.
        if (node.raw == undefined || node.raw.status == undefined || node.raw.status.capacity == undefined || node.raw.metadata == undefined || node.raw.metadata.name == undefined) {
            // console.error and console.log will print log to the arbiter-scheduler's log.
            console.error('[arbiter-js] cant find node manifest.');
            return 0;
        }
        var name = node.raw.metadata.name;
        var capacity = node.raw.status.capacity;
        if (capacity.cpu == undefined) {
            console.error('[arbiter-js] cant find node cpu capacity in capacity', name);
            return 0;
        }
        var cpuTotal = capacity.cpu * 1000;
        var cpuAvg = cpuTotal * 0.5; // same with obi, default value from capacity
        console.log('[arbiter-js] cpuAvg', cpuAvg);
        if (node.metric == undefined || node.metric.cpu == undefined || node.metric.cpu.avg == undefined) {
            console.error('[arbiter-js] cant find node cpu metric', name);
        } else {
            cpuAvg = node.metric.cpu.avg;  // if has metric, use metric instead
            console.log('[arbiter-js] cpuAvg', cpuAvg);
        }
        var cpuScore = (cpuTotal - cpuAvg) / cpuTotal;
        console.log('[arbiter-js] cpuScore:', cpuScore, 'nodeName', name, 'cpuTotal', cpuTotal, 'cpuAvg', cpuAvg);
        return cpuScore * 100;
    }

```

1. 可以创建多个 `Score` CR，但只有与 arbiter-scheduler 相同的命名空间，并且与 `Scheduler` CR 中的 `spec.score` 相同的名称的 CR 才会生效。
2. `spec.logic` 实际上是一个文件，要求输入一个完整的 JS 函数，名称为**`score`**。
   1. 请随意修改这个 `score'函数，以满足需要。
   2. 这个打分函数取代了调度框架中的默认打分函数。
   3. 它输入要调度的 pod 和节点，并输出一个数字（通常是 0 到 100）。
   4. 数字越大，pod 越倾向于被调度到这个节点。
   5. `pod` 实际上是 JS 中的一个对象，有完整的 manifest 信息。有点类似于 `kubectl get po -o json` 的结果，例如，pod.labels 将显示 pod 的标签。唯一略有不同的是，pod.metric 将显示 obi 中设置的值，例如 pod.metric.cpu 将显示 OBI 中监控当前 pod 的值。这样一来，从 OBI 中获得的数值就可以用于调度了。
   6. `node` 同理。
