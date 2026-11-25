# Contributing

Have something built with Devin, or a bot/integration around it? Add it.

## How to submit

Open a PR that adds your entry to the right section, in this format:

```markdown
- **[Name](https://example.com)** — One sentence: what it is and how Devin was involved.
```

Or open an issue titled `Add: <name>` with the same info and I'll list it.

## What qualifies

- **Products built with Devin** — software where Devin authored a substantial share of the code. Links can point at a repo, a demo, a post, or a session transcript.
- **Bots & integrations** — anything that puts Devin inside another product or surface.
- **Tooling around Devin** — tools that extend Devin itself.
- **Community media** — news, tutorials, directories about Devin.

## Quality bar

This is a curated list, not a directory. An entry must be **real and verifiable**:

- **Working substance** — actual code, not a scaffold, empty README, or "coming soon". If it can't be run or read today, it doesn't get listed.
- **Honest scope** — the description must say what it actually does, not what it aspires to.
- **Clean standing** — nothing that exists to circumvent Cognition's terms (e.g. repackaging free-plan access as an API product). Tools that extend Devin legitimately are welcome.
- **Sources** — claims (numbers, outcomes) must come from the project itself or a linked write-up. No vibes.

Maintained is preferred; complete-and-quiet is fine; abandoned stubs get pruned.

## Rules

- One line per entry, link first. No marketing copy.
- Mark unofficial projects clearly — nothing should imply Cognition endorsement.
- Dead links and abandoned entries get pruned periodically.
- After editing `README.md`, run `python3 tools/sync.py` — it recomputes the stats line across all six language READMEs and the site, and checks link parity. CI fails on drift.

## Maintainer automation

The lean Devin Bot fleet that maintains this registry and the sister curriculum is defined in [`ops/bot-fleet/`](ops/bot-fleet/). The fleet uses pull requests; it does not publish directly to `main`.
