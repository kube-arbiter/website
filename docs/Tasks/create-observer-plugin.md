---
sidebar_position: 4
title: Create Observer Plugin
sidebar_label: Create Observer Plugin
---

As mentioned in the installation documentation, all that is needed to implement an arbiter plugin is to implement the [3 interface of GRPC](https://github.com/kube-arbiter/arbiter/blob/main/pkg/proto/observiability.proto).

---

### Implementation introduction
[Observer Plugin](../Concepts/observer-plugin.md)

---

### Deploy

1. Create namespace

    ```shell
    kubectl create ns arbiter-system
    ```

2. Configuring RBAC  
`ClusterRole` contains the basics needed to implement plugins, if you need more permissions, please adjust the definition of ClusterRole.

    ```yaml
    apiVersion: v1
    kind: ServiceAccount
    metadata:
    name: observability
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRole
    metadata:
    name: observability
    rules:
    - nonResourceURLs:
        - /metrics
        verbs:
        - get
    - apiGroups:
        - arbiter.k8s.com.cn
        resources:
        - observabilityindicants
        verbs:
        - '*'
    - apiGroups:
        - apps
        resources:
        - deployments
        - statefulsets
        verbs:
        - '*'
    - apiGroups:
        - ""
        - metrics.k8s.io
        resources:
        - pods
        - services
        - services/proxy
        - nodes
        - events
        verbs:
        - '*'
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRoleBinding
    metadata:
    name: observability
    subjects:
    - kind: ServiceAccount
        name: observability
        namespace: arbiter-system
    roleRef:
    kind: ClusterRole
    name: observability
    apiGroup: rbac.authorization.k8s.io
    ```

3. Deploy
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
    name: observer-metric-server
    spec:
    selector:
        matchLabels:
        app: observer-metric-server
    template:
        metadata:
        labels:
            app: observer-metric-server
        spec:
        containers:
            - image: # config your image
            name: metric-server-plugin
            resources:
                limits:
                cpu: 1
                memory: 128Mi
                requests:
                cpu: 100m
                memory: 64Mi
            volumeMounts:
                - mountPath: /var/run
                name: sock-volume
            - command:
                - observer
            image: kubearbiter/observer:v0.2.0
            name: obi-controller
            resources:
                limits:
                cpu: 1
                memory: 128Mi
                requests:
                cpu: 100m
                memory: 64Mi
            volumeMounts:
                - mountPath: /var/run
                name: sock-volume
        serviceAccount: observability
        serviceAccountName: observability
        volumes:
            - emptyDir: {}
            name: sock-volumes
    ```

### Check Pod Status

```shell
➜  kubectl get po -narbiter-system
NAME                                      READY   STATUS             RESTARTS   AGE
observer-metric-server-7f4749d7fd-qrwtm   2/2     Running            0          34s
```

---

### Examples
Below are examples of our implementations, which can be adapted to your needs for secondary development.

- [observer-metric-server](https://github.com/kube-arbiter/arbiter-plugins/observer-plugins/metric-server)

- [prometheus](https://github.com/kube-arbiter/arbiter-plugins/observer-plugins/prometheus)
