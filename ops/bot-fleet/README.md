# Lean Devin Bot fleet

This directory is the control plane for the four-Bot fleet that maintains:

- `Till3005/built-with-devin`, the verified registry.
- `Till3005/build-with-devin`, the systematic curriculum.

The fleet is intentionally small. Each Bot owns one outcome, writes through pull requests, and escalates judgment calls instead of guessing.

## Operating shape

| Bot | Owns | Writes | Must escalate |
| --- | --- | --- | --- |
| Editor-in-Chief | Editorial quality, release rhythm, cross-repo arbitration | Triage comments, release checklists, small editorial PRs | Curriculum restructure, disputed claims, external posts, permission expansion |
| Source Scout | Official and community source discovery | Candidate intake notes with source URLs, claims, hard numbers, and confidence | Paywalled or ambiguous sources, unsupported numbers |
| Registry Maintainer | `built-with-devin` accuracy and machine-readable exports | Registry entry PRs, link fixes, generated `docs/` artifacts | New evidence categories, weak evidence, large taxonomy changes |
| Growth Ops | Build-in-public operations and Ambassador evidence | Article/social drafts, video scripts, distribution plans, evidence reports | External posting, unverified claims, sensitive-data handling, official-facing statements |

In this lean version, final evidence verification is shared: Source Scout performs first-pass verification, Registry Maintainer re-verifies registry evidence before publication, and Editor-in-Chief owns curriculum coverage and quality. Growth Ops may use only verified evidence in public-facing drafts.

## Pipeline

1. Source Scout scans official and community sources on a bounded schedule.
2. Source Scout emits structured candidates. Duplicate and unsupported candidates stop here.
3. Registry Maintainer verifies each source again, writes accepted entries, and runs the registry pipeline.
4. Editor-in-Chief reads newly verified entries and the official documentation coverage matrix.
5. Editor-in-Chief opens small guide correction PRs, reproduction-evidence PRs, or clearly scoped curriculum gaps.
6. Growth Ops turns verified merged outcomes into draft articles, posts, video scripts, and Ambassador evidence. Nothing is posted externally without owner approval.
7. Editor-in-Chief reviews the queue, resolves conflicts, and prepares the weekly release summary.
8. The human owner approves structural changes, external communication, permission expansion, sensitive-data handling, and expensive reproduction work.

## Cadence and budget

- Source Scout: three scheduled runs per week. Batch findings into one report per run.
- Registry Maintainer: event-driven on verified intake, plus one weekly consistency pass.
- Editor-in-Chief: one weekly coverage/release pass, plus event-driven triage when CI fails or a PR is blocked.
- Growth Ops: one weekly approval packet after verified evidence lands, plus event-driven drafts for official interactions.
- Child sessions: at most two concurrent sessions across the fleet.
- No Bot runs a broad reproduction or rewrite loop without explicit approval.

## Activation checklist

1. Create four Bots in Devin.
2. Paste the matching file from `prompts/` into each Bot as its first outcome prompt.
3. Give each Bot access only to the repositories named in `manifest.json`.
4. Keep every Bot private until its instructions, memory, and connections have been reviewed.
5. Add the human owner as **Can configure** and **Can share**.
6. Start with schedules disabled. Run each Bot once manually, inspect the result, then enable its schedule.
7. Require pull requests for content changes. Do not grant direct-to-main publishing.

## Files

- `manifest.json` contains the machine-readable fleet definition.
- `prompts/` contains copy-paste outcome prompts for each Bot.

The manifest is the canonical machine-readable definition. The prompt files are the canonical operating instructions. Update both in the same PR when a Bot's role changes.
