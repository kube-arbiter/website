---
sidebar_position: 1
title: 开始为 Arbiter 贡献代码
sidebar_label: 开始为 Arbiter 贡献代码
---
<!-- # Prepare and start contribute to Arbiter 
**Welcome to Arbiter!** -->
# 准备并开始为 Arbiter 做贡献
**欢迎来到 Arbiter!**

<!-- 
We encourage you to help out by reporting issues, improving documentation, fixing bugs, or adding new features.
-->
我们鼓励你通过报告问题、改进文档、修复错误或添加新功能来提供帮助。

<!-- 
Please also take a look at our [code of conduct](https://github.com/kube-arbiter/arbiter/blob/main/CODE_OF_CONDUCT.md), which details how contributors are expected to conduct themselves as part of the Arbiter community. 
-->

也请看看我们的[行为准则](https://github.com/kube-arbiter/arbiter/blob/main/CODE_OF_CONDUCT.md)，其中详细说明了贡献者作为 Arbiter 社区的一员应如何行事。

<!-- 
We made Arbiter open-source to empower developers to fix and extend the product to better meet their needs. Nothing thrills us more than people so passionate about the product that they're willing to spend their own time to learn the codebase and give back to the community. We created this doc, so we can support contributors in a way that doesn't sacrifice precious bandwidth that we use to serve our users and otherwise meet our community goals. 
-->
我们将 Arbiter 开源，以使开发者能够修复和扩展产品，更好地满足他们的需求。
没有什么比人们对产品的热情更让我们兴奋，他们愿意花自己的时间来学习代码库并回馈社区。
我们创建了这个文档，所以我们可以在不牺牲宝贵带宽的情况下支持贡献者，而这些带宽是我们用来服务用户和实现社区目标的。

<!-- ## Reporting issues -->
## 报告问题

<!-- 
To be honest, we regard every user of Arbiter as a very kind contributor. After experiencing Arbiter, you may have some feedback for the project. Then feel free to open an issue. 
-->

老实说，我们将 Arbiter 的每一位用户都视为非常善良的贡献者。体验 Arbiter 后，你可能对这个项目有一些反馈。那么，请随时打开一个问题。

<!-- There are lots of cases when you could open an issue: -->
有很多情况可以报告问题：

- bug report
- feature request
- performance issues
- feature proposal
- feature design
- help wanted
- doc incomplete
- test improvement
- any questions on project
- and so on

<!-- 
Also we must remind that when filing a new issue, please remember to remove the **sensitive data** from your post.
*Sensitive data could be password, secret key, network locations, private business data and so on.* 
-->

另外我们必须提醒，在提交新问题时，请记住从你的帖子中删除**敏感数据**。
*敏感数据可能是密码、密钥、网络位置、私人业务数据等。*

<!-- ## Code and doc contribution -->
## 代码和文档贡献

<!-- Every action to make Arbiter better is encouraged. On GitHub, every improvement for Arbiter could be via a PR (short for pull request). -->

鼓励每一个让 Arbiter 变得更好的行动。在 GitHub 上，Arbiter 的每一项改进都可以通过 PR（pull request 的缩写）来实现。

- If you find a typo, try to fix it!
- If you find a bug, try to fix it!
- If you find some redundant codes, try to remove them!
- If you find some test cases missing, try to add them!
- If you could enhance a feature, please DO NOT hesitate!
- If you find code implicit, try to add comments to make it clear!
- If you find code ugly, try to refactor that!
- If you can help to improve documents, it could not be better!
- If you find document incorrect, just do it and fix that!
- ...

<!-- ### Workspace Preparation -->
### 工作区准备

<!-- To put forward a PR, we assume you have registered a GitHub ID. Then you could finish the preparation in the following steps: -->

提出 PR，我们假设你已经注册了一个 GitHub ID。然后你可以按照以下步骤完成准备工作：


<!-- 1. **Fork** Fork the repository you wish to work on. You just need to click the button Fork in right-left of project
   repository main page. Then you will end up with your repository in your GitHub username. -->
1. **复刻** 复刻你想工作的版本库。你只需要点击项目主页面左上角的Fork按钮即可。
   仓库主页面的左手边。然后你就可以在你的GitHub用户名中看到你的仓库了。
<!-- 2. **Clone** your own repository to develop locally. Use `git clone https://github.com/<your-username>/arbiter.git` to
   clone repository to your local machine. Then you can create new branches to finish the change you wish to make. -->
2. **克隆**你自己的仓库来进行本地开发。使用`git clone https://github.com/<your-username>/arbiter.git`来
   克隆版本库到你的本地机器。然后你可以创建新的分支来完成你想做的改动。
<!-- 3. **Set remote** upstream to be `https://github.com/kube-arbiter/arbiter.git` using the following two commands: -->

3. **设置远程** 上游设置为 `https://github.com/kube-arbiter/arbiter.git`：

   ```bash
   git remote add upstream https://github.com/kube-arbiter/arbiter.git
   git remote set-url --push upstream no-pushing
   ```
   <!-- 
   Adding this, we can easily synchronize local branches with upstream branches. 
   -->
   添加这一点，我们可以轻松地将本地分支与上游分支同步。

<!-- 4. **Create a branch** to add a new feature or fix issues -->
4. **创建一个分支** 添加新特性或者修复问题

   <!-- Update local working directory: -->
   更新本地工作目录：

   ```bash
   cd <project>
   git fetch upstream
   git checkout main
   git rebase upstream/main
   ```

   <!-- Create a new branch: -->
   创建新的分支：

   ```bash
   git checkout -b <new-branch>
   ```

   <!-- Make any change on the new-branch then build and test your codes. -->
   在新的分支改动后可以构建和测试你的代码。

<!-- ### PR Description

PR is the only way to make change to Arbiter project files. To help reviewers better get your purpose, PR description could not be too detailed. We encourage contributors to follow the [PR template](https://github.com/kube-arbiter/arbiter/blob/main/.github/PULL_REQUEST_TEMPLATE.md) to finish the pull request. -->

### PR 描述

PR是对 Arbiter 项目文件进行修改的唯一途径。为了帮助评审员更好地理解你的目的，PR描述不能太详细。我们鼓励贡献者按照[PR 模板](https://github.com/kube-arbiter/arbiter/blob/main/.github/PULL_REQUEST_TEMPLATE.md)来完成 pull request。

<!-- ### Developing Environment

As a contributor, if you want to make any contribution to Arbiter project, we should reach an agreement on the version of tools used in the development environment. Here are some dependents with specific version: -->

### 开发环境

作为贡献者，如果你想对 Arbiter 项目做出任何贡献，我们应该就开发环境中使用的工具版本达成一致。以下是一些具有特定版本的依赖项：

- Golang : v1.19+
- Kubernetes: v1.21+ for [main](https://github.com/kube-arbiter/arbiter/tree/main) branch
- kubernetes: 1.18 ~ 1.20, scheduler should use [pre](https://github.com/kube-arbiter/arbiter/tree/pre) branch

<!-- ### Developing guide

There's a `Makefile` in the root folder which describes the options to build and install. Here are some common ones: -->

### 开发指南
根目录的 `Makefile` 描述了构建和安装的一些参数。下面是一些常见的：

```bash
# build binary 
make binary

# delete _output dir
make clean 

# update all (go vendor, codegen, crdgen and so on)
make update

# verify all (shell format, go vendor, codegen, crdgen, file copyright, run golangci-lint and so on)
make verify

# Build image 
make image
```

<!-- ### Proposals

If you are going to contribute a feature with new API or needs significant effort, please submit a proposal in [doc/proposals/](https://github.com/kube-arbiter/arbiter/blob/main/doc/proposals) first. -->

### 提案
如果你要贡献一个带有新的 API 或需要大量工作的功能，请先在 [doc/proposals/](https://github.com/kube-arbiter/arbiter/blob/main/doc/proposals) 提交一份提案。

<!-- ## Engage to help anything

We choose GitHub as the primary place for Arbiter to collaborate. So the latest updates of Arbiter are always here. Although contributions via PR is an explicit way to help, we still call for any other ways. -->

## 参与帮助任何事情

我们选择 GitHub 作为 Arbiter 合作的主要场所。所以 Arbiter 的最新更新总是在这里。尽管通过 PR 的贡献是一种明确的帮助方式，我们仍然呼吁任何其他方式。

- reply to other's issues if you could;
- help solve other user's problems;
- help review other's PR design;
- help review other's codes in PR;
- discuss about Arbiter to make things clearer;
- advocate Arbiter technology beyond GitHub;
- write blogs on Arbiter and so on.

<!-- In a word, **ANY HELP IS CONTRIBUTION**. -->
一句话，任何帮助都是贡献。

<!-- ## Joining the community

Follow these instructions if you want to:

- Become a member of the Arbiter GitHub org (see below)
- Become part of the Arbiter build cop or release teams
- Be recognized as an individual or organization contributing to Arbiter -->

## 加入社区

如果你想，请参考下面的介绍：

   - 成为 Arbiter GitHub 组织的成员（见下文）
   - 成为 Arbiter 构建副本或发布团队的一员
   - 被认定为对 Arbiter 有贡献的个人或组织

<!-- ### Joining the Arbiter GitHub Org

Before asking to join the community, we ask that you first make a small number of contributions to demonstrate your intent to continue contributing to Arbiter. -->

### 加入 Arbiter Github 组织

在要求加入社区之前，我们要求你先做少量的贡献，以证明你有继续为 Arbiter 贡献的意愿。

<!-- - **Note**: Anyone can contribute to Arbiter, adding yourself as a member in the organization is not a mandatory step.

There are a number of ways to contribute to Arbiter:

- Submit PRs
- File issues reporting bugs or providing feedback
- Answer questions on Slack or GitHub issues
- **Note**: This only counts GitHub related ways of contributing

When you are ready to join -->

- **注意** 任何人都可以为 Arbiter 做出贡献，在组织中添加自己为成员并不是一个强制性的步骤。

有很多方法可以为 Arbiter 做出贡献。

   - 提交 PR
   - 报告错误或提供反馈的文件问题
   - 回答 Slack 或 GitHub 上的问题
   - **注意**：这只计算 GitHub 相关的贡献方式


<!-- - [Open an issue](https://github.com/kube-arbiter/arbiter/issues/new?assignees=&labels=area%2Fgithub-membership&template=membership.yml&title=REQUEST%3A+New+membership+for+%3Cyour-GH-handle%3E) against the **kube-arbiter/arbiter** repo
- Make sure that the list of contributions included is representative of your work on the project.
- Mention 2 existing reviewers who are sponsoring your membership.
- After the request is approved, an admin will send you an invitation.
  - This is a manual process that's generally run a couple of times a week.
  - If a week passes without receiving an invitation reach out on DingTalk or Slack. -->
- [开启一个问题](https://github.com/kube-arbiter/arbiter/issues/new?assignees=&labels=area%2Fgithub-membership&template=membership.yml&title=REQUEST%3A+New+membership+for+%3Cyour-GH-handle%3E) 针对**kube-arbiter/arbiter** repo。
- 确保所包括的贡献清单能代表你在项目上的工作。
- 提到2个赞助你的会员的现有审查员。
- 请求被批准后，管理员将向你发出邀请。
  - 这是一个手动过程，通常每周运行几次。
  - 如果一个星期过去了，没有收到邀请，请在DingTalk或Slack上联系。
