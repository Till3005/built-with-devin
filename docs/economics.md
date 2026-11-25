---
layout: default
title: The economics of Devin — Built with Devin
---

# The economics of Devin

A running ledger of the *published, auditable* cost/return numbers — the thing every evaluation eventually asks for. Only figures that appear in a named customer story or a public report are included; nothing is extrapolated.

## Unit economics

| Number | Deployment | Context |
| --- | --- | --- |
| **~$17/hour** of engineering output | [Compiled Health](https://devin.ai/customers/compiledhealth) | ~430 engineer-hours delivered by 2 researchers in 2 months — "≈ +4 engineers" on a 4-person team |
| **20× cost savings** | [Nubank](https://devin.ai/customers/nubank) | Migration program vs. the same work staffed conventionally; 8–12× engineering efficiency alongside |
| **85% cost reduction** on legacy-app revamps | [The Citation Group](https://devin.ai/customers/thecitationgroup) | ROI-measured rollout; 271 merged PRs @ 80% in 3 months |
| **50% engineering efficiency gain** | The Citation Group | Same study |
| **37% net cost saving** vs a conventional rebuild | [Odyssey Logistics](https://news.cognizant.com/2026-09-23-Cognizant-and-Cognition-put-autonomous-AI-engineering-into-production-at-Odyssey-Logistics,-with-a-37-percent-net-cost-saving) | Cognizant-delivered Access/VBA → cloud-native TMS; fixed budget, accelerated timeline, delivery throughput up ~⅓ |
| Job sized at **5–10 engineers × a year**, done by 3 engineers + a ~10-agent Devin fleet in weeks | [Gamma](https://research.gamma.app/2026/11/pptx-import) | PowerPoint import rebuilt via 3,500+ merges; sister program's human interventions fell 10–15/deck → full autonomy |

## Throughput per person

| Number | Deployment |
| --- | --- |
| ~100 PRs/day from a small team | [Melius](https://devin.ai/customers/melius) |
| 1,800+ PRs in 6 weeks from an 8-person team | [Tavrn](https://devin.ai/customers/tavrn) (HIPAA-restricted fleet) |
| 50 → 170 weekly backend PRs in four weeks | [Común](https://devin.ai/customers/comun) (13-person fintech) |
| 80 merged PRs/week, 10,000+ engineer-hours saved | [Ramp](https://devin.ai/customers/ramp) |
| 92% of merged PRs authored by Devin | [EBANX](https://devin.ai/customers/ebanx) |
| 30% more PRs per engineer vs. Claude Code alone | [Latent Health](https://devin.ai/customers/latent) |
| ~2× user-story output in three months | [GE Aerospace](https://devin.ai/customers/geaerospace) |
| 2× engineering throughput; 4× faster automation rollout | [Rohlik Group](https://devin.ai/customers/rohlikgroup) |
| 3× deployment growth in four months; 78% PR merge rate | [Endava](https://devin.ai/customers/endava) (2,000+ employees) | |
| **93% of merged code Devin-originated**; alert→investigation 35s | [Tavrn](https://devin.ai/customers/tavrn) |
| 20–40 bugs/alerts first-passed daily in ~5 min; Sentry noise −50% | [Crosby](https://devin.ai/customers/crosby) |
| 25% of total code volume — tied top contributor | [Hamming](https://devin.ai/customers/hamming) |
| **40× merged-PR throughput on 2.7× headcount** (>10×/engineer) | [Cognition internal](https://aietalks.com/talks/40x-more-merged-prs-with-2-7x-the-engineers) |
| 4-week client migration delivered in 2.5 weeks | [Zeb](https://devin.ai/blog/devin-for-databricks-migrations) (NetSuite→Databricks delivery partner) |

## The honest-ledger rule

Cognition's own [18-month performance review](https://cognition.com/blog/devin-annual-performance-review-2025) supplies the rarest numbers — a vendor publishing its own yardstick: PR merge rate 34%→67%, vulnerability fixes 20× faster than humans (30 min→1.5 min each), ETL migrations 10×, typical coverage 50–60%→80–90%, ~⅓ of its own webapp commits Devin-authored. Vendor-published, but unusually falsifiable.

The most useful economics report is also the least flattering: **Leverages (JP)** published its rollout with a literal ACU-spend-vs-salary comparison across 14 teams and 177 merged PRs — including the conclusion that returns depend on task mix, not on "agent hours" as a fungible unit ([report](https://zenn.dev/levtech/articles/9c869303820844)).

Pattern across the numbers that hold up:

- Wins concentrate where work is **voluminous and checkable** — migrations, connector maintenance, hygiene loops, test coverage — not where work is ambiguous.
- The reported multipliers come from orgs that built the surrounding machinery (playbooks, review gates, reference benchmarks). No published case reports high ROI from ad-hoc usage.
- Time-to-first-value is consistently short: AHEAD measured full productivity in 2 business days; Courtney shipped to production in ~21 hours.

## Sources

Every figure above links to the named customer story at [devin.ai/customers](https://devin.ai/customers) or the cited public report. If a number here is later revised by its source, the table follows the source.
