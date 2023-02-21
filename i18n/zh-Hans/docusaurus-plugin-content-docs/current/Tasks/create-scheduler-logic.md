---
sidebar_position: 4
title: 创建调度逻辑
sidebar_label: 创建调度逻辑
---
有一些 [CRD](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions) 可以控制调度：

### Score

```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: Score
metadata:
  name: least-allocated
  namespace: kube-system
spec:
  weight: 100
  logic: |
    // Feel free to modify Score.spec.logic to suit your needs.
    // Must include a function named `score`, this score function replaces the 
    // default score function in the scheduling framework. It inputs the pod and
    // node to be scheduled, and outputs a number (0 to 100). The higher the 
    // number, the more the pod tends to be scheduled to this node. 
    // The following example shows the JS version of default parameter of the
    // algorithm `LeastAllocated` in kubernetes scheduling.
    function getPodCpuMemReq() {
        const DefaultCPUReq = 100; // 0.1 core
        const DefaultMemReq = 200 * 1024 * 1024; // 200MB
        var podContainer = pod.raw.spec.containers;
        if (podContainer == undefined) {
            return [DefaultCPUReq, DefaultMemReq];
        }
        var cpuReq = 0;
        var memReq = 0;
        for (var i = 0; i < podContainer.length; i++) {
            var resources = podContainer[i].resources;
            if (resources.requests == undefined) {
                cpuReq += DefaultCPUReq;
                memReq += DefaultMemReq;
                continue
            }
            cpuReq += cpuParser(resources.requests.cpu);
            memReq += memParser(resources.requests.memory);
        }
        var podInitContainers = pod.raw.spec.initContainers;
        if (podInitContainers == undefined) {
            return [cpuReq, memReq];
        }
        var initCPUReq = 0;
        var initMemReq = 0;
        for (var i = 0; i < podInitContainers.length; i++) {
            var resources = podInitContainers[i].resources;
            if (resources.requests == undefined) {
                initCPUReq = DefaultCPUReq;
                initMemReq = DefaultMemReq;
            } else {
                initCPUReq = cpuParser(resources.requests.cpu);
            }
            if (initCPUReq > cpuReq) {
                cpuReq = initCPUReq;
            }
            if (initMemReq > memReq) {
                memReq = initMemReq;
            }
        }
        return [cpuReq, memReq];
    }

    function cpuParser(input) {
        const milliMatch = input.match(/^([0-9]+)m$/);
        if (milliMatch) {
            return parseInt(milliMatch[1]);
        }

        return parseFloat(input) * 1000;
    }

    function memParser(input) {
        const memoryMultipliers = {
            k: 1000, M: 1000 ** 2, G: 1000 ** 3, Ki: 1024, Mi: 1024 ** 2, Gi: 1024 ** 3,
        };
        const unitMatch = input.match(/^([0-9]+)([A-Za-z]{1,2})$/);
        if (unitMatch) {
            return parseInt(unitMatch[1], 10) * memoryMultipliers[unitMatch[2]];
        }

        return parseInt(input, 10);
    }

    function score() {
        var podReq = getPodCpuMemReq();
        var podName = pod.raw.metadata.name;
        var podNS = pod.raw.metadata.namespace;
        var podCPUReq = podReq[0];
        var podMemReq = podReq[1];
        var nodeName = node.raw.metadata.name;
        var nodeCapacity = node.raw.status.allocatable;
        var nodeCPUCap = cpuParser(nodeCapacity.cpu);
        var nodeMemCap = memParser(nodeCapacity.memory);
        var nodeCPUReq = parseInt(node.cpuReq);
        var nodeMemReq = parseInt(node.memReq);
        // LeastAllocated
        var cpuScore = (nodeCPUCap - nodeCPUReq - podCPUReq) / nodeCPUCap;
        console.log('[arbiter-js] podName:', podNS+'/'+podName, 'nodeName', nodeName, 'cpuScore:', cpuScore, 'nodeCPUCap', nodeCPUCap, 'nodeCPUReq', nodeCPUReq, 'podCPUReq', podCPUReq);
        var memScore = (nodeMemCap - nodeMemReq - podMemReq) / nodeMemCap;
        console.log('[arbiter-js] podName:', podNS+'/'+podName, 'nodeName', nodeName, 'memScore:', memScore, 'nodeMemCap', nodeMemCap, 'nodeMemReq', nodeMemReq, 'podMemReq', podMemReq); 
        return (cpuScore + memScore) / 2 * 100;
    }

```

1. 每个 `Score` CR 都代表了 kube-scheduler 中的一个[ Scoring 步骤](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/#kube-scheduler-implementation)。
2. 可以创建多个 `Score` CR，当调度时，会查找待调度 pod 所在的 namespace 的所有 `Score` CR 参与计算，然后根据每个 `Score` CR 的 `spec.weight` 权重，算出最后的加权值，进行调度，待调度的 node 的加权值越大，越可能将 pod 调度到这个 node。
   1. 如果待调度 pod 所在 namespace 没有 `Score` CR，那么接下来寻找 Arbiter-Scheduler 所在 namespace 的 `Score` CR 参与计算。
   2. 如果 Arbiter-Scheduler 所在 namespace 依旧没有 `Score` CR，最后回退到寻找 kube-system 下的 `Score` CR 参与计算。
3. `spec.weight` 代表当前 `Score` CR 的计算结果占总结果的权重值，为整数，如果为 0 或者负数，代表当前 `Score` CR 不生效。
4. `spec.logic` 实际上是一个文件，要求输入一个完整的 JS 函数，名称为**`score`**。
   1. 请随意修改这个 `score` 函数，以满足调度需要。
   2. 这个打分函数取代了调度框架中的默认打分函数。
   3. 它输入要调度的 pod 和 node，并输出一个数字（0 到 100）。
   4. 数字越大，pod 越倾向于被调度到这个 node。
   5. `pod` 实际上是 JS 中的一个对象，有完整的 manifest 信息。有点类似于 `kubectl get po -o json` 的结果，例如，`pod.labels` 将显示 pod 的标签。
   6. `node` 同理。
   7. 可以在调度中获取 OBI 数据，实现基于 OBI 数据的调度，具体来说，`node.obi.<OBI-Namespace>-<OBI-Name>` 可以获取前面章节提到的一个 OBI 实例，要求这个 OBI 的 `obi.Spec.TargetRef.Name` 也写为当前 node 的名称。
