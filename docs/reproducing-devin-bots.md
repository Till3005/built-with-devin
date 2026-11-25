---
layout: default
title: Reproducing Devin Bots — a field guide — Built with Devin
---

# Reproducing Devin Bots — a field guide

Everything publicly documented about how the flagship Devin Bots were set up, condensed into recipes you can recreate. Sources: [Cognition's launch post](https://devin.ai/blog/introducing-devin-bots) (Nov 17, 2026), the [Bots docs](https://docs.devin.ai/work-with-devin/bots), the [Fortune exclusive](https://fortune.com/2026/11/17/exclusive-cognition-bets-on-devin-bots-coding-agents-in-challenge-to-anthropics-duet-and-openais-dots/), and Jenny Xu's [SuperJennyStack thread](https://x.com/cognition/status/2122737511684587551).

## How a Bot works (mechanics)

From the docs:

1. **Create** — sidebar → Bots → *Create new Bot* → pick a template or *Start from scratch*. New Bots are private until shared.
2. **Outcome prompt** — the first message assigns ownership: `You own the Android app now. Keep it at feature parity with iOS.` Give it a *goal*, not a task.
3. **Sessions** — the Bot files its own tickets and runs one Devin session per piece, each on its own cloud machine.
4. **Automations** — ask the Bot in chat to run something on a schedule or trigger (e.g. "morning summary of open PRs"). It proposes the automation; you approve once.
5. **Needs you** — decisions, PR reviews, permission requests and reports land in one list; the Bot marks its recommended option.
6. **Instructions & memory** — humans edit instructions (read at every session start); the Bot writes its own memory files as it learns.
7. **Surfaces** — give the Bot its own Slack app for @-mentions/DMs, or text it on iMessage.
8. **Grants** — Bot A can be granted read/message access to Bot B; this is how bots hand work to each other.

Check-in pattern: `anything waiting on me?`

## Recipe 1 — Product-owner Bot (Android Bot)

**Outcome:** build and then own a whole product surface.

- **Prompt** (verbatim, from Cognition): *"your job is to product manage the android app. Basically, you're going to autonomously create the entire thing, but we need to figure out what the blockers are for you doing that first."*
- **First phase:** have the Bot enumerate blockers — where code lives, how to test builds, how changes merge — before it writes code.
- **Loop:** Bot files tickets → one session per ticket → PRs gated on CI + Devin Review → merges.
- **Reporting:** daily Slack report with a screen recording of what changed.
- **Human load:** ~1 message per 6 merged PRs; many days zero. Messages mostly answer human-judgment items (e.g. security review) — or set direction ("be more ambitious").
- **Steady state:** the Bot keeps parity with the reference project and triages beta reports.
- **Numbers:** [Cognition reports](https://devin.ai/blog/introducing-devin-bots) 44 days and 1,134 merged PRs.

## Recipe 2 — Scheduled-check Bot (Layout Bot)

**Outcome:** own a recurring quality check and the fixes it uncovers.

- **Prompt pattern:** *"Your job is to keep <surface> from <regressing>. Watch <channel/check>, where <check> posts every <interval>. Take over that check and keep it working as the UI changes. When something regresses, find the cause and open a fix with a before-and-after video."*
- **Automation:** cron every 3h — build production `main` on its own VM, run the check under realistic conditions (first visit, repeat visit, individually delayed requests).
- **Noise handling:** rerun flaky checks before acting; trace each regression to the introducing PR.
- **Output:** small PRs with before/after video evidence.
- **Numbers:** 159 PRs in 3 weeks, lag −70%. Works because each check+fix is small and continuously re-verified.

## Recipe 3 — Multi-bot org (SuperJennyStack)

**Outcome:** a whole business run by a Bot hierarchy; the human decides, emoji-style.

Jenny Xu's game studio — ~20 Bots, each owning one job. The stack as she published it:

| Bot | Owns |
|---|---|
| **SuperJenny** | Orchestration: delegates to all others, compiles their asks into one thread; trained on her personality/quirks |
| **SuperPM** | Ranked daily fix list from metrics + store reviews + trends |
| **SuperRelease** | Weekly build, ready for store submission Friday |
| **SuperQA** | Real-device tests with video proof |
| **SuperSupport** | Drafts every store-review reply for approval; helps players overnight |

Remaining ~15 Bots cover development, Unity, UI, iOS, Android, analytics, etc.

- **Reporting cadence:** SuperJenny collects every subordinate Bot's pending decisions into **one Slack thread, 4×/day**; the human answers with emoji.
- **Mechanics:** create one Bot per job, grant the orchestrator read/message access to each, and instruct it to run the roll-up.
- **Numbers:** [Cognition reports](https://devin.ai/blog/introducing-devin-bots) a rise from about 50 to 1,900 PRs per week, with weekly releases.
- **Variant (official):** QA Bot finds bug → hands to Developer Bot via grant → Developer fixes → QA retests on staging → PM Bot reports status in channel.

## Recipe 4 — One-job Bots (official template patterns)

Each [official template](https://devin.ai/bots/templates) encodes one reproducible loop:

| Template | Loop | Cadence |
|---|---|---|
| Software Factory | Finds bugs/polish/perf/refactors in an area you name → one small PR each w/ proof; learns from your merge/close decisions | Continuous |
| Product Engineer | Ticket → tested PR → through review | Per ticket |
| QA Engineer | Tests each PR in a real browser, posts video + pass/fail | Per PR |
| Anomaly Watcher | Sweeps product + business data for unwatched problems, posts findings w/ owner | 2×/day |
| Code Reaper | Finds dead code, removes it one safe PR at a time w/ justification | Weekly |
| Chief of Staff | Watches channels, posts updates, delegates + tracks to done | Continuous |
| Migration Engineer | Owns one big migration as small tracked PRs; reports progress & blockers | Continuous |
| Latency Optimizer | Finds slowest endpoints/jobs/queries, fixes worst one w/ before/after numbers | Weekly |
| iOS / Android Engineer | Ticket → PR w/ tests + installable build (TestFlight / internal testing) | Per ticket |
| Internal Tools Engineer | Builds + runs + updates an internal tool on request | On demand |
| Data Analyst | Answers data questions w/ chart + underlying query + caveats | On demand |
| Devin Coach | Weekly report: where Devin got stuck + one fix each (note, skill, setup change) | Weekly |
| Code Health Engineer | Stale flags, old deps, CVEs → small safe PRs | Monthly |
| Technical Writer | Keeps repo wikis/diagrams in step with `main` after merges | Per merge |
| Compliance Engineer | Collects control evidence from code, warns when a control lapses | Continuous |

## Reported usage beyond Cognition

Named beta deployments (all reported Nov 17–18, 2026, day-one of launch):

- **Harvey — “Phil”** — [Gabe Pereyra reports](https://x.com/gabepereyra/status/2122756324173992166) that an all-agent team wrote over a million lines in three weeks for a collaborative, Word-compatible editor.
- **Decagon — shared Bot fleet** ([@tylerxdev's thread](https://x.com/tylerxdev/status/2122743518712287400)) — 50+ shared Bots in Slack after a few weeks of early access: on-call, DevEx optimization, and a Chief of Staff Bot the team messages instead of managing threads by hand. Lesson: Bots are multiplayer — one shared Bot carries the team's accumulated context, which single-user sessions can't.
- **Decagon — AutoResearch** ([full writeup](https://x.com/DecagonAI/article/2115511110120120437), [@devindevelopers](https://x.com/devindevelopers/status/2115601107581821172)) — one Devin orchestrates an inference research lab on Devin Cloud; subagents chase competing hypotheses in parallel and every idea is verified against replayed production traffic on Modal GPUs. Up to 2.5× more throughput per GPU. Lesson: give the loop a *measurable* reward (requests/sec/GPU inside a latency SLA) and let findings compound off the last verified baseline.
- **Mark Fenner — "Frankie's org"** ([walkthrough](https://x.com/markfenner/status/2122740244328145211)) — an ambassador running four Bots with distinct jobs under a coordinating Chief Agent Bot that brings consolidated updates back. Lesson: even a solo operator can run the multi-Bot org shape — one coordinator is the single decision surface.
- **Bryan Johnson — personal data Bots** ([post](https://x.com/bryan_johnson/status/2122814114976383406), [launch video](https://x.com/cognition/status/2122737511684587551)) — one Bot synthesizes years of biometric data (incl. brain scans) into a single health readout; another texts his mother a daily update on how he's doing. Lesson: Bots are not limited to codebases — "owning an outcome" extends to personal data pipelines and recurring outbound comms.
- **Raijuna — "100 Days of Devin" build-log** ([day 1](https://www.raijuna.com/blog/devin-100-day-challenge-day-1)) — the first post-launch independent fleet operator: someone already shipping hundreds of PRs/day from his own agent factory ports it to ~15 Devin Bots. Early findings worth reproducing against: session tracking is the first thing that doesn't scale ("which one produced a PR? which one needs me?"), Bots' video QA beats screenshot QA, and setup alone consumed 18% of the weekly quota. Ongoing series — the closest thing to a public Bots SRE log.
- **swyx — generalist trial** ([his summary](https://x.com/swyx/status/2122746401482592549), [technical notes](https://x.com/swyx/status/2122818291144229075)) — a week of handing over answer-engine optimization, QA, cross-platform app porting, personal admin automation, and video editing. His read: don't sell "AI employees"; sell the abstraction level above single tasks — managers that own outcomes. Note his architecture detail: each Bot keeps its own memory bank; cross-Bot knowledge sharing is not automatic.
- **Noah Zixin Zhang — SupaSEO** — The founder [reports](https://x.com/noah_z_zhang/status/2124631768594563315) that Devin Bots built his local SEO and AI-citation tracker in 48 hours.

From the [launch video](https://x.com/cognition/status/2122737511684587551) and early-user reports ([daily.dev summary](https://daily.dev/posts/devin-bots-want-to-be-your-agent-manager-not-your-ai-employee-hhpjo94uh)):

- **Open-source repo maintenance** — a Bot preemptively triaging issues on Manim, the math-visualization open-source project, so the maintainer spends time on the code that matters.
- **Firmware / hardware** — Bots owning firmware work so the hardware builder "stays close to the things they love".
- **Tennis analytics** — a Bot gathering scattered tennis data into performance insight.
- **Accounting automation** — trybasis: agents cutting a 20-hour accounting task to ~30 minutes.
- **Inference engineering** — Cognition's Walden Yan reports a bot-led effort that built a frontier inference engine: 40×'d merged-PR throughput, 1,000+ PRs from one autonomous goal ([@walden_yan](https://x.com/walden_yan)).
- **Research acceleration** — Cognition's research team organically moved day-to-day work onto Bots; latest sprint "compressed weeks into days" ([@silasalberti](https://x.com/silasalberti)).
- **Dogfooding note** — per Cognition's Russell Kaplan, the Android Bot autonomously caught and fixed an iOS/web-side regression caused by a breaking change; Bots have even built other Bots inside the company ("Bots built Bots").

## Operating tips (what the successful ones share)

- **Outcome > task:** "own checkout" not "fix the checkout button". The Bot re-plans; a task ends.
- **Small PRs with proof:** every documented Bot ships small, verifiable units — video evidence, before/after numbers, "why it's safe".
- **Gate on CI + review, not vibes:** PRs merge when checks and Devin Review pass.
- **One decision surface:** let the Bot batch asks (Needs you / a daily thread) instead of interrupting.
- **Teach through memory:** corrections and preferences become memory files; Cognition merges 2,000+ PRs/week this way.
- **Give the Bot a Slack app and a name:** every reported deployment runs in Slack as a team member people @-mention.
