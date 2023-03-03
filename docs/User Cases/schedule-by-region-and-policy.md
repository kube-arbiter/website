---
sidebar_position: 4
title: Scheduling by label and policy
sidebar_label: Scheduling by label and policy
---
Arbiter-Scheduler supports multiple scheduling policies configured by users and dynamically uses different scheduling policies depending on the pod, so we can schedule pods to different nodes according to various scenarios.

For example, if a user has both development and production type pods on a cluster (Even in the same namespace is supported
), they may want to use the MostAllocated policy to schedule the development type pods for better resource usage and the LeastAllocated policy to schedule the production type pods for better performance and stability.

This is the overall architecture:
![arbiter-use-multiple-score](./img/arbiter-use-multiple-score.png)

Users can define a production type `Score` CR that is dedicated to scheduling production type pods, and we assume that production type pods have the label `app.kubernetes.io/type: prod`:

```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: Score
metadata:
  name: least-allocated 
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
        var podLabels = pod.raw.metadata.labels;
        if (podLabels['app.kubernetes.io/type'] != 'prod') {
            return 0;
        }
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

The user can also define a development type `Score` CR that is dedicated to dispatching development type pods, and we assume that development type pods come with the label `app.kubernetes.io/type: dev`:

```yaml
apiVersion: arbiter.k8s.com.cn/v1alpha1
kind: Score
metadata:
  name: most-allocated
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
        var podLabels = pod.raw.metadata.labels;
        if (podLabels['app.kubernetes.io/type'] != 'dev') {
            return 0;
        }
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
        // MostAllocated
        var cpuScore = (nodeCPUReq + podCPUReq) / nodeCPUCap;
        console.log('[arbiter-js] podName:', podNS+'/'+podName, 'nodeName', nodeName, 'cpuScore:', cpuScore, 'nodeCPUCap', nodeCPUCap, 'nodeCPUReq', nodeCPUReq, 'podCPUReq', podCPUReq);
        var memScore = (nodeMemReq + podMemReq) / nodeMemCap;
        console.log('[arbiter-js] podName:', podNS+'/'+podName, 'nodeName', nodeName, 'memScore:', memScore, 'nodeMemCap', nodeMemCap, 'nodeMemReq', nodeMemReq, 'podMemReq', podMemReq); 
        return (cpuScore + memScore) / 2 * 100;
    }
```

By using both `Score` CRs, you can implement different scheduling policies for different types of pods.
