---
sidebar_position: 2
title: 使用 abctl 查看资源
sidebar_label: 使用 abctl 查看资源
---
How to manage resouces using abctl command line tool.

# abctl 命令工具介绍以及使用

## 说明
`abctl` 唯一的功能功能获取某个 namespace 或者所有 namespace 的 `ObservabilitIndicant`。展示该资源的聚合数据，例如最大，最小，平均值等。

## 实现方式
对于 get 命令，主要的思路就是根据名称或者label选择出目标的 `ObservabilityIndicant`，然后使用聚合函数计算出结果，通过 `tabwriter` 库进行动态对齐打印。
## 支持的命令
- get  
get 用来获取一个或者一组 `ObservabilityIndicant` 数据。支持的参数包括
    - -m metric, 设置要展示的数据源名称，例如 cpu，memory 等。不支持多个
    - -a aggregation, 用来展示数据的聚合形式，例如 MAX,MIN等。 展示多个通过逗号分隔。
    - -n namespace, 指定某个namespace，默认是 default，-nA 表示所有的 namespace
    - -la=b， 使用label的形式获取一组 `ObservabilityIndicant` 展示数据。默认是空，不使用label。

- version  
version 打印当前命令工具的版本信息

## 使用样例
1. 获取 arbiter namespace 下一个 `ObservabilityIndicant` 的 cpu 数据
这个 `ObservabilityIndicant` 用来获取节点 21v-tc-zhangsh-team-10 的 cpu 使用数据。结果如下
```shell
➜  amd64 git:(cli-column) ✗ ./cli -narbiter get prometheus-node-team10-mem-cpu-cost -mcpu
NAME                                   NAMESPACE    KIND    TARGETNAME                METRICNAME    AVG       MAX        MIN
prometheus-node-team10-mem-cpu-cost    arbiter      Node    21v-tc-zhangsh-team-10    CPU           532.0m    1954.3m    357.3m
```

2. 获取 arbiter namespace 下一个 `ObservabilityIndicant` 的 memory 数据
获取节点 21v-tc-zhangsh-team-10 的内存使用数据，结果如下。
```shell
➜  amd64 git:(cli-column) ✗ ./cli -narbiter get prometheus-node-team10-mem-cpu-cost -mmemory
NAME                                   NAMESPACE    KIND    TARGETNAME                METRICNAME    AVG                  MAX                  MIN
prometheus-node-team10-mem-cpu-cost    arbiter      Node    21v-tc-zhangsh-team-10    MEMORY        11826966796.6byte    15737708544.0byte    4719964160.0byte
```

3. 获取 arbiter namespace 下所有 `ObservabilityIndicant` 的 memory 数据 
```shell
➜  amd64 git:(cli-column) ✗ ./cli -narbiter get -mmemory 
NAME                                   NAMESPACE    KIND    TARGETNAME                     METRICNAME    AVG                  MAX                  MIN
metric-node-2-cpu-cost                 arbiter      Node    21v-tc-zhangsh-team-2          MEMORY        <none>               <none>               <none>
metric-node-cpu-cost                   arbiter      Node    21v-tc-zhangsh-team-10         MEMORY        <none>               <none>               <none>
metric-node-mem-cost                   arbiter      Node    21v-tc-zhangsh-team-10         MEMORY        5097693184.0byte     5097693184.0byte     5097693184.0byte
metric-pod-cpu-cost                    arbiter      Pod     cpu-cost-1-7db7f54cdd-fnh8k    MEMORY        <none>               <none>               <none>
metric-pod-mem-cost                    arbiter      Pod     mem-cost-78ccff7d6b-qrjnn      MEMORY        17534976.0byte       17534976.0byte       17534976.0byte
prometheus-node-team10-mem-cpu-cost    arbiter      Node    21v-tc-zhangsh-team-10         MEMORY        11826966796.6byte    15737708544.0byte    4719964160.0byte
prometheus-node-team2-mem-cpu-cost     arbiter      Node    21v-tc-zhangsh-team-2          MEMORY        17626560411.3byte    20153466880.0byte    10219134976.0byte
prometheus-node-team3-mem-cpu-cost     arbiter      Node    21v-tc-zhangsh-team-3          MEMORY        20794933516.6byte    21525401600.0byte    13934305280.0byte
prometheus-node-team5-mem-cpu-cost     arbiter      Node    21v-tc-zhangsh-team-5          MEMORY        22207953332.5byte    24838541312.0byte    13562671104.0byte
prometheus-node-team6-mem-cpu-cost     arbiter      Node    21v-tc-zhangsh-team-6          MEMORY        4467027831.5byte     5286428672.0byte     4276830208.0byte
prometheus-node-team7-mem-cpu-cost     arbiter      Node    21v-tc-zhangsh-team-7          MEMORY        29356018167.6byte    30424252416.0byte    21016788992.0byte
prometheus-node-team8-mem-cpu-cost     arbiter      Node    21v-tc-zhangsh-team-8          MEMORY        7753919571.9byte     8032522240.0byte     7499304960.0byte
prometheus-node-team9-mem-cpu-cost     arbiter      Node    21v-tc-zhangsh-team-9          MEMORY        6174579594.5byte     7099314176.0byte     4890648576.0byte
```
这里的有些数据显示 `<none>`, 表示没有数据。


4. 只查看 MAX, MIN 数据
```shell
➜  amd64 git:(cli-column) ✗ ./cli -narbiter get prometheus-node-team10-mem-cpu-cost -mcpu -aMAX,MIN
NAME                                   NAMESPACE    KIND    TARGETNAME                METRICNAME    MAX        MIN
prometheus-node-team10-mem-cpu-cost    arbiter      Node    21v-tc-zhangsh-team-10    CPU           1954.3m    357.3m
```

5. 查看工具版本
```shell
➜  amd64 git:(cli-column) ✗ ./cli version
v0.0.0
```

