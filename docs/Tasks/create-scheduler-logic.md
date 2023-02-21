---
sidebar_position: 4
title: Create Scheduler Logic
sidebar_label: Create Scheduler Logic
---
Here are a few  [CRD](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions)s that can affect scheduling:

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

1. Each `Score` CR represents a [Scoring step] in the kube-scheduler ([kube-scheduler-implementation](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/#kube-scheduler-implementation).
2. Multiple `Score` CRs can be created, and when scheduling, all `Score` CRs in the namespace of the pod to be scheduled are used for calculation. The final weighted value is calculated based on the `spec.weight` of each `Score` CR, and the pod is scheduled to the node with the highest weighted value.
   1. If there are no `Score` CRs in the namespace of the pod to be scheduled, the `Score` CRs in the namespace of the Arbiter-Scheduler are used for calculation
   2. And if there are still no `Score` CRs in the Arbiter-Scheduler namespace, the `Score` CRs in the kube-system namespace are used for calculation.
3. `spec.weight` represents the weight of the current `Score` CR to the total result, it is an integer, if it is 0 or negative, it means the current `Score` CR is not valid.
4. `spec.logic` is actually a file that asks for a complete JS function with the name **`score`**.
   1. Feel free to modify this `score` function to meet scheduling needs.
   2. This scoring function replaces the default scoring function in the scheduling framework.
   3. It inputs the pod and node to be scheduled and outputs a number (0 to 100).
   4. The higher the number, the more the pod tends to be scheduled to that node.
   5. `pod` is actually an object in JS, with full manifest information. It is somewhat similar to the result of `kubectl get po -o json`, for example, `pod.labels` will show the pod's labels.
   6. `node` is the same.
   7. Specifically, `node.obi.<OBI-Namespace>-<OBI-Name>` gets an instance of the OBI mentioned in the previous section and requires that the `obi.Spec.TargetRef.Name` of this OBI is also written as the name of the current Name` is also the name of the current node.
