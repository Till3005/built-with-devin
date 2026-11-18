<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/devin-symbol-dark.svg">
  <img src="assets/devin-symbol.svg" alt="Devin" width="72">
</picture>

# Built with Devin

**A community showcase of things built by or around [Devin](https://devin.ai)** — real products, Bots, integrations, SDKs, and documented patterns for Cognition's AI software engineer.

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](LICENSE)

Curated by [@darega0mae](https://x.com/darega0mae) · [Add your project](CONTRIBUTING.md)

</div>

> *Unofficial community project — not affiliated with, endorsed by, or sponsored by Cognition AI. "Devin" is a trademark of Cognition AI. Brand assets are used under the official kit at [devin.ai/brand](https://devin.ai/brand). Official docs: [docs.devin.ai](https://docs.devin.ai).*

## Contents

- [Devin Bots — official product](#devin-bots--official-product)
- [Products built with Devin](#products-built-with-devin)
- [Bots & surfaces](#bots--surfaces)
- [SDKs & API tooling](#sdks--api-tooling)
- [Tooling around Devin](#tooling-around-devin)
- [Patterns & write-ups](#patterns--write-ups)
- [Community media](#community-media)
- [Official resources](#official-resources)

## Devin Bots — official product

Launched **November 17, 2026** ([announcement](https://devin.ai/blog/introducing-devin-bots), [docs](https://docs.devin.ai/work-with-devin/bots), [Fortune exclusive](https://fortune.com/2026/11/17/exclusive-cognition-bets-on-devin-bots-coding-agents-in-challenge-to-anthropics-duet-and-openais-dots/)). A Bot is a persistent agent that owns an outcome: it plans the work, runs a Devin session for each piece, keeps memory across weeks, and brings you only the decisions that need your judgment. Bots live in Slack and iMessage, run on schedules or event triggers, and hand work between each other through grants. Bots incorporate technology from the Interaction Company (Poke), which Cognition acquired in July 2026.

### Documented deployments

- **Android Bot** — Cognition had an iOS app, no Android team. Prompted with *"your job is to product manage the android app"*, the Bot filed its own tickets, ran a Devin session per ticket, and shipped the app to open beta on Google Play in **44 days**: 1,134 PRs merged, 344,651 lines of Kotlin, 2,841 screenshot tests. Its human sent **183 messages total** — 22 days of complete silence — and **88% of PRs were self-merged**. It now owns Android feature parity with iOS.
- **Layout Bot** — Owns layout-shift regression on the Devin web app. Every 3 hours it builds production `main` on its own machine, simulates first/repeat/delayed-request visits, traces regressions to the introducing PR, and opens fixes with before/after videos. **159 PRs merged in 3 weeks; lag down 70%.**
- **Super Jenny** — A mobile game studio staffed by ~20 Bots (development, Unity, releases, UI, iOS, Android, device testing) reporting to one orchestrating Bot. The studio's only human answers a consolidated Slack thread 4×/day **with emoji**. Output went from ~50 to **1,900 PRs/week** and studio revenue 6×'d, shipping weekly ([Jenny's own thread](https://x.com/xujennyc)).
- **Onboarding QA Bot** — Cognition's Walden Yan runs a Bot that QA's **30+ onboarding flows 24/7**: it maintains self-updating Playwright scripts, keeps an agent job queue, and built itself a live board view — "found way more bugs than I would have had patience to discover" ([@walden_yan](https://x.com/walden_yan)).
- **Harvey "Phil"** — Harvey's Assistant team used ~30 agents to build a **collaborative Word-compatible editor engine** (Rust + TypeScript, 1M+ lines) in three weeks with no human engineers — verified continuously against real Microsoft Word behavior and simulated lawyer negotiations, steered through accumulated memory and decision logs ([Gabe Pereyra's write-up](https://x.com/gabepereyra)).
- **Decagon bot fleet** — during beta, Decagon teams stood up **50+ shared Bots** in Slack covering on-call, DevEx optimization, and a Chief of Staff Bot that decides when to spawn threads ([@tylerxdev](https://x.com/tylerxdev)).
- **Bryan Johnson's personal Bots** — a Bot synthesizes years of his biometric and brain-scan data into a single health readout; another texts his mother a daily update on how he's doing ([launch video](https://vimeo.com/1247688199), [@bryan_johnson](https://x.com/bryan_johnson)).

### Documented patterns

- **Outcome prompts** — *"You own the Android app now. Keep it at feature parity with iOS."* Give the Bot a goal, not a backlog.
- **Bot-to-bot handoffs** — grants let a QA Bot find a bug, pull in a Developer Bot to fix it, retest on staging, and have a PM Bot report status to the channel.
- **Scheduled checks** — a Bot that watches an alerts channel on a cron, owns the check, and opens fixes when it regresses (Layout Bot pattern).
- **Roll-up reporting** — one supervising Bot collects every subordinate Bot's pending decisions into a single thread (SuperJennyStack pattern — Jenny's ~20-Bot studio stack is published as a community template).
- Reported results: **1,000+ beta testers** in the weeks before launch; testers merge **4.5× more PRs per message**; Cognition merges 2,000+ PRs/week and 40×'d its merged-PR throughput, with 1,000+ PRs landed from a single autonomous goal. Named early-access customers include **Decagon, Fireworks AI, and Reducto**, with usage up 10× in the first two weeks ([Fortune](https://fortune.com/2026/11/17/exclusive-cognition-bets-on-devin-bots-coding-agents-in-challenge-to-anthropics-duet-and-openais-dots/)).
- Other documented usage: preemptive issue triage on **Manim** (the open-source math-visualization repo), firmware work, a bot-led team building a **frontier inference engine**, tennis analytics, accounting automation (trybasis: 20h task → 30 min), and swyx's week-long trial handing over AEO, QA, cross-platform porting, personal admin, and video editing ([@swyx](https://x.com/swyx)) — see the [reproduction guide](docs/reproducing-devin-bots.md#reported-usage-beyond-cognition).

### Official template library

Sixteen ready-made Bots on the [public marketplace](https://devin.ai/bots/templates): Software Factory, Product Engineer, QA Engineer, Anomaly Watcher, Code Reaper, Chief of Staff, Migration Engineer, Latency Optimizer, iOS Engineer, Android Engineer, Internal Tools Engineer, Data Analyst, Devin Coach, Code Health Engineer, Technical Writer, Compliance Engineer — plus community templates like **SuperJennyStack**.

**[→ Reproduction guide: how to rebuild every documented Bot](docs/reproducing-devin-bots.md)**

## Products built with Devin

Real software where Devin wrote the code — not demos, shipped work.

*Know a shipped product built with Devin? [Add it](CONTRIBUTING.md).*

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

## Community media

- **[Devin Central](https://devincentral.com)** — Fan-run news desk and tutorials covering what Cognition ships and why it matters. Run by Devin Ambassador Trevor Lowing.
- **[Voices — ambassador directory](https://devincentral.com/voices)** — Unofficial map of ~190 Devin Ambassadors worldwide.
- **[devin-cli.github.io](https://devin-cli.github.io)** — Community docs on what Devin's API, Slack, and Linear surfaces cover and how to automate them.
- **[Agents In Use](https://agentsinuse.com)** — Directory of real agent use cases, including Devin entries.

## Official resources

- [Devin Community](https://devin.ai/community) — events, ambassador applications, event support
- [docs.devin.ai](https://docs.devin.ai) — documentation: [Bots](https://docs.devin.ai/work-with-devin/bots), [Automations](https://docs.devin.ai/product-guides/automations), integrations
- [devin.ai/brand](https://devin.ai/brand) — official brand kit
- [Devin Discord](https://devin.ai/community) and [r/DevinAI](https://www.reddit.com/r/DevinAI/) — official community spaces
- [CognitionAI/qa-devin](https://github.com/CognitionAI/qa-devin) — Cognition's own "Devin doing QA" reference repo
- [Devin Automations QuickStart](https://www.youtube.com/watch?v=6xxKtIpgOyE) — official video walkthrough of event/schedule-triggered agent setups, the substrate Bots build on

## Contributing

Built something with Devin, or know a deployment we missed? See [CONTRIBUTING.md](CONTRIBUTING.md) — one line, link first, no marketing copy.

## License

[CC0-1.0](LICENSE) — dedicated to the public domain. Listings belong to their owners.
