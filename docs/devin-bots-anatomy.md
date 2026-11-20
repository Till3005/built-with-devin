---
layout: default
title: Anatomy of a Devin Bot — Built with Devin
---

# Anatomy of a Devin Bot

A deep dive into how Devin Bots actually work under the documented mechanics — for anyone evaluating, reproducing, or writing about them. Everything below is sourced from the [official docs](https://docs.devin.ai/work-with-devin/bots), the [launch post](https://devin.ai/blog/introducing-devin-bots), or named public deployments; each claim carries its source.

## The ownership model

A Bot is defined by an **outcome prompt** — a standing assignment, not a task queue entry. The canonical example is the Android Bot's prompt: *"your job is to product manage the android app."* From that single sentence the Bot decomposed the outcome into tickets it authored itself, then ran a Devin session per ticket ([launch post](https://devin.ai/blog/introducing-devin-bots)).

The operating loop:

```
outcome prompt → bot plans work → spawns Devin session per unit →
PRs land (or escalate) → memory updates → repeat
```

Key difference from a one-shot session: the Bot persists. The Android Bot ran **44 days** on one assignment; the human sent **183 messages total**, with a 22-day silent stretch where the Bot self-directed entirely ([X](https://x.com/DevinAI)).

## The six documented mechanisms

| Mechanism | What it does | Observed in |
| --- | --- | --- |
| **Chat** | The primary interface — you talk to the Bot like a teammate, in Devin, Slack, or iMessage | All deployments |
| **Sessions** | Each unit of work runs as a normal Devin session the Bot starts and supervises; you can open any session to inspect | Android Bot (1,134 sessions→PRs) |
| **Needs you** | The Bot's escalation channel — it surfaces only decisions requiring human judgment, not status noise | SuperJennyStack (emoji-only human replies) |
| **Memory** | A persistent, editable store the Bot accumulates — preferences, decisions, conventions — carried across weeks | Android Bot (44-day single assignment); Harvey Phil (memory + decision logs as the steering layer) |
| **Grants** | Bot-to-bot handoffs: a Bot can delegate a unit of work to another Bot with the right scope | Documented grant flow: QA Bot finds bug → grants fix to Dev Bot → re-tests → PM Bot reports |
| **Slack app** | Each Bot gets its own Slack presence so channels can address it like a person | tigsbot (one Slack channel per project) |

## What the public numbers actually show

| Metric | Deployment | Source |
| --- | --- | --- |
| 1,134 merged PRs / 344,651 lines Kotlin / 2,841 screenshot tests | Android Bot, 44 days | launch post |
| 88% of PRs self-merged | Android Bot | launch post |
| 159 PRs in 3 weeks, jank −70% | Layout Bot | launch post |
| ~50 → 1,900 PRs/week, studio revenue ×6 | SuperJennyStack | Jenny Xu |
| 1M+ lines Rust+TS in 3 weeks, zero human engineers | Harvey Phil | Gabe Pereyra |
| 4.5× more PRs merged per message (beta-wide) | 1,000+ beta testers | Fortune |
| 2,000+ PRs/week merged at Cognition; 40× merge throughput; 1,000+ PRs from one autonomous goal | Cognition internal | Fortune |
| Up to 2.5× throughput per GPU | Decagon AutoResearch | Decagon |

## Patterns that recur across deployments

- **Escalation-shaped work, not task-shaped work.** Bots that worked own an area ("the android app", "layout regressions", "onboarding QA") rather than a ticket list. Every failed or shallow deployment report boils down to prompts written as tasks instead of outcomes.
- **Consolidated human interface.** In multi-bot orgs (SuperJennyStack, Frankie, tigsbot) one chief-of-staff layer rolls every open decision into a single thread — the human never triages 20 bots.
- **Reference-anchored verification.** The deployments with the biggest numbers have an external truth source: real MS Word behavior (Phil), screenshot tests vs production builds (Android Bot), replayed production traffic (AutoResearch). Verification is what makes unattended merging safe.
- **Bots build bots.** Cognition reported bots operating bots internally; community deployments (Frankie, tigsbot) reproduce the same layering independently.

## Known boundaries

- Bots are strongest where "done" is checkable (tests, screenshots, replayed traffic, reference implementations). Open-ended judgment work still routes through Needs-you.
- Self-merge rates (88%) reflect repos where CI + review gates were already configured for autonomous merges — not a default.
- Memory is editable: operators can and do correct a bot's accumulated beliefs directly in its chat.
- **Fleet observability doesn't scale by itself.** The independent [100 Days of Devin](https://www.raijuna.com/blog/devin-100-day-challenge-day-1) log reports session tracking is the first operational wall at ~15 bots ("which one produced this PR?"), and environment setup alone consumed ~18% of weekly quota.

## Sources

- [Introducing Devin Bots](https://devin.ai/blog/introducing-devin-bots) — launch post
- [Devin Bots docs](https://docs.devin.ai/work-with-devin/bots) — mechanics
- [Fortune exclusive](https://fortune.com/2026/11/17/exclusive-cognition-bets-on-devin-bots-coding-agents-in-challenge-to-anthropics-duet-and-openais-dots/) — beta metrics
- Named deployments linked from the [README](../README.md#documented-deployments)
