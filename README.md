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

Launched **November 17, 2026** ([announcement](https://devin.ai/blog/introducing-devin-bots), [docs](https://docs.devin.ai/work-with-devin/bots)). A Bot is a persistent agent that owns an outcome: it plans the work, runs a Devin session for each piece, keeps memory across weeks, and brings you only the decisions that need your judgment. Bots live in Slack and iMessage, run on schedules or event triggers, and hand work between each other through grants.

### Documented deployments

- **Android Bot** — Cognition had an iOS app, no Android team. Prompted with *"your job is to product manage the android app"*, the Bot filed its own tickets, ran a Devin session per ticket, and shipped the app to open beta on Google Play in **44 days**: 1,134 PRs merged, 344,651 lines of Kotlin, 2,841 screenshot tests — while its human sent ~1 message per 6 PRs. It now owns Android feature parity with iOS.
- **Layout Bot** — Owns layout-shift regression on the Devin web app. Every 3 hours it builds production `main` on its own machine, simulates first/repeat/delayed-request visits, traces regressions to the introducing PR, and opens fixes with before/after videos. **159 PRs merged in 3 weeks; lag down 70%.**
- **Super Jenny** — A mobile game studio staffed by ~20 Bots (development, Unity, releases, UI, iOS, Android, device testing) reporting to one orchestrating Bot. The studio's only human answers a consolidated Slack thread 4×/day **with emoji**. Output went from ~50 to **1,900 PRs/week**, shipping weekly.

### Documented patterns

- **Outcome prompts** — *"You own the Android app now. Keep it at feature parity with iOS."* Give the Bot a goal, not a backlog.
- **Bot-to-bot handoffs** — grants let a QA Bot find a bug, pull in a Developer Bot to fix it, retest on staging, and have a PM Bot report status to the channel.
- **Scheduled checks** — a Bot that watches an alerts channel on a cron, owns the check, and opens fixes when it regresses (Layout Bot pattern).
- **Roll-up reporting** — one supervising Bot collects every subordinate Bot's pending decisions into a single thread (SuperJennyStack pattern — Jenny's ~20-Bot studio stack is published as a community template).
- Reported results: beta testers merge **4.5× more PRs per message**; Cognition merges 2,000+ PRs/week.

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
- **[devin-teams-bot](https://github.com/appwiz/devin-teams-bot)** — Microsoft Teams integration for Devin sessions.
- **[Buzz for Devin](https://github.com/fenner888/BuzzforDevin)** — Community fork of Block's Buzz adding the official Devin CLI (`devin acp`) as a native runtime, so each person brings their own authenticated Devin into shared agent-native communities.
- **[devin-sse-proxy](https://github.com/sotayamashita/devin-sse-proxy)** — Minimal MCP server letting Claude Desktop talk to Devin's SSE transport while passing a Personal API Key.
- **[devin-flow](https://github.com/xlm/devin-flow)** — Visual editor for event-driven Devin workflows on the Automations API, with session tracking (FastAPI + Vue 3).

## SDKs & API tooling

- **[go-devin](https://github.com/gassara-kys/go-devin)** — Go SDK for the Devin API.
- **[llm-devin](https://github.com/ftnext/llm-devin)** — Plugin for Simon Willison's `llm` CLI to call the Devin API.

## Tooling around Devin

Things the community builds *for* Devin rather than *with* it.

- **[DevinX / Devinmaxxing](https://x.com/_markfenner)** — Mark Fenner's local model picker for Devin Desktop sessions: local weights via ACP, adaptive cost balancing, reasoning-effort control.
- **[awesome-devin](https://github.com/Icaro0310/awesome-devin)** — The `devin-*` open-source tooling ecosystem: session search, history export, knowledge graphs, eval harnesses, backup, fan-out planners.
- **[devin-judge](https://github.com/Icaro0310/devin-judge)** — Calibrated local-first decision layer with a Devin ACP backend; no API key needed.
- **[devin-fusion-byok](https://github.com/kuobibulaien/devin-fusion-byok)** — Bring your own OpenAI-compatible models to Devin Local and Fusion.
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

## Contributing

Built something with Devin, or know a deployment we missed? See [CONTRIBUTING.md](CONTRIBUTING.md) — one line, link first, no marketing copy.

## License

[CC0-1.0](LICENSE) — dedicated to the public domain. Listings belong to their owners.
