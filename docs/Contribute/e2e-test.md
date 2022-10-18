---
sidebar_position: 3
title: e2e Test
sidebar_label: e2e Test
---

<!--How to do e2e test to verify your code.-->

The overall test of arbiter is divided into code correctness check and e2e test.  
The code correctness check include code formatting checks, CRD verification, and whether the file contains copyright, etc.  
The e2e test ensures that the arbiter can work normally in multiple versions of k8s.

## Code Correctness Check
You can perform all verifications with [verify-all](#verify-all), or perform individual verifications.

### Verify All
All checks will be performed, and obvious hints will be given where errors are made.

```shell
cd arbiter;
./hack/verify-all.sh
```

### Verify codegen
It will check whether the defined structure normally generates `client`, `deepcopy` and other methods.

```shell
cd arbiter;
./hack/verify-codegen.sh
```

### Verify crdgen
Will check whether the current crd structure is consistent with the type defined.

```shell
cd arbiter;
./hack/verify-crdgen.sh
```

### Verify golangci
golangci-lint mainly ensures that the code is in a unified format and ensures the readability of the code.

```shell
cd arbiter;
./hack/verify-golangci-lint.sh
```

### Verify Copyright
Check that the code has the copyright added correctlys.

```shell
cd arbiter;
./hack/verify-copyright.sh
```

### Verify Shell Format
Check if the code format of the shell script is correct.

```shell
cd arbiter;
./hack/verify-shfmt.sh
```

### Verify Vendor
Check if code dependencies are updated normally.

```shell
cd arbiter;
./hack/verify-vendor.sh
```

## e2e test
e2e tests can be executed locally or through github actions after submitting code.

### From Local
There may be cases where the image cannot be obtained for local testing. You can prepare the image locally and import it to the kind cluster. Required images include:

- registry.k8s.io/kube-state-metrics/kube-state-metrics:v2.5.0
- k8s.gcr.io/metrics-server/metrics-server:v0.6.1

Local execution of e2e is divided into three steps:

1. Install Kind
[Kind Installation](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)

2. Prepare the environment
The current minimum supported version of arbiter is `1.18`, so for the optional value of the environment variable `K8S_VERSION` is `v1.18`, `v1.19`, `v1.20`, `v1.21`, `v1.22`, `v1.23`, `v1.24`, `v1.25`. 

    ```
    # switch to root user.
    sudo su

    cd arbiter;
    export K8S_VERSION=v1.23; bash tests/papre-k8s.sh
    ```

3. Execute the test
    ```shell
    bash tests/install-infra.sh
    ```

### From Github
You just need to push the code to github and the github action will automatically create the environment and execute the tests.