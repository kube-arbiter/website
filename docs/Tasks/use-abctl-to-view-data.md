---
sidebar_position: 2
title: Mange resources using abctl
sidebar_label: Mange resources using abctl
---
How to manage resouces using abctl command line tool.

# Introduction to the abctl command and its use

## Introduction
`abctl` the only function to get the `ObservabilitIndicant` of a namespace or all namespaces. Shows aggregated data for the resource, such as maximum, minimum, average, etc. 

## Implementation
For the get command, the main idea is to select the target `ObservabilityIndicant` by name or label, then use the aggregation function to calculate the result and print it dynamically aligned using the `tabwriter` library.

## Supported commands
- get  
get is used to obtain an `ObservabilityIndicant` or a set of `ObservabilityIndicant` data. Supported flags include
    
    -m metric, sets the name of the data source to be displayed, such cpu, memory that defined in the OBI. Only one metric name is supported for now.
    
    -a aggregation, to show the aggregated form of the data, e.g. MAX, MIN, etc. Multiple displays are separated by commas.
    
    -n namespace, specify a namespace, default is default, -A means all namespaces
    
    -la=b, get a set of `ObservabilityIndicant` display data in the form of a label. Default is empty, no label is used.

- version  
version print the current version information of the command tool.

## Examples

1. Get the cpu data of an `ObservabilityIndicant` under arbiter-system namespace
This `ObservabilityIndicant` is used to get the cpu usage data of node 21v-tc-zhangsh-team-10. The results are as follows.
```shell
abcli -narbiter=system get prometheus-node-team10-mem-cpu-cost -mcpu
NAME                                   NAMESPACE           KIND    TARGETNAME                METRICNAME    AVG       MAX        MIN
prometheus-node-team10-mem-cpu-cost    arbiter-system      Node    21v-tc-zhangsh-team-10    CPU           532.0m    1954.3m    357.3m
```

2. Get the memeory data of an `ObservabilityIndicant` under arbiter-system namespace
This `ObservabilityIndicant` is used to get the memory usage data of node 21v-tc-zhangsh-team-10. The results are as follows.
```shell
abcli -narbiter-system get prometheus-node-team10-mem-cpu-cost -mmemory
NAME                                   NAMESPACE           KIND    TARGETNAME                METRICNAME    AVG                  MAX                  MIN
prometheus-node-team10-mem-cpu-cost    arbiter-system      Node    21v-tc-zhangsh-team-10    MEMORY        11826966796.6byte    15737708544.0byte    4719964160.0byte
```

3. Get the memeory data of all `ObservabilityIndicant` under arbiter-system namespace
```shell
abcli -narbiter-system get -mmemory 
NAME                                   NAMESPACE           KIND    TARGETNAME                     METRICNAME    AVG                  MAX                  MIN
metric-node-2-cpu-cost                 arbiter-system      Node    21v-tc-zhangsh-team-2          MEMORY        <none>               <none>               <none>
metric-node-cpu-cost                   arbiter-system      Node    21v-tc-zhangsh-team-10         MEMORY        <none>               <none>               <none>
metric-node-mem-cost                   arbiter-system      Node    21v-tc-zhangsh-team-10         MEMORY        5097693184.0byte     5097693184.0byte     5097693184.0byte
metric-pod-cpu-cost                    arbiter      Pod     cpu-cost-1-7db7f54cdd-fnh8k    MEMORY        <none>               <none>               <none>
metric-pod-mem-cost                    arbiter-system      Pod     mem-cost-78ccff7d6b-qrjnn      MEMORY        17534976.0byte       17534976.0byte       17534976.0byte
prometheus-node-team10-mem-cpu-cost    arbiter-system      Node    21v-tc-zhangsh-team-10         MEMORY        11826966796.6byte    15737708544.0byte    4719964160.0byte
prometheus-node-team2-mem-cpu-cost     arbiter-system      Node    21v-tc-zhangsh-team-2          MEMORY        17626560411.3byte    20153466880.0byte    10219134976.0byte
prometheus-node-team3-mem-cpu-cost     arbiter-system      Node    21v-tc-zhangsh-team-3          MEMORY        20794933516.6byte    21525401600.0byte    13934305280.0byte
prometheus-node-team5-mem-cpu-cost     arbiter-system      Node    21v-tc-zhangsh-team-5          MEMORY        22207953332.5byte    24838541312.0byte    13562671104.0byte
prometheus-node-team6-mem-cpu-cost     arbiter-system      Node    21v-tc-zhangsh-team-6          MEMORY        4467027831.5byte     5286428672.0byte     4276830208.0byte
prometheus-node-team7-mem-cpu-cost     arbiter-system      Node    21v-tc-zhangsh-team-7          MEMORY        29356018167.6byte    30424252416.0byte    21016788992.0byte
prometheus-node-team8-mem-cpu-cost     arbiter-system      Node    21v-tc-zhangsh-team-8          MEMORY        7753919571.9byte     8032522240.0byte     7499304960.0byte
prometheus-node-team9-mem-cpu-cost     arbiter-system      Node    21v-tc-zhangsh-team-9          MEMORY        6174579594.5byte     7099314176.0byte     4890648576.0byte
```
Some of the data here is shown as `<none>`, which means there is no data.


4. View MAX, MIN data only
```shell
abcli -narbiter-system get prometheus-node-team10-mem-cpu-cost -mcpu -aMAX,MIN
NAME                                   NAMESPACE           KIND    TARGETNAME                METRICNAME    MAX        MIN
prometheus-node-team10-mem-cpu-cost    arbiter-system      Node    21v-tc-zhangsh-team-10    CPU           1954.3m    357.3m
```

5. View tool version
```shell
abcli version
v0.0.0
```

