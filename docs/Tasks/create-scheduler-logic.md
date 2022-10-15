---
sidebar_position: 4
title: Create Scheduler Logic
sidebar_label: Create Scheduler Logic
---
Here are a few  [CRD](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions)s that can affect scheduling:

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

1. You can create more than one, but only the `Scheduler` with the same namespace as the arbiter-scheduler, with the name **`default`**, will take effect.
2. `spec.score` defines which `Score` the arbiter-scheduler uses.

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

1. Multiple `Score` CR can be created, but only with the same namespace as the arbiter-scheduler and the same name as the `spec.score` in `Scheduler` CR will take effect.
2. `spec.logic` is actually a file that expects you to enter a full JS function with the name **`score`**.
   1. Feel free to modify this `score` function to suit your needs.
   2. This score function replaces the default score function in the scheduling framework.
   3. It inputs the pod and node to be scheduled, and outputs a number (usually 0 to 100).
   4. The higher the number, the more the pod tends to be scheduled to this node.
   5. `pod` is actually an object in JS, with full manifest information.Somewhat similar to the result of `kubectl get po -o json`, for example, pod.labels will show pod's labels.The only slight difference is that pod.metric will show the values set in obi, for example pod.metric.cpu will show the values in OBI that monitor the current pod. This way, the values obtained from OBI can be used in the scheduling.
   6. `node` is same with `pod`.
