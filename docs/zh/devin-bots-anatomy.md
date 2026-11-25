---
layout: default
title: Devin Bot 解剖 — Built with Devin
---

# Devin Bot 解剖

一篇深入 Devin Bot 在文档机制之下究竟如何运转的解析——写给任何在评估、复现或撰文介绍它们的人。以下全部内容源自[官方文档](https://docs.devin.ai/work-with-devin/bots)、[发布博客](https://devin.ai/blog/introducing-devin-bots)或具名公开部署；每条论断都带来源。

## 所有权模型

Bot 由一条 **outcome prompt（成果指令）** 定义——一份常驻的授权，而不是任务队列里的一条任务。最经典的例子是 Android Bot 的指令：*"your job is to product manage the android app."* 仅凭这一句话，Bot 就把成果拆解成它自己撰写的工单，然后每个工单跑一个 Devin 会话（[发布博客](https://devin.ai/blog/introducing-devin-bots)）。

运转循环：

```
outcome prompt → bot plans work → spawns Devin session per unit →
PRs land (or escalate) → memory updates → repeat
```

与一次性会话的关键区别：Bot 是持久的。Android Bot 在**同一个任务上跑了 44 天**；人类总共只发了 **183 条消息**，其中有一段 22 天的静默期，Bot 完全自主运转（[X](https://x.com/DevinAI)）。

## 六个文档化机制

| 机制 | 作用 | 例证 |
| --- | --- | --- |
| **Chat** | 主交互界面——像对同事一样在 Devin、Slack 或 iMessage 里和 Bot 说话 | 全部部署 |
| **Sessions** | 每个工作单元跑成一个普通 Devin 会话，由 Bot 发起并监督；任何会话都可打开检查 | Android Bot |
| **Needs you** | Bot 的升级通道——只上浮需要人类判断的决策，不上浮状态噪音 | SuperJennyStack（人类只用 emoji 回复） |
| **Memory** | Bot 持续累积的可编辑持久存储——偏好、决策、约定——跨周携带 | Android Bot（单一任务 44 天）；Harvey Phil（记忆+决策日志即方向盘） |
| **Grants** | Bot 间移交：一个 Bot 可以把一个工作单元委派给另一个作用域合适的 Bot | 文档化 grant 流程：QA Bot 发现 bug → grant 给 Dev Bot 修复 → 复测 → PM Bot 汇报 |
| **Slack app** | 每个 Bot 有自己的 Slack 身份，频道可以像对人一样 @ 它 | tigsbot（每个项目一个 Slack 频道） |

## 公开数字实际展示了什么

| 指标 | 部署 | 来源 |
| --- | --- | --- |
| 1,134 个合并 PR | Android Bot，44 天 | [发布博客](https://devin.ai/blog/introducing-devin-bots) |
| 3 周 159 个 PR，卡顿 −70% | Layout Bot | [发布博客](https://devin.ai/blog/introducing-devin-bots) |
| 约 50 → 1,900 PR/周 | SuperJennyStack | [发布博客](https://devin.ai/blog/introducing-devin-bots) |
| 三周写出 100 多万行代码（Rust 与 TypeScript 编辑器） | Harvey Phil | [Gabe Pereyra 的文章](https://x.com/gabepereyra/status/2122756324173992166) |
| 每条消息平均多合并 4.5× PR（beta 全局） | 1,000+ beta 测试者 | Fortune |
| Cognition 每周合并 2,000+ PR；合并吞吐 40×；单一自主目标产出 1,000+ PR | Cognition 内部 | Fortune |
| 每 GPU 吞吐最高 2.5× | Decagon AutoResearch | Decagon |

## 跨部署反复出现的模式

- **工作是"领域所有权"形状，不是任务形状。** 跑起来的 Bot 都拥有一个领域（"android app"、"layout 回归"、"onboarding QA"）而不是一张工单列表。每一个失败或浅层的部署报告，归根到底都是 prompt 写成了任务而不是成果。
- **收敛的人类界面。** 多 Bot 组织（SuperJennyStack、Frankie、tigsbot）都有一层 chief-of-staff，把所有待决事项卷进一个帖子——人类从不逐个分诊 20 个 Bot。
- **参照锚定的验证。** 数字最大的部署都有外部事实源：真实 MS Word 行为（Phil）、对照生产构建的截图测试（Android Bot）、回放的生产流量（AutoResearch）。验证层是无人值守合并安全的前提。
- **Bot 造 Bot。** Cognition 报告内部有 bot 操作 bot；社区部署（Frankie、tigsbot）独立复现了同样的分层。

## 已知边界

- Bot 在"完成"可被检查的地方最强（测试、截图、回放流量、参照实现）。开放式判断类工作仍会走 Needs-you 上浮。
- 记忆是可编辑的：运营者可以也确实直接在 Bot 的聊天里纠正它累积的认知。

## 来源

- [Introducing Devin Bots](https://devin.ai/blog/introducing-devin-bots) — 发布博客
- [Devin Bots 文档](https://docs.devin.ai/work-with-devin/bots) — 机制
- [Fortune 独家](https://fortune.com/2026/11/17/exclusive-cognition-bets-on-devin-bots-coding-agents-in-challenge-to-anthropics-duet-and-openais-dots/) — beta 指标
- 具名部署链接见 [README](../README.md#documented-deployments)
