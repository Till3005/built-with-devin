---
layout: default
title: 复现 Devin Bots — 实战指南 — Built with Devin
---

# 复现 Devin Bots — 实战指南

把旗舰 Devin Bot 部署的全部公开信息浓缩成你可以亲手重建的配方。来源：[Cognition 发布博客](https://devin.ai/blog/introducing-devin-bots)（2026-11-17）、[Bots 文档](https://docs.devin.ai/work-with-devin/bots)、[Fortune 独家](https://fortune.com/2026/11/17/exclusive-cognition-bets-on-devin-bots-coding-agents-in-challenge-to-anthropics-duet-and-openais-dots/)，以及 Jenny Xu 的 [SuperJennyStack 帖](https://x.com/cognition/status/2122737511684587551)。

## Bot 如何工作（机制）

按文档：

1. **创建** — 侧栏 → Bots → *Create new Bot* → 选模板或 *Start from scratch*。新 Bot 默认私有，分享后才可被他人使用。
2. **Outcome prompt** — 第一条消息授权所有权：`You own the Android app now. Keep it at feature parity with iOS.` 给的是*目标*，不是任务。
3. **Sessions** — Bot 自己建档工单，每件工作跑一个 Devin 会话，各自独立云机。
4. **Automations** — 在聊天里让 Bot 按时间表或触发器运行（例："每天早上汇总开放 PR"）。它提出自动化，你批准一次即可。
5. **Needs you** — 决策、PR 评审、权限请求和报告汇总进一个列表；Bot 会标出它推荐的选项。
6. **Instructions & memory** — 人类编辑 instructions（每次会话启动时读取）；Bot 自己把学到的东西写进 memory 文件。
7. **Surfaces** — 给 Bot 配自己的 Slack app 以便 @-提及/私聊，或者用 iMessage 发消息。
8. **Grants** — Bot A 可以被授予对 Bot B 的读/发消息权限——这就是 bot 之间移交工作的方式。

签到句式：`anything waiting on me?`

## 配方 1 — 产品负责人 Bot（Android Bot）

**成果：** 先建成、再长期拥有一整块产品面。

- **Prompt**（Cognition 原文）：*"your job is to product manage the android app. Basically, you're going to autonomously create the entire thing, but we need to figure out what the blockers are for you doing that first."*
- **第一阶段：** 先让 Bot 枚举阻塞项——代码在哪、构建如何测试、改动如何合并——再写代码。
- **循环：** Bot 建档工单 → 每工单一个会话 → PR 由 CI + Devin Review 卡门 → 合并。
- **汇报：** 每日 Slack 报告，附改动处的屏幕录像。
- **人类负载：** 约每 6 个合并 PR 一条消息；很多天是零。消息主要回答需要人类判断的项（如安全评审）——或给方向（"be more ambitious"）。
- **稳态：** Bot 与参照项目保持功能对齐，并分诊 beta 报告。
- **数字：** 据 [Cognition 发布博客](https://devin.ai/blog/introducing-devin-bots)，该 Bot 用了 44 天，合并了 1,134 个 PR。

## 配方 2 — 定时巡检 Bot（Layout Bot）

**成果：** 拥有一项周期性质量检查，以及它挖出的修复。

- **Prompt 模板：** *"Your job is to keep <surface> from <regressing>. Watch <channel/check>, where <check> posts every <interval>. Take over that check and keep it working as the UI changes. When something regresses, find the cause and open a fix with a before-and-after video."*
- **自动化：** 每 3 小时 cron——在自己的 VM 上构建生产 `main`，在真实条件（首访、回访、独立延迟请求）下跑检查。
- **噪音处理：** 抖动检查先重跑再行动；每处回归追到引入它的 PR。
- **产出：** 带前后对比视频证据的小 PR。
- **数字：** 3 周 159 个 PR，延迟 −70%。成立的原因：每个"检查+修复"都很小，且被持续复验。

## 配方 3 — 多 Bot 组织（SuperJennyStack）

**成果：** 一整个生意由 Bot 层级运转；人类用 emoji 做决策。

Jenny Xu 的游戏工作室——约 20 个 Bot，各司其职。她公开的结构：

| Bot | 职责 |
|---|---|
| **SuperJenny** | 编排：向所有下属派活，把它们的请示汇编成一个帖子；用她的性格/怪癖训练过 |
| **SuperPM** | 从指标 + 商店评论 + 趋势产出每日修复优先级榜 |
| **SuperRelease** | 每周构建，周五达到可提交商店状态 |
| **SuperQA** | 真机测试，附视频证据 |
| **SuperSupport** | 起草每条商店评论回复待批准；夜间帮助玩家 |

其余约 15 个 Bot 覆盖开发、Unity、UI、iOS、Android、分析等。

- **汇报节奏：** SuperJenny 把每个下属 Bot 的待决事项收集进**一个 Slack 帖子，每天 4 次**；人类用 emoji 作答。
- **机制：** 每个职位建一个 Bot，给编排者授予对各 Bot 的读/发消息权限，并指示它做汇总。
- **数字：** 据 [Cognition 发布博客](https://devin.ai/blog/introducing-devin-bots)，每周 PR 从约 50 个增至 1,900 个，并保持每周发布。
- **变体（官方）：** QA Bot 发现 bug → 经 grant 交给 Developer Bot → Developer 修复 → QA 在 staging 复测 → PM Bot 在频道汇报状态。

## 配方 4 — 单一职责 Bot（官方模板模式）

每个[官方模板](https://devin.ai/bots/templates)都编码一个可复现循环：

| 模板 | 循环 | 节奏 |
|---|---|---|
| Software Factory | 在你指定的领域找 bug/打磨/性能/重构 → 每个一个带证据的小 PR；从你的合并/关闭决策中学习 | 持续 |
| Product Engineer | 工单 → 带测试的 PR → 过评审 | 按工单 |
| QA Engineer | 在真实浏览器测每个 PR，发视频 + 通过/失败结论 | 按 PR |
| Anomaly Watcher | 扫产品+业务数据里没人盯的问题，发发现 + 负责人 | 每天 2 次 |
| Code Reaper | 找死代码，一次一个安全 PR 删除并附理由 | 每周 |
| Chief of Staff | 盯频道、发更新、委派并跟踪到完成 | 持续 |
| Migration Engineer | 把一场大迁移做成可跟踪的小 PR；汇报进度与阻塞 | 持续 |
| Latency Optimizer | 找最慢的端点/任务/查询，修最差那个并附前后数字 | 每周 |
| iOS / Android Engineer | 工单 → 带测试 PR + 可安装构建（TestFlight / 内测） | 按工单 |
| Internal Tools Engineer | 按需构建 + 运行 + 更新内部工具 | 按需 |
| Data Analyst | 回答数据问题：图表 + 底层查询 + 注意事项 | 按需 |
| Devin Coach | 每周报告：Devin 在哪卡住 + 每条一个修复（note、skill、setup 改动） | 每周 |
| Code Health Engineer | 过期 flag、旧依赖、CVE → 小而安全的 PR | 每月 |
| Technical Writer | 合并后让 repo 的 wiki/图与 `main` 同步 | 按合并 |
| Compliance Engineer | 从代码收集控制证据，控制失效时告警 | 持续 |

## Cognition 之外的公开部署

具名 beta 部署（全部报道于 2026-11-17~18，发布首日）：

- **Harvey — “Phil”** —— [Gabe Pereyra 称](https://x.com/gabepereyra/status/2122756324173992166)，全由 agent 组成的团队在三周内为协作式 Word 兼容编辑器写出 100 多万行代码。
- **Decagon — 共享 Bot 舰队**（[@tylerxdev 的帖](https://x.com/tylerxdev/status/2122743518712287400)）——早期试用几周后 Slack 里有 50+ 共享 Bot：on-call、DevEx 优化、以及一个团队直接发消息而不手工管理帖子的 Chief of Staff Bot。要点：Bot 是多人的——一个共享 Bot 承载团队累积的上下文，单用户会话做不到。
- **Decagon — AutoResearch**（[完整文章](https://x.com/DecagonAI/article/2115511110120120437)，[@devindevelopers](https://x.com/devindevelopers/status/2115601107581821172)）——一个 Devin 在 Devin Cloud 上编排一座推理研究实验室；子 agent 并行追逐相互竞争的假设，每个想法都用 Modal GPU 上回放的生产流量验证。每 GPU 吞吐最高 2.5×。要点：给循环一个*可度量*的奖励（延迟 SLA 内的 requests/sec/GPU），让发现建立在最近一次已验证基线上复利累积。
- **Mark Fenner — "Frankie 的组织"**（[演示](https://x.com/markfenner/status/2122740244328145211)）——一位大使运营四个分工明确的 Bot，上面是一个负责汇总回报的协调 Chief Agent Bot。要点：即使单人运营者也能跑多 Bot 组织形态——一个协调者就是单一决策面。
- **Bryan Johnson — 个人数据 Bot**（[帖子](https://x.com/bryan_johnson/status/2122814114976383406)、[发布视频](https://x.com/cognition/status/2122737511684587551)）——一个 Bot 把他多年的生物计量数据（含脑部扫描）综合成单一健康读数；另一个每天给他母亲发一条他的近况。要点：Bot 不限于代码库——"拥有一项成果"延伸到个人数据管线和周期性对外通信。
- **swyx — 通才试验**（[他的总结](https://x.com/swyx/status/2122746401482592549)、[技术笔记](https://x.com/swyx/status/2122818291144229075)）——一周里移交了答案引擎优化、QA、跨平台 app 移植、个人行政自动化和视频剪辑。他的判断：别卖"AI 员工"；卖比单任务高一层的抽象——拥有成果的经理。注意他的架构细节：每个 Bot 有自己的记忆库；跨 Bot 知识共享不是自动的。

来自[发布视频](https://x.com/cognition/status/2122737511684587551)和早期用户报告（[daily.dev 摘要](https://daily.dev/posts/devin-bots-want-to-be-your-agent-manager-not-your-ai-employee-hhpjo94uh)）：

- **开源仓库维护** —— 一个 Bot 在 Manim（数学可视化开源项目）上预分诊 issue，让维护者把时间花在重要代码上。
- **固件/硬件** —— Bot 接管固件工作，让硬件制作者"留在自己热爱的事情上"。
- **网球分析** —— 一个 Bot 把散落的网球数据聚合成表现洞察。
- **会计自动化** —— trybasis：agent 把 20 小时的会计任务压到约 30 分钟。
- **推理工程** —— Cognition 的 Walden Yan 报告了 bot 主导的前言推理引擎工程：合并 PR 吞吐 40×、单一自主目标产出 1,000+ PR（[@walden_yan](https://x.com/walden_yan)）。
- **研究加速** —— Cognition 研究团队自发把日常工作搬到 Bot 上；最近一次冲刺"把数周压进数天"（[@silasalberti](https://x.com/silasalberti)）。
- **吃狗粮注记** —— 按 Cognition 的 Russell Kaplan：Android Bot 自主发现并修复了一个由破坏性变更引起的 iOS/web 侧回归；公司内部甚至有 Bot 造过别的 Bot（"Bots built Bots"）。

## 运营要点（成功者的共性）

- **成果 > 任务：** "own checkout" 而不是 "fix the checkout button"。Bot 会重新规划；任务做完即止。
- **小 PR 带证据：** 每个文档化的 Bot 都交付小而可验证的单元——视频证据、前后数字、"为什么安全"。
- **卡 CI + 评审，不卡感觉：** PR 在检查和 Devin Review 通过时合并。
- **单一决策面：** 让 Bot 把请示打包（Needs you / 每日一帖），而不是随时打断。
- **通过记忆施教：** 纠正和偏好变成记忆文件；Cognition 就这样每周合并 2,000+ PR。
- **给 Bot 一个 Slack app 和一个名字：** 每个被报道的部署都在 Slack 里以一个可被 @ 的团队成员身份运转。
