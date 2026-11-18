<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/cover-dark.svg">
  <img src="assets/cover-light.svg" alt="Built with Devin" width="100%">
</picture>

<br/>

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](LICENSE)

<sub>Curated by [@darega0mae](https://x.com/darega0mae) · Sister tutorials: [build-with-devin](https://github.com/Till3005/build-with-devin) · [Add your project](CONTRIBUTING.md)</sub>

</div>

> *Unofficial community project — not affiliated with, endorsed by, or sponsored by Cognition AI. "Devin" is a trademark of Cognition AI. Brand assets are used under the official kit at [devin.ai/brand](https://devin.ai/brand). Official docs: [docs.devin.ai](https://docs.devin.ai).*

## Contents

- [Devin Bots — official product](#devin-bots--official-product)
- [Products built with Devin](#products-built-with-devin)
- [Enterprise deployments](#enterprise-deployments)
- [Bots & surfaces](#bots--surfaces)
- [SDKs & API tooling](#sdks--api-tooling)
- [Tooling around Devin](#tooling-around-devin)
- [Patterns & write-ups](#patterns--write-ups)
- [Community media](#community-media)
- [Official resources](#official-resources)

## Devin Bots — official product

Launched **November 17, 2026** ([announcement](https://devin.ai/blog/introducing-devin-bots) · [docs](https://docs.devin.ai/work-with-devin/bots) · [Fortune exclusive](https://fortune.com/2026/11/17/exclusive-cognition-bets-on-devin-bots-coding-agents-in-challenge-to-anthropics-duet-and-openais-dots/)). A Bot is a persistent agent that owns an outcome: it plans the work, runs a Devin session for each piece, keeps memory across weeks, and brings you only the decisions that need your judgment. Bots live in Slack and iMessage, run on schedules or event triggers, and hand work between each other through grants. Bots incorporate technology from the Interaction Company (Poke), which Cognition acquired in July 2026.

### Documented deployments

| Bot | Owner | What it owns | Reported results |
| --- | --- | --- | --- |
| **Android Bot** | Cognition | Devin's Android app, end to end | Prompted *"your job is to product manage the android app"* on Sep 28, 2026 — filed its own tickets, ran a Devin session per ticket, shipped to Google Play open beta in **44 days**: 1,134 PRs merged, 344,651 lines of Kotlin, 2,841 screenshot tests. Its human sent **183 messages total** — 22 days of complete silence — and **88% of PRs were self-merged**. Now owns Android/iOS feature parity. |
| **Layout Bot** | Cognition | Layout-shift regression on the Devin web app | Every 3 hours it builds production `main`, simulates first/repeat/delayed-request visits, traces regressions to the introducing PR, opens fixes with before/after videos. **159 PRs in 3 weeks; lag −70%.** |
| **Super Jenny** | Jenny Xu (community) | An entire mobile game studio | ~20 Bots (dev, Unity, releases, UI, iOS, Android, device testing) under one orchestrating Bot; the only human answers a consolidated Slack thread 4×/day **with emoji**. ~50 → **1,900 PRs/week**, studio revenue 6×'d, shipping weekly. Published as community template **SuperJennyStack**. ([Jenny's thread](https://x.com/xujennyc)) |
| **Onboarding QA Bot** | Cognition (Walden Yan) | QA of 30+ onboarding flows, 24/7 | Maintains self-updating Playwright scripts, an agent job queue, and a live board view it built itself — "found way more bugs than I would have had patience to discover." ([@walden_yan](https://x.com/walden_yan)) |
| **"Phil"** | Harvey | Collaborative Word-compatible editor engine | ~30 agents wrote 1M+ lines of Rust + TypeScript in **3 weeks, no human engineers** — verified continuously against real Microsoft Word behavior and simulated lawyer negotiations; humans steer through memory + decision logs. ([Gabe Pereyra](https://x.com/gabepereyra)) |
| **Shared bot fleet** | Decagon | On-call, DevEx optimization, thread routing | 50+ shared Bots in Slack during beta; a Chief of Staff Bot decides when and how to spawn threads. ([@tylerxdev](https://x.com/tylerxdev)) |
| **Personal data Bots** | Bryan Johnson | Health synthesis + family updates | One Bot synthesizes years of biometric and brain-scan data into a single readout; another texts his mother a daily update on how he's doing. ([launch video](https://vimeo.com/1247688199), [@bryan_johnson](https://x.com/bryan_johnson)) |

### Documented patterns

- **Outcome prompts** — *"You own the Android app now. Keep it at feature parity with iOS."* Give the Bot a goal, not a backlog.
- **Bot-to-bot handoffs** — grants let a QA Bot find a bug, pull in a Developer Bot to fix it, retest on staging, and have a PM Bot report status to the channel.
- **Scheduled checks** — a Bot that watches an alerts channel on a cron, owns the check, and opens fixes when it regresses (Layout Bot pattern).
- **Roll-up reporting** — one supervising Bot collects every subordinate Bot's pending decisions into a single thread (SuperJennyStack pattern).
- **Bots × Apps** — Bots maintain Devin Apps: build new pages/features and adapt to changes automatically; Bots and Apps pin to the same nav rail ([@dabit3](https://x.com/dabit3)).
- **Reference-grounded swarms** — Harvey's lesson: when work can be checked against a reliable reference (real Word behavior), a small team can direct a large swarm safely.

### Reported results

**1,000+ beta testers** in the weeks before launch. Testers merge **4.5× more PRs per message**; Cognition merges 2,000+ PRs/week, 40×'d its merged-PR throughput, and landed **1,000+ PRs from a single autonomous goal**. Named early-access customers include **Decagon, Fireworks AI, and Reducto**, with usage up 10× in the first two weeks ([Fortune](https://fortune.com/2026/11/17/exclusive-cognition-bets-on-devin-bots-coding-agents-in-challenge-to-anthropics-duet-and-openais-dots/)).

Other documented usage: preemptive issue triage on **Manim**, firmware work, a bot-led team building a **frontier inference engine**, tennis analytics, accounting automation (trybasis: 20h → 30 min), swyx's week-long trial (AEO, QA, cross-platform porting, personal admin, video editing — [@swyx](https://x.com/swyx)), and Cognition's research team compressing "weeks into days" ([@silasalberti](https://x.com/silasalberti)). Full write-ups in the [reproduction guide](docs/reproducing-devin-bots.md#reported-usage-beyond-cognition).

### Official template library

Sixteen ready-made Bots on the [public marketplace](https://devin.ai/bots/templates), plus community templates like **SuperJennyStack**:

| Template | What it does |
| --- | --- |
| Software Factory | Finds bugs, polish, performance and refactoring work in a named product area; opens one small PR each with proof it works |
| Product Engineer | Takes a ticket or request to a tested PR and through review |
| QA Engineer | Tests each PR in a real browser and posts the video of pass/fail |
| Anomaly Watcher | Twice daily scans product + business data for problems no monitor watches |
| Code Reaper | Removes dead code weekly, one safe PR at a time |
| Chief of Staff | Watches channels, posts updates, hands work to the team and follows it to done |
| Migration Engineer | Owns one big migration as small, tracked PRs with a progress surface |
| Latency Optimizer | Finds the slowest endpoints/jobs/queries; weekly fix PR with before/after speed |
| iOS Engineer | SwiftUI features to PR + TestFlight build |
| Android Engineer | Kotlin features to PR + internal-test build |
| Internal Tools Engineer | Admin panels and internal tools on your stack |
| Data Analyst | Answers data questions with the chart and the query behind it |
| Devin Coach | Teaches your team to use Devin well from your own usage data |
| Code Health Engineer | Stale flags, old dependencies, CVEs → small safe PRs |
| Technical Writer | Keeps repo wikis and diagrams in step with `main` after merges |
| Compliance Engineer | Collects control evidence from code, warns when a control lapses |

**[→ Reproduction guide: how to rebuild every documented Bot](docs/reproducing-devin-bots.md)** — and its expanded tutorial form in the sister repo **[build-with-devin](https://github.com/Till3005/build-with-devin)**

## Products built with Devin

Real software where Devin wrote the code — not demos, shipped work.

- **[Era by Eon](https://devin.ai/customers/eon)** — Simulated companies (74 vendor-faithful systems: Salesforce, Slack, Zendesk, Jira…) for training and evaluating AI agents. **98% of merged PRs written by Devin**, 300+ day-long sessions, 2,720 sessions launched by other sessions.
- **[Courtyard's Quick](https://courtyard.io/blog/post/from-a-slack-link-to-production-in-under-48-hours-cloning-shopifys-quick-with-devin)** — Courtyard cloned Shopify's internal "Quick" static-site deployer: from a Slack link to a production service (Go, Cloud Run, Bazel, Terraform, SSO, git-backed) in **~21 hours**, all written by Devin.

*Know a shipped product built with Devin? [Add it](CONTRIBUTING.md).*

## Enterprise deployments

Published customer cases with hard numbers ([full index](https://devin.ai/customers)):

| Company | Deployment | Reported result |
| --- | --- | --- |
| [Nubank](https://devin.ai/customers/nubank) | Multi-million-line, 8-year-old ETL monolith → sub-modules | 8–12× engineering efficiency, 20× cost savings; fine-tuned Devin cut ~40 min/task to ~10 |
| [Wayfair](https://devin.ai/customers/wayfair) | Cloud agents across the org | 1,600+ engineers all-in |
| [The Access Group](https://devin.ai/customers/access-group) | Devin across 250 products, 2,000+ engineers | 5× engineering output |
| [EBANX](https://devin.ai/customers/ebanx) | Devin as primary author | **92% of merged PRs are Devin-authored** |
| [Gumroad](https://devin.ai/customers/gumroad) | Devin on the core repo | Devin is the repo's **#1 contributor**: 1,500+ merged PRs |
| [Finch](https://devin.ai/customers/finch) | Feature + maintenance work | 3,000 PRs merged, ~20 engineer-months saved |
| [Comarch](https://devin.ai/customers/comarch) | 20-year-old, 10M-line ERP rebuild | Full system modernization in progress |
| [AngelList](https://devin.ai/customers/angellist) | Incident triage + data migration | Devin root-causes 70% of incidents pre-engineer; Redshift→Snowflake 5.2× faster |
| [Modal](https://devin.ai/customers/modal) | Incident response | 80% of incidents investigated before an engineer opens the thread |
| [Reducto](https://devin.ai/customers/reducto) | Devin Oncall as first responder | Engineers rarely get paged |
| [Eight Sleep](https://devin.ai/customers/eight-sleep) | Devin across the company | 8× more shipped |
| [Exa](https://devin.ai/customers/exa) | End-to-end shipping | Production ships without engineers ever pulling code locally |
| [RV Tech](https://devin.ai/customers/rvtech) | Rivian × VW JV, software-defined vehicles | 10× testing velocity |
| [Melius](https://devin.ai/customers/melius) | High-throughput small team | ~100 PRs/day |
| [Hamming](https://devin.ai/customers/hamming) | Devin on the codebase | 25% of total code volume |
| [Airbyte](https://devin.ai/customers/airbyte) | Connector maintenance | Keeps 700+ connectors running |
| [Litera](https://devin.ai/customers/litera) | Regression testing | Regression cycles cut 90% |

Also on the record: Citi (40,000-developer rollout, 30% tech-vendor spend cut), Ramp (tens of thousands of hours of tech debt), Itaú, Tavrn (HIPAA-constrained), Crosby (AI-native law firm), Mercedes-Benz, Cognizant and Infosys partnerships — see the [customer index](https://devin.ai/customers).

## Bots & surfaces

Putting Devin inside other products and channels.

- **[devin-discord-bot](https://github.com/wgtechlabs/devin-discord-bot)** — Self-hosted TypeScript bot bringing Devin into Discord: start sessions with a mention, stream progress back into the channel.
- **[devin-telegram-bot](https://github.com/wgtechlabs/devin-telegram-bot)** — Same author's Telegram bridge to the Devin API.
- **[Buzz for Devin](https://github.com/fenner888/BuzzforDevin)** — Community fork of Block's Buzz adding the official Devin CLI (`devin acp`) as a native runtime, so each person brings their own authenticated Devin into shared agent-native communities.
- **[devin-sse-proxy](https://github.com/sotayamashita/devin-sse-proxy)** — Minimal MCP server letting Claude Desktop talk to Devin's SSE transport while passing a Personal API Key.
- **[devin-flow](https://github.com/xlm/devin-flow)** — Visual editor for event-driven Devin workflows on the Automations API, with session tracking (FastAPI + Vue 3).

## SDKs & API tooling

- **[go-devin](https://github.com/gassara-kys/go-devin)** — Go SDK for the Devin API.
- **[llm-devin](https://github.com/ftnext/llm-devin)** — Plugin for Simon Willison's `llm` CLI to call the Devin API.

## Tooling around Devin

Things the community builds *for* Devin rather than *with* it.

- **[DevinX / Devinmaxxing](https://x.com/markfenner)** — Mark Fenner's local model picker for Devin Desktop sessions: local weights via ACP, adaptive cost balancing, reasoning-effort control.
- **[awesome-devin](https://github.com/Icaro0310/awesome-devin)** — The `devin-*` open-source tooling ecosystem: session search, history export, knowledge graphs, eval harnesses, backup, fan-out planners.
- **[devin-judge](https://github.com/Icaro0310/devin-judge)** — Calibrated local-first decision layer with a Devin ACP backend; no API key needed.
- **[devin-fusion-byok](https://github.com/kuobibulaien/devin-fusion-byok)** — A Devin extension (VSIX) that brings your own model APIs into Devin's model picker and composes them into Fusion Lead+Sidekick presets — without modifying the app itself.
- **[devin.cursorrules](https://github.com/grapeot/devin.cursorrules)** — The 5k★ ruleset that turns Cursor/Windsurf into "90% of Devin" — the reference point for what counts as Devin-grade agent behavior.

## Patterns & write-ups

Documented real-world usage.

- **[SAST auto-remediation pipeline](https://github.com/Cognition-Partner-Workshops/uc-cve-remediation-regulatory-compliance/pull/16)** — GitHub Actions workflow that scans PRs with OWASP Dependency-Check and dispatches a Devin session to remediate CVEs ≥ 7.0, with verification scans and an escalation circuit breaker.
- **[Attributing Devin PRs to their requesters](https://tech.enechange.co.jp/entry/2025/06/22/165504)** — ENECHANGE's GitHub Actions setup for recording which engineer instructed Devin, solving productivity-measurement gaps when all PRs show `devin-ai-integration[bot]` (Japanese).
- **[Fixing stale mailbox alarms](https://agentsinuse.com/use-cases/devin-to-clear-mailbox-alarm/)** — Devin tracing a Cloudflare Workers test flake to a stale continuation alarm and adding regression coverage (via Agents In Use).
- **[Designing the Spraycash UI in Devin](https://dev.to/ibrahimpima/designing-the-spraycash-ui-with-kimi-k3-in-devin-4l2f)** — A fintech landing page art-directed entirely through Devin chat: generated imagery, layered cloud animation, SVG draw-on ring, and a three-font type system — every prompt published.
- **[Devin auto code-review at rakko_inc](https://zenn.dev/rakko_inc/articles/00cc5a5a679971)** — Playbooks + GitHub Actions + Devin API pre-digest every PR; monthly reviewed PRs went 65 → 184 (JP).
- **[QA test-design automation at Skillnote](https://zenn.dev/skillnote/articles/5ba429ca249801)** — PR triggers Devin to draft test cases with rationale; ~35 min saved per 10 cases (JP).
- **[Event-driven Devin automation](https://zenn.dev/arufian/articles/f80a62f5217cee)** — Serverless GitHub-Actions pipeline with a priority×complexity policy table and plan-first approval flow (JP).
- **[Org rollout at Leverages](https://zenn.dev/levtech/articles/9c869303820844)** — 14 teams, 177 merged PRs, and an honest ACU-vs-wages ROI formula (JP).
- **[Rapid development with Devin](https://blog.scottlogic.com/2025/10/20/rapid-development-with-devin.html)** — Scott Logic's practitioner account, including the prompt-iteration lessons.
- **[Scott Wu on Cognition's internal usage](https://www.lennysnewsletter.com/p/how-devin-replaces-your-junior-engineers)** — how Cognition itself delegates: async junior-engineer workflow, top-5 task types, first-line-of-defense crash analysis.

## Community media

- **[Devin Central](https://devincentral.com)** — Fan-run news desk and tutorials covering what Cognition ships and why it matters. Run by Devin Ambassador Trevor Lowing.
- **[Voices — ambassador directory](https://devincentral.com/voices)** — Unofficial map of ~190 Devin Ambassadors worldwide.
- **[devin-cli.github.io](https://devin-cli.github.io)** — Community docs on what Devin's API, Slack, and Linear surfaces cover and how to automate them.
- **[Agents In Use](https://agentsinuse.com)** — Directory of real agent use cases, including Devin entries.
- **[BitsExplorer — Built with Devin](https://bitsexplorer.com/built-with/devin)** — 340+ public projects verified by Devin's commit trailer (evidence, not self-report).
- **[Vibe Coded Projects](https://vibedprojects.com/ai-tools/devin)** — 373 apps, tools and sites vibe-coded with Devin.

## Official resources

- [Devin Community](https://devin.ai/community) — events, ambassador applications, event support
- [docs.devin.ai](https://docs.devin.ai) — documentation: [Bots](https://docs.devin.ai/work-with-devin/bots), [Automations](https://docs.devin.ai/product-guides/automations), [Devin CLI](https://docs.devin.ai/cli/index.md)
- [Use-case gallery](https://docs.devin.ai/use-cases/gallery/index.md) — 40+ documented workflows with copy-paste prompts; [best practices for slicing work](https://docs.devin.ai/use-cases/best-practices.md)
- [devin.ai/brand](https://devin.ai/brand) — official brand kit
- [Devin Discord](https://devin.ai/community) and [r/DevinAI](https://www.reddit.com/r/DevinAI/) — official community spaces
- [CognitionAI/qa-devin](https://github.com/CognitionAI/qa-devin) — Cognition's own "Devin doing QA" reference repo
- [CognitionAI/devin-vuln-fixes](https://github.com/cognitionai/devin-vuln-fixes) — official agent skills that patch real CVEs (GitLab CVSS 10.0, PHP/Node RCEs): read-only inventory → approval gate → confirmed-target patch → before/after tests → one focused PR per repo
- [Train & deploy custom models on Modal with Devin](https://gist.github.com/dabit3/866caaab49a4a5371ae01655fecad34b) — Cognition engineer Nader Dabit's working template
- [Devin for Startups](https://devin.ai/startups) — up to $65k in credits for eligible teams; [Devin for Gaming](https://talofagames.com/devin-for-gaming/) — Talofa × Cognition 3-week studio cohort with in-person workshops and credit prizes
- [Devin Automations QuickStart](https://www.youtube.com/watch?v=6xxKtIpgOyE) — official video walkthrough of event/schedule-triggered agent setups, the substrate Bots build on
- [SWE-2 Flash](https://cognition.com/blog/swe-2-flash) — Cognition's fast coding model: outperforms all American open-weight models on leading evals, 3× SWE-2 speed at 1/5 the price
- [Devin Apps](https://devin.ai/blog/devin-apps) — live web apps Devin builds and serves from its own machine at a stable URL (internal tools, dashboards, staging copies)

## Contributing

Built something with Devin, or know a deployment we missed? See [CONTRIBUTING.md](CONTRIBUTING.md) — one line, link first, no marketing copy.

## License

[CC0-1.0](LICENSE) — dedicated to the public domain. Listings belong to their owners.
