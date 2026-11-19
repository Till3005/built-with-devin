#!/usr/bin/env python3
"""Export the registry from README.md into docs/registry.json.

Parses the canonical tables/lists (documented deployments, enterprise,
products) plus the template library, then writes a machine-readable
dataset. Run after README edits: python3 tools/export_registry.py
"""
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
README = ROOT / "README.md"
DOCS = ROOT / "docs"
OUT = DOCS / "registry.json"
SITEMAP = DOCS / "sitemap.xml"
FEED = DOCS / "feed.xml"
SITE = "https://till3005.github.io/built-with-devin"

LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
BOLD = re.compile(r"\*\*([^*]+)\*\*")


def blame_dates():
    """Map README.md line number -> commit date (YYYY-MM-DD)."""
    try:
        out = subprocess.run(
            ["git", "blame", "--line-porcelain", "--", "README.md"],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout
    except Exception:
        return {}
    dates, current_line = {}, None
    for line in out.splitlines():
        if line.startswith("author-time "):
            ts = int(line.split()[1])
            dates[current_line] = datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m-%d")
        elif re.match(r"^[0-9a-f]{40} \d+ \d+", line):
            current_line = int(line.split()[2])
    return dates


def last_commit_date(rel_path):
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", rel_path],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout.strip()
        return out or None
    except Exception:
        return None


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


def line_updated(dates, lines, needle, prefix):
    """Blame date of the first README line matching prefix + needle."""
    for i, line in enumerate(lines, start=1):
        if line.startswith(prefix) and needle in line:
            return dates.get(i)
    return None


def write_sitemap():
    urls = [("", "docs/index.html"), ("/economics.html", "docs/economics.html"),
            ("/guides/", "docs/guides/index.html")]
    for slug in sorted(p.stem for p in (DOCS / "guides").glob("*.html") if p.stem != "index"):
        urls.append((f"/guides/{slug}.html", f"docs/guides/{slug}.html"))
        for lang in ("zh", "ja", "pt"):
            urls.append((f"/guides/{lang}/{slug}.html", f"docs/guides/{lang}/{slug}.html"))
    items = []
    for path, file in urls:
        lastmod = last_commit_date(file) or "2026-11-19"
        items.append(f"  <url>\n    <loc>{SITE}{path}</loc>\n    <lastmod>{lastmod}</lastmod>\n  </url>")
    SITEMAP.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(items) + "\n</urlset>\n")
    print(f"wrote {SITEMAP} — {len(urls)} urls")


def write_feed(entries):
    """RSS 2.0 feed of the 25 most recently indexed entries."""
    now = format_datetime(datetime.now(timezone.utc))
    anchors = {"bot": "#deployments", "product": "#products",
               "enterprise": "#enterprise", "template": "#deep"}
    items = []
    for e in entries[:25]:
        dt = e.get("updated_on")
        pub = format_datetime(datetime.strptime(dt, "%Y-%m-%d").replace(tzinfo=timezone.utc)) if dt else now
        items.append(
            "  <item>\n"
            f"    <title>{escape('Indexed: ' + e['name'])}</title>\n"
            f"    <link>{SITE}/{anchors[e['kind']]}</link>\n"
            f"    <guid isPermaLink=\"false\">{escape(e['kind'] + ':' + e['name'])}</guid>\n"
            f"    <pubDate>{pub}</pubDate>\n"
            f"    <description>{escape(e.get('blurb', ''))}</description>\n"
            "  </item>")
    FEED.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0">\n<channel>\n'
        "  <title>Built with Devin — registry updates</title>\n"
        f"  <link>{SITE}/</link>\n"
        "  <description>New entries indexed in the built-with-devin registry.</description>\n"
        f"  <lastBuildDate>{now}</lastBuildDate>\n"
        + "\n".join(items) + "\n</channel>\n</rss>\n")
    print(f"wrote {FEED} — {min(len(entries), 25)} items")


def main():
    text = README.read_text()
    lines = text.splitlines()
    dates = blame_dates()

    # Documented Bot deployments
    dep = rows(section_between(text, "### Documented deployments", "### "))
    deployments = [{
        "name": strip_md(r[0]),
        "owner": strip_md(r[1]),
        "owns": strip_md(r[2]),
        "results": strip_md(r[3]),
        "sources": cell_links(r[3]) + cell_links(r[0]),
        "updated_on": line_updated(dates, lines, strip_md(r[0]), "|"),
    } for r in dep]

    # Official template library
    tpl = rows(section_between(text, "### Official template library", "## "))
    templates = [{"name": strip_md(r[0]), "does": strip_md(r[1]),
                  "updated_on": line_updated(dates, lines, strip_md(r[0]), "|")} for r in tpl]

    # Products built with Devin (bulleted list)
    prod_sec = section_between(text, "## Products built with Devin", "### Side quests")
    products = []
    for m in re.finditer(r"^- \*\*(.+?)\*\* — (.+?)$", prod_sec, re.M):
        products.append({
            "name": strip_md(m.group(1)),
            "description": strip_md(m.group(2)),
            "sources": cell_links(m.group(0)),
            "updated_on": line_updated(dates, lines, strip_md(m.group(1)), "-"),
        })

    # Enterprise deployments
    ent = rows(section_between(text, "## Enterprise deployments", "## "))
    enterprise = [{
        "company": strip_md(r[0]),
        "deployment": strip_md(r[1]),
        "result": strip_md(r[2]),
        "sources": cell_links(r[0]) + cell_links(r[2]),
        "updated_on": line_updated(dates, lines, strip_md(r[0]), "|"),
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
    # Preserve liveness data written by tools/verify_sources.py
    if OUT.exists():
        try:
            prior = json.loads(OUT.read_text())
            for k in ("source_checks", "source_checks_summary"):
                if k in prior:
                    data[k] = prior[k]
        except Exception:
            pass
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {OUT} — {data['counts']}")

    feed_entries = sorted(
        [{"kind": "bot", "name": d["name"], "updated_on": d["updated_on"],
          "blurb": f'{d["owner"]} — {d["owns"]}'} for d in deployments]
        + [{"kind": "product", "name": p["name"], "updated_on": p["updated_on"],
            "blurb": p["description"]} for p in products]
        + [{"kind": "enterprise", "name": e["company"], "updated_on": e["updated_on"],
            "blurb": e["deployment"]} for e in enterprise]
        + [{"kind": "template", "name": t["name"], "updated_on": t["updated_on"],
            "blurb": t["does"]} for t in templates],
        key=lambda e: e.get("updated_on") or "", reverse=True)
    write_feed(feed_entries)
    write_sitemap()


if __name__ == "__main__":
    sys.exit(main())
