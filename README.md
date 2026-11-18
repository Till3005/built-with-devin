# Built with Devin

> A community showcase of things **built by or around Devin** — real products, bots, integrations, SDKs, and patterns for working with Cognition's AI software engineer.

Curated by [@darega0mae](https://x.com/darega0mae). Submissions welcome — see [Contributing](CONTRIBUTING.md).

*This is an unofficial community project, not affiliated with, endorsed by, or sponsored by Cognition AI. "Devin" is a trademark of Cognition AI. For official documentation, see [docs.devin.ai](https://docs.devin.ai).*

## Contents

- [Products built with Devin](#products-built-with-devin)
- [Bots & surfaces](#bots--surfaces)
- [SDKs & API tooling](#sdks--api-tooling)
- [Tooling around Devin](#tooling-around-devin)
- [Patterns & write-ups](#patterns--write-ups)
- [Community media](#community-media)
- [Official resources](#official-resources)

## Products built with Devin

Real software where Devin wrote the code — not demos, shipped work.

- **[Moonshore](https://x.com/darega0mae)** — Multi-tenant B2B travel-agency ERP built end-to-end with Devin: order lifecycles, double-entry accounting, PostgreSQL RLS isolation, and a lunar-phase dithered-sea UI. 100+ Devin-driven PRs.
- **[devin-desktop-lite](https://github.com/Till3005/devin-desktop-lite)** — Unofficial desktop client & terminal harness for the Devin CLI: ACP communication, multi-agent dynamic workflows, heap-pressure eviction for long-running session boards.
- **Distillation Encyclopedia** — 300+ chapters of book and topic distillations produced by structured Devin workflows, with a static knowledge-base app and EPUB pipeline.
- **FDE Course Platform** — Forward Deployed Engineer training platform (FastAPI + web) built with Devin: interactive lessons, quizzes, grading, instructor tooling.

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
- [docs.devin.ai](https://docs.devin.ai) — official documentation (Automations, Bots, integrations)
- [Devin Discord](https://devin.ai/community) and [r/DevinAI](https://www.reddit.com/r/DevinAI/) — official community spaces
- [CognitionAI/qa-devin](https://github.com/CognitionAI/qa-devin) — Cognition's own "Devin doing QA" reference repo

## License

[CC0-1.0](LICENSE) — dedicated to the public domain. Listings belong to their owners.
