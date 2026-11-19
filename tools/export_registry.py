#!/usr/bin/env python3
"""Export the registry from README.md into docs/registry.json.

Parses the canonical tables/lists (documented deployments, enterprise,
products) plus the template library, then writes a machine-readable
dataset. Run after README edits: python3 tools/export_registry.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
README = ROOT / "README.md"
OUT = ROOT / "docs" / "registry.json"

LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
BOLD = re.compile(r"\*\*([^*]+)\*\*")


def cell_links(text):
    return [{"text": t, "url": u} for t, u in LINK.findall(text)]


def strip_md(text):
    text = LINK.sub(r"\1", text)
    text = BOLD.sub(r"\1", text)
    return re.sub(r"[*_`]", "", text).strip()


def rows(section):
    """Parse a markdown table into lists of cells."""
    lines = [l for l in section.splitlines() if l.startswith("|")]
    if len(lines) < 3:
        return []
    return [[c.strip() for c in l.strip("|").split("|")] for l in lines[2:]]


def section_between(text, start, end=None):
    i = text.index(start) + len(start)
    j = text.index(end, i) if end else len(text)
    return text[i:j]


def main():
    text = README.read_text()

    # Documented Bot deployments
    dep = rows(section_between(text, "### Documented deployments", "### "))
    deployments = [{
        "name": strip_md(r[0]),
        "owner": strip_md(r[1]),
        "owns": strip_md(r[2]),
        "results": strip_md(r[3]),
        "sources": cell_links(r[3]) + cell_links(r[0]),
    } for r in dep]

    # Official template library
    tpl = rows(section_between(text, "### Official template library", "## "))
    templates = [{"name": strip_md(r[0]), "does": strip_md(r[1])} for r in tpl]

    # Products built with Devin (bulleted list)
    prod_sec = section_between(text, "## Products built with Devin", "### Side quests")
    products = []
    for m in re.finditer(r"^- \*\*(.+?)\*\* — (.+?)$", prod_sec, re.M):
        products.append({
            "name": strip_md(m.group(1)),
            "description": strip_md(m.group(2)),
            "sources": cell_links(m.group(0)),
        })

    # Enterprise deployments
    ent = rows(section_between(text, "## Enterprise deployments", "## "))
    enterprise = [{
        "company": strip_md(r[0]),
        "deployment": strip_md(r[1]),
        "result": strip_md(r[2]),
        "sources": cell_links(r[0]) + cell_links(r[2]),
    } for r in ent]

    data = {
        "$schema": "https://till3005.github.io/built-with-devin/registry.schema.json",
        "generated_from": "https://github.com/Till3005/built-with-devin/blob/main/README.md",
        "license": "CC0-1.0",
        "counts": {
            "bot_deployments": len(deployments),
            "bot_templates": len(templates),
            "products": len(products),
            "enterprise_cases": len(enterprise),
        },
        "bot_deployments": deployments,
        "bot_templates": templates,
        "products": products,
        "enterprise_cases": enterprise,
    }
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {OUT} — {data['counts']}")


if __name__ == "__main__":
    sys.exit(main())
