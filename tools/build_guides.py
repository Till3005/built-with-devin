#!/usr/bin/env python3
"""Render build-with-devin guides into static HTML pages for the Pages site.

Source of truth stays the markdown in ../build-with-devin/guides/{,zh}/.
Output: docs/guides/<name>.html and docs/guides/zh/<name>.html — same site chrome,
same i18n runtime, plus a prose stylesheet (assets/guides.css).

Run:  python3 tools/build_guides.py   (from the repo root)
"""
import re, sys, html as html_
from pathlib import Path
import markdown

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT.parent / "build-with-devin" / "guides"
OUT = ROOT / "docs" / "guides"

PAGE = """<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{etitle} — build-with-devin guides</title>
<meta name="description" content="{edesc}">
<link rel="icon" href="{rel}assets/brand/Devin_Symbol.svg" type="image/svg+xml">
<link rel="stylesheet" href="{rel}assets/site.css">
<link rel="stylesheet" href="{rel}assets/guides.css">

<meta property="og:title" content="{etitle}">
<meta property="og:description" content="{edesc}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://till3005.github.io/built-with-devin/guides/{page}">
<meta property="og:image" content="https://till3005.github.io/built-with-devin/assets/img/og-build.png?v=3">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://till3005.github.io/built-with-devin/assets/img/og-build.png?v=3">
</head>
<body>
<a class="skip" href="#guide">Skip to content</a>
<nav><div class="wrap nav-inner">
  <div class="nav-left">
    <a class="brand" href="{rel}index.html" aria-label="Built with Devin">
      <span class="brand-text">built<strong>-with-</strong></span><img class="brand-mark" src="{rel}assets/brand/Devin_Primary_Logo.svg" alt="Devin" height="16"><span class="unofficial-chip">unofficial</span>
    </a>
  </div>
  <div class="nav-side">
    <div class="mode-toggle" role="tablist" aria-label="Site section">
      <button class="mode-btn" data-mode="built" role="tab" aria-selected="false" onclick="location.href='{rel}index.html'">Built</button>
      <button class="mode-btn on" data-mode="build" role="tab" aria-selected="true" onclick="location.href='{rel}index.html#build'">Build</button>
      <span class="mode-pill" aria-hidden="true"></span>
    </div>
    <a class="cta" href="https://github.com/Till3005/build-with-devin/blob/main/guides/{mdsrc}">GitHub</a>
  </div>
</div></nav>
<main>
<article class="guide wrap" id="guide">
  <p class="guide-crumb"><a href="{rel}index.html#build">← Guides</a>{alt}</p>
{body}
{pager}
</article>
<footer><div class="wrap foot-base"><span data-i18n="foot.note">Unofficial community project — not affiliated with Cognition AI.</span><span><a href="{rel}index.html">built-with-devin</a> · <a href="https://github.com/Till3005/build-with-devin">build-with-devin</a></span></div></footer>
</main>
<script src="{rel}assets/theme.js"></script>
<script src="{rel}assets/i18n.js"></script>
<script src="{rel}assets/i18n-runtime.js"></script>
</body>
</html>
"""

def render(md_path: Path, out_path: Path, rel: str, lang: str, alt: str, mdsrc: str, pager: str = ""):
    text = md_path.read_text(encoding="utf-8")
    # rewrite inter-guide .md links to local .html pages (zh links stay in zh/)
    def fix(m):
        target = m.group(2)
        if lang == "zh" and not target.startswith("zh/"):
            target = target  # stay inside zh/
        elif lang == "en" and target.startswith("zh/"):
            target = target[3:]
        target = re.sub(r"\.md$", ".html", target)
        return m.group(1) + target + m.group(3)
    text = re.sub(r"(\]\()([^)]+)(\))", fix, text)
    title = re.search(r"^# (.+)$", text, re.M).group(1)
    body = markdown.markdown(text, extensions=["tables", "fenced_code", "attr_list"])
    desc = re.sub(r"[*_`\[\]()#]", "", re.search(r"^\*\*Goal:\*\*\s*(.+)$", text, re.M).group(1))[:160] if re.search(r"^\*\*Goal:", text, re.M) else title
    out_path.parent.mkdir(parents=True, exist_ok=True)
    page = out_path.relative_to(OUT).as_posix()
    out_path.write_text(PAGE.format(lang=lang, etitle=html_.escape(title, quote=True), edesc=html_.escape(desc, quote=True), rel=rel, body=body, alt=alt, mdsrc=mdsrc, page=page, pager=pager), encoding="utf-8")
    return title

