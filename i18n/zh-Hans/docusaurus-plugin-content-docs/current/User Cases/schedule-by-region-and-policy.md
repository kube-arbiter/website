---
sidebar_position: 4
title: 按标签和策略调度
sidebar_label: 按标签和策略调度
---
Arbiter-Scheduler 支持动态使用不同的调度策略，因此我们可以根据各种场景将 pod 调度到不同的节点。

例如，用户在一个集群上(甚至是在同一个 namespace 上也支持)有开发和生产类型的 pod，他们可能希望使用 MostAllocated 策略来安排开发类型的 pod，以更好地使用资源使用，并使用 LeastAllocated 策略调度生产类型的 pod 来提高性能和稳定性。

整体架构图如下:
![arbiter-use-multiple-score](./img/arbiter-use-multiple-score.png)

用户可以定义一个生产类型的 `Score` CR，专门调度生产类型 pod，我们假定生产类型的 pod 带有 label `app.kubernetes.io/type: prod`：

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

用户还可以定义一个开发类型的 `Score` CR，专门调度开发类型的 pod，我们假定开发类型的 pod 带有 label `app.kubernetes.io/type: dev`：

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

同时使用这两个 `Score` CR，即可实现对不同类型的 pod 采取不同的调度策略。
