---
sidebar_position: 2
title: 端到端测试
sidebar_label: 端到端测试
---

<!--How to do e2e test to verify your code.-->
arbiter 的整体测试分为代码正确性检查和 e2e 测试。
代码正确性检查包括代码格式检查、CRD 验证、文件是否包含版权等。
e2e 测试保证了 arbiter 可以在多个 k8s 版本中正常工作。

## 代码正确性验证

你可以使用 [验证全部](#验证全部) 执行所有验证，或执行单独验证。

### 验证全部

将执行所有检查，并在出现错误的地方给出明显的提示。

```shell
cd arbiter;
./hack/verify-all.sh
```

### 验证代码生成

验证定义的结构体是否正常的生成了 `client`, `deepcopy` 以及其他的方法。

```shell
cd arbiter;
./hack/verify-codegen.sh
```

### 验证 CRD 生成

验证当前的 CRD 结构是否与定义的结构体是一致的。

```shell
cd arbiter;
./hack/verify-crdgen.sh
```

### 验证 golangci lint

主要确保代码正常格式化，以及代码的可读性。

```shell
cd arbiter;
./hack/verify-golangci-lint.sh
```

### 验证 Copyright

检查每个文件是否正常的包含了 copyright 内容。

```shell
cd arbiter;
./hack/verify-copyright.sh
```

### 验证 shell 格式

验证 shell 脚本的内容格式是否正确

```shell
cd arbiter;
./hack/verify-shfmt.sh
```

### 验证 Vendor 内容

验证代码依赖是否正常更新。

```shell
cd arbiter;
./hack/verify-vendor.sh
```

## e2e 测试

e2e 测试可以在本地执行，也可以在提交代码后通过 github action 来执行。

### 本地测试

本地测试有很多原因导致一些镜像无法正常获取，你可以在本地准备好镜像并将其导入到 kind 集群。所需镜像包括：

- registry.k8s.io/kube-state-metrics/kube-state-metrics:v2.5.0
- k8s.gcr.io/metrics-server/metrics-server:v0.6.1


本地执行 e2e 分为以下三步

1. 安装 Kind

[Kind 安装](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)

2. 准备环境

    目前支持的 K8S 最低版本是 `1.18`, 所以环境变量的可选值包括 `v1.18`, `v1.19`, `v1.20`, `v1.21`, `v1.22`, `v1.23`, `v1.24`, `v1.25`. 

    ```
    # switch to root user.
    sudo su

    cd arbiter;
    export K8S_VERSION=v1.23; bash tests/prepare-k8s.sh
    ```

3. 执行测试

    ```shell
    bash tests/install-infra.sh
    ```

## 通过 Github

你只需要把代码推到 github，github action会自动准备环境执行测试。
