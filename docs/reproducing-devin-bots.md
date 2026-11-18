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
- **Numbers:** 44 days, 1,134 PRs, 344k LOC Kotlin, 2,841 screenshot tests, 1,217 tickets.

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
- **Numbers:** ~50 → 1,900 PRs/week; weekly releases; 6× studio revenue. Shared as a **community template** in the Bot marketplace ("SuperJennyStack").
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

## Operating tips (what the successful ones share)

- **Outcome > task:** "own checkout" not "fix the checkout button". The Bot re-plans; a task ends.
- **Small PRs with proof:** every documented Bot ships small, verifiable units — video evidence, before/after numbers, "why it's safe".
- **Gate on CI + review, not vibes:** PRs merge when checks and Devin Review pass.
- **One decision surface:** let the Bot batch asks (Needs you / a daily thread) instead of interrupting.
- **Teach through memory:** corrections and preferences become memory files; Cognition merges 2,000+ PRs/week this way.
- **Give the Bot a Slack app and a name:** every reported deployment runs in Slack as a team member people @-mention.
