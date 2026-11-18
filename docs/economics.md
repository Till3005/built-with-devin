# The economics of Devin

A running ledger of the *published, auditable* cost/return numbers — the thing every evaluation eventually asks for. Only figures that appear in a named customer story or a public report are included; nothing is extrapolated.

## Unit economics

| Number | Deployment | Context |
| --- | --- | --- |
| **~$17/hour** of engineering output | [Compiled Health](https://devin.ai/customers/compiledhealth) | ~430 engineer-hours delivered by 2 researchers in 2 months — "≈ +4 engineers" on a 4-person team |
| **20× cost savings** | [Nubank](https://devin.ai/customers/nubank) | Migration program vs. the same work staffed conventionally; 8–12× engineering efficiency alongside |
| **85% cost reduction** on legacy-app revamps | [The Citation Group](https://devin.ai/customers/thecitationgroup) | ROI-measured rollout; 271 merged PRs @ 80% in 3 months |
| **50% engineering efficiency gain** | The Citation Group | Same study |

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
| 3× deployment growth in four months; 78% PR merge rate | [Endava](https://devin.ai/customers/endava) (2,000+ employees) |

## The honest-ledger rule

The most useful economics report is also the least flattering: **Leverages (JP)** published its rollout with a literal ACU-spend-vs-salary comparison across 14 teams and 177 merged PRs — including the conclusion that returns depend on task mix, not on "agent hours" as a fungible unit ([report](https://zenn.dev/levtech/articles/9c869303820844)).

Pattern across the numbers that hold up:

- Wins concentrate where work is **voluminous and checkable** — migrations, connector maintenance, hygiene loops, test coverage — not where work is ambiguous.
- The reported multipliers come from orgs that built the surrounding machinery (playbooks, review gates, reference benchmarks). No published case reports high ROI from ad-hoc usage.
- Time-to-first-value is consistently short: AHEAD measured full productivity in 2 business days; Courtney shipped to production in ~21 hours.

## Sources

Every figure above links to the named customer story at [devin.ai/customers](https://devin.ai/customers) or the cited public report. If a number here is later revised by its source, the table follows the source.
