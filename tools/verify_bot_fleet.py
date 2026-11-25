#!/usr/bin/env python3
"""Validate the lean Bot fleet manifest and prompt files."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FLEET = ROOT / "ops" / "bot-fleet"
MANIFEST = FLEET / "manifest.json"
REQUIRED_BOT_FIELDS = {
    "id",
    "name",
    "prompt",
    "owns",
    "repos",
    "cadence",
    "write_scope",
    "may_not_do",
}
VALID_REPOS = {"Till3005/built-with-devin", "Till3005/build-with-devin"}


def main():
    errors = []
    try:
        data = json.loads(MANIFEST.read_text())
    except Exception as exc:
        print(f"ERROR: invalid manifest JSON: {exc}")
        return 1

    bots = data.get("bots")
    if not isinstance(bots, list) or not bots:
        errors.append("manifest must contain a non-empty bots list")
        bots = []

    ids = []
    for bot in bots:
        label = bot.get("id", "<missing id>")
        ids.append(label)
        missing = REQUIRED_BOT_FIELDS - set(bot)
        if missing:
            errors.append(f"{label}: missing fields {sorted(missing)}")
        prompt = bot.get("prompt")
        if prompt and not (FLEET / prompt).exists():
            errors.append(f"{label}: missing prompt file {prompt}")
        for repo in bot.get("repos", []):
            if repo not in VALID_REPOS:
                errors.append(f"{label}: unknown repo {repo}")
        if not bot.get("may_not_do"):
            errors.append(f"{label}: may_not_do must not be empty")

    if len(ids) != len(set(ids)):
        errors.append("duplicate bot ids")

    budget = data.get("budget", {})
    if budget.get("max_concurrent_child_sessions") != 2:
        errors.append("budget.max_concurrent_child_sessions must remain 2 unless the owner approves a change")

    for error in errors:
        print("ERROR: " + error)
    if errors:
        return 1
    print(f"bot fleet manifest passed: {len(bots)} bots")
    return 0


if __name__ == "__main__":
    sys.exit(main())
