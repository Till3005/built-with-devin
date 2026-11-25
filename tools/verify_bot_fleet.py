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
REGISTRY_REPO = "Till3005/built-with-devin"
CURRICULUM_REPO = "Till3005/build-with-devin"
VALID_REPOS = {REGISTRY_REPO, CURRICULUM_REPO}
EXPECTED_BOTS = {
    "bwd-editor": {REGISTRY_REPO, CURRICULUM_REPO},
    "bwd-scout": {REGISTRY_REPO},
    "bwd-registry": {REGISTRY_REPO},
    "bwd-curriculum": {REGISTRY_REPO, CURRICULUM_REPO},
}


def validate(data):
    errors = []
    bots = data.get("bots")
    if not isinstance(bots, list) or not bots:
        return ["manifest must contain a non-empty bots list"]

    ids = [bot.get("id") for bot in bots if isinstance(bot, dict)]
    if len(ids) != len(set(ids)):
        errors.append("duplicate bot ids")
    if set(ids) != set(EXPECTED_BOTS):
        missing = sorted(set(EXPECTED_BOTS) - set(ids))
        extra = sorted(set(ids) - set(EXPECTED_BOTS))
        if missing:
            errors.append(f"missing fleet roles: {', '.join(missing)}")
        if extra:
            errors.append(f"unknown fleet roles: {', '.join(extra)}")

    prompts = []
    for bot in bots:
        if not isinstance(bot, dict):
            errors.append("each bot must be an object")
            continue
        label = bot.get("id", "<missing id>")
        missing = REQUIRED_BOT_FIELDS - set(bot)
        if missing:
            errors.append(f"{label}: missing fields {sorted(missing)}")

        prompt = bot.get("prompt")
        if not isinstance(prompt, str) or not prompt:
            errors.append(f"{label}: prompt must be a non-empty string")
        elif not (FLEET / prompt).exists():
            errors.append(f"{label}: missing prompt file {prompt}")
        else:
            prompts.append((label, prompt))

        repos = bot.get("repos", [])
        if not isinstance(repos, list):
            errors.append(f"{label}: repos must be a list")
            repos = []
        for repo in repos:
            if repo not in VALID_REPOS:
                errors.append(f"{label}: unknown repo {repo}")
        required_repos = EXPECTED_BOTS.get(label, set())
        missing_repos = sorted(required_repos - set(repos))
        if missing_repos:
            errors.append(f"{label}: missing required repos {missing_repos}")

        if not bot.get("may_not_do"):
            errors.append(f"{label}: may_not_do must not be empty")

    seen_prompts = {}
    for label, prompt in prompts:
        if prompt in seen_prompts:
            errors.append(f"{label}: prompt {prompt} is also used by {seen_prompts[prompt]}")
        seen_prompts.setdefault(prompt, label)

    budget = data.get("budget", {})
    if budget.get("max_concurrent_child_sessions") != 2:
        errors.append("budget.max_concurrent_child_sessions must remain 2 unless the owner approves a change")
    scout_budget = budget.get("scout_runs_per_week")
    if not isinstance(scout_budget, int) or scout_budget < 1:
        errors.append("budget.scout_runs_per_week must be a positive integer")
    scout = next((bot for bot in bots if isinstance(bot, dict) and bot.get("id") == "bwd-scout"), None)
    if scout:
        scheduled = scout.get("cadence", {}).get("scheduled_runs_per_week")
        if not isinstance(scheduled, int) or scheduled < 1:
            errors.append("bwd-scout: scheduled_runs_per_week must be a positive integer")
        elif isinstance(scout_budget, int) and scheduled > scout_budget:
            errors.append(
                f"bwd-scout: scheduled_runs_per_week {scheduled} exceeds budget {scout_budget}"
            )

    return errors


def main():
    try:
        data = json.loads(MANIFEST.read_text())
    except Exception as exc:
        print(f"ERROR: invalid manifest JSON: {exc}")
        return 1

    errors = validate(data)
    for error in errors:
        print("ERROR: " + error)
    if errors:
        return 1
    print(f"bot fleet manifest passed: {len(data.get('bots', []))} bots")
    return 0


if __name__ == "__main__":
    sys.exit(main())