LANG_LABEL = {"zh": "中文", "ja": "日本語", "pt": "Português"}

def pager_for(stem: str, order: list, titles: dict) -> str:
    """Prev/next nav following the README table order (the curriculum order)."""
    if stem not in order:
        return ""
    i = order.index(stem)
    parts = []
    if i > 0:
        p = order[i - 1]
        parts.append(f'<a class="pg-prev" href="{p}.html"><span class="pg-dir">← Previous</span><span class="pg-t">{html_.escape(titles[p], quote=True)}</span></a>')
    if i < len(order) - 1:
        n = order[i + 1]
        parts.append(f'<a class="pg-next" href="{n}.html"><span class="pg-dir">Next →</span><span class="pg-t">{html_.escape(titles[n], quote=True)}</span></a>')
    return f'<nav class="guide-pager">{"".join(parts)}</nav>' if parts else ""


def main():
    en_files = sorted(p for p in SRC.glob("*.md"))
    stems = {p.stem for p in en_files}
    # curriculum order = order of guide links in the English README; unlisted files sort last
    readme = (SRC.parent / "README.md").read_text(encoding="utf-8")
    order = [s for s in re.findall(r'guides/(?:[a-z]{2}/)?([a-z0-9-]+)\.md', readme) if s in stems]
    order += sorted(stems - set(order))
    titles = {}
    for en in en_files:
        titles[en.stem] = re.search(r"^# (.+)$", en.read_text(encoding="utf-8"), re.M).group(1)
    def lang_titles(lang: str) -> dict:
        lt = {}
        for s in stems:
            p = SRC / lang / f"{s}.md"
            if p.exists():
                lt[s] = re.search(r"^# (.+)$", p.read_text(encoding="utf-8"), re.M).group(1)
        return lt
    index_rows = []
    for en in en_files:
        mirrors = [(d.name, d / en.name) for d in sorted(SRC.iterdir(), key=lambda d: list(LANG_LABEL).index(d.name) if d.name in LANG_LABEL else 99) if d.is_dir() and (d / en.name).exists()]
        alts = " · ".join(f'<a href="{lang}/{en.stem}.html">{LANG_LABEL.get(lang, lang)}</a>' for lang, _ in mirrors)
        alt_en = f" · {alts}" if alts else ""
        t = render(en, OUT / f"{en.stem}.html", "../", "en", alt_en, en.name, pager_for(en.stem, order, titles))
        for lang, m in mirrors:
            alt_lang = f' · <a href="../{en.stem}.html">English</a>' + "".join(
                f' · <a href="../{other}/{en.stem}.html">{LANG_LABEL.get(other, other)}</a>'
                for other, _ in mirrors if other != lang)
            render(m, OUT / lang / f"{en.stem}.html", "../../", lang, alt_lang, f"{lang}/{en.name}", pager_for(en.stem, order, lang_titles(lang) or titles))
        index_rows.append((en.stem, t, " · ".join(["EN"] + [LANG_LABEL.get(l, l) for l, _ in mirrors])))
    # index page listing all guides
    lis = "\n".join(
        f'    <a class="row" href="{s}.html"><span class="row-tag">{i+1:02d}</span><span class="row-title">{t}</span><span class="row-num">{langs}</span></a>'
        for i, (s, t, langs) in enumerate(index_rows))
    body = f'<h1>build-with-devin — guides</h1>\n<div class="rows">{lis}\n</div>'
    title = "Guides"
    (OUT / "index.html").write_text(PAGE.format(
        lang="en", etitle="Guides", edesc=f"{len(index_rows)} field-tested Devin guides — English, 中文, 日本語 and Português editions.",
        rel="../", body=body, alt="", mdsrc="../", page="index.html", pager=""), encoding="utf-8")
    print(f"rendered {len(en_files)} guides + mirrors → docs/guides/")

if __name__ == "__main__":
    main()
