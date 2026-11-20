#!/usr/bin/env python3
"""Render build-with-devin guides into static HTML pages for the Pages site.

Source of truth stays the markdown in ../build-with-devin/guides/{,zh,ja,pt}/.
Output: docs/guides/<name>.html and docs/guides/<lang>/<name>.html — same site chrome,
same i18n runtime, plus a prose stylesheet (assets/guides.css).

Per-guide chrome: language switcher, per-section anchor links, a collapsible
"on this page" TOC, an "Updated <date>" stamp (last git commit on the source),
and a localized prev/next curriculum pager. Per-language index pages are built
from each language's README guide table (number, title, pitch, level) with a
client-side filter box.

Run:  python3 tools/build_guides.py   (from the repo root)
"""
import re, sys, json, html as html_, subprocess
from pathlib import Path
import markdown

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT.parent / "build-with-devin" / "guides"
OUT = ROOT / "docs" / "guides"
SITE = "https://till3005.github.io/built-with-devin"

PAGE = """<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{etitle} — build-with-devin guides</title>
<meta name="description" content="{edesc}">
<link rel="canonical" href="{canonical}">
{hreflang}
<link rel="alternate" type="application/rss+xml" title="built-with-devin feed" href="{rel}feed.xml">
{jsonld}
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
  <p class="guide-crumb"><a href="{crumb}">← {guides_label}</a>{alt}</p>
{meta}
{toc}
{body}
{related}
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

LANG_LABEL = {"en": "English", "zh": "中文", "ja": "日本語", "pt": "Português"}
GUIDES_LABEL = {"en": "Guides", "zh": "指南", "ja": "ガイド", "pt": "Guias"}
UPDATED_LABEL = {"en": "Updated", "zh": "更新于", "ja": "更新", "pt": "Atualizado"}
TOC_LABEL = {"en": "On this page", "zh": "本页目录", "ja": "このページの目次", "pt": "Nesta página"}
PAGER_LABEL = {"en": ("← Previous", "Next →"), "zh": ("← 上一篇", "下一篇 →"),
               "ja": ("← 前へ", "次へ →"), "pt": ("← Anterior", "Próximo →")}
RELATED_LABEL = {"en": "Same stage", "zh": "同阶段", "ja": "同じステージ", "pt": "Mesmo estágio"}
FILTER_PH = {"en": "Filter guides…", "zh": "筛选指南…", "ja": "ガイドを絞り込む…", "pt": "Filtrar guias…"}
IDX_DESC = {
    "en": "{n} field-tested Devin guides — English, 中文, 日本語 and Português editions.",
    "zh": "{n} 篇实战验证的 Devin 教程——中、英、日、葡四语同步。",
    "ja": "実戦検証済み Devin ガイド {n} 本——日本語・英語・中国語・ポルトガル語の4言語版。",
    "pt": "{n} guias Devin testados em campo — edições em Português, English, 中文 e 日本語.",
}
IDX_TITLE = {"en": "build-with-devin — guides", "zh": "build-with-devin — 指南",
             "ja": "build-with-devin — ガイド", "pt": "build-with-devin — guias"}


def slugify(inner_html: str) -> str:
    s = re.sub(r'<[^>]+>', '', inner_html)
    s = html_.unescape(s).lower()
    s = re.sub(r'[^\w぀-ヿ一-鿿가-힯]+', '-', s, flags=re.UNICODE)
    return s.strip('-') or 'sec'


def anchorize(body: str):
    """Give every h2–h4 an id + hover anchor; return (body, [(depth, slug, text)])."""
    items, used = [], set()

    def repl(m):
        tag, inner = m.group(1), m.group(3)
        base = slugify(inner)
        slug, i = base, 2
        while slug in used:
            slug = f"{base}-{i}"
            i += 1
        used.add(slug)
        items.append((int(tag[1]), slug, re.sub(r'<[^>]+>', '', inner)))
        return f'<{tag} id="{slug}">{inner}<a class="hlink" href="#{slug}" aria-hidden="true">#</a></{tag}>'

    body = re.sub(r'<(h[234])([^>]*)>(.*?)</\1>', repl, body, flags=re.S)
    return body, items


def toc_html(items, lang: str) -> str:
    lis = "".join(
        f'<li class="d{d}"><a href="#{s}">{html_.escape(t)}</a></li>'
        for d, s, t in items if d <= 3)
    if not lis:
        return ""
    return f'<details class="toc" open><summary>{TOC_LABEL[lang]}</summary><ol>{lis}</ol></details>'


def last_updated(md_path: Path) -> str:
    try:
        rel = md_path.relative_to(SRC.parent)
        out = subprocess.run(
            ["git", "-C", str(SRC.parent), "log", "-1", "--format=%cs", "--", str(rel)],
            capture_output=True, text=True, timeout=10)
        return out.stdout.strip()
    except Exception:
        return ""


def hreflang_block(page_rel: str, langs: list) -> str:
    lines = []
    for l in langs:
        href = f"{SITE}/guides/{'' if l == 'en' else l + '/'}{page_rel}"
        lines.append(f'<link rel="alternate" hreflang="{l}" href="{href}">')
    lines.append(f'<link rel="alternate" hreflang="x-default" href="{SITE}/guides/{page_rel}">')
    return "\n".join(lines)


def jsonld_guide(title: str, desc: str, lang: str, upd: str, canonical: str) -> str:
    data = {"@context": "https://schema.org", "@type": "TechArticle",
            "headline": title, "description": desc, "inLanguage": lang,
            "url": canonical,
            "isPartOf": {"@type": "Course", "name": "build-with-devin",
                         "url": f"{SITE}/guides/"}}
    if upd:
        data["dateModified"] = upd
    return f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'


def jsonld_index(lang: str, canonical: str, order: list, titles: dict) -> str:
    items = [{"@type": "ListItem", "position": i + 1, "name": titles[s],
              "url": f"{SITE}/guides/{'' if lang == 'en' else lang + '/'}{s}.html"}
             for i, s in enumerate(order) if s in titles]
    data = {"@context": "https://schema.org", "@type": "ItemList",
            "name": "build-with-devin guides", "url": canonical,
            "itemListElement": items}
    return f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'


def stages_for(lang: str):
    """Parse '### <stage>' sections in a language's README → [(title, blurb, [stems])]."""
    name = "README.md" if lang == "en" else f"README.{lang}.md"
    p = SRC.parent / name
    if not p.exists():
        return []
    text = p.read_text(encoding="utf-8")
    out = []
    for m in re.finditer(r'^### (.+?)\n(.*?)(?=^#{2,3} |\Z)', text, re.M | re.S):
        title = m.group(1).strip()
        sec = m.group(2)
        stems = re.findall(r'guides/(?:[a-z]{2}/)?([a-z0-9-]+)\.md', sec)
        if not stems:
            continue
        blurb_m = re.search(r'^\*([^*]+)\*', sec, re.M)
        out.append((title, blurb_m.group(1).strip() if blurb_m else "", stems))
    return out


def related_html(stem: str, lang: str, stages: list, titles: dict) -> str:
    for stitle, _blurb, stems in stages:
        if stem in stems:
            sib = [s for s in stems if s != stem and s in titles]
            if not sib:
                return ""
            links = " · ".join(f'<a href="{s}.html">{html_.escape(titles[s])}</a>' for s in sib)
            return (f'<section class="related"><h3>{RELATED_LABEL[lang]} — '
                    f'{html_.escape(stitle)}</h3><p>{links}</p></section>')
    return ""


def render(md_path: Path, out_path: Path, rel: str, lang: str, alt: str, mdsrc: str,
           crumb: str, pager: str = "", related: str = "", mirrors: list = None):
    text = md_path.read_text(encoding="utf-8")
    # rewrite inter-guide .md links to local .html pages (zh links stay in zh/)
    def fix(m):
        target = m.group(2)
        if lang == "en" and target.startswith(("zh/", "ja/", "pt/")):
            target = target[3:]
        target = re.sub(r"\.md$", ".html", target)
        return m.group(1) + target + m.group(3)
    text = re.sub(r"(\]\()([^)]+)(\))", fix, text)
    title = re.search(r"^# (.+)$", text, re.M).group(1)
    body = markdown.markdown(text, extensions=["tables", "fenced_code", "attr_list"])
    body, items = anchorize(body)
    toc = toc_html(items, lang)
    upd = last_updated(md_path)
    meta = f'<p class="guide-meta">{UPDATED_LABEL[lang]} {upd}</p>' if upd else ""
    desc = re.sub(r"[*_`\[\]()#]", "", re.search(r"^\*\*(Goal|目标|目標|Objetivo)[:：]\*\*\s*(.+)$", text, re.M).group(2))[:160] if re.search(r"^\*\*(Goal|目标|目標|Objetivo)[:：]", text, re.M) else title
    out_path.parent.mkdir(parents=True, exist_ok=True)
    page = out_path.relative_to(OUT).as_posix()
    langs = ["en"] + (mirrors or [])
    canonical = f"{SITE}/guides/{page}"
    out_path.write_text(PAGE.format(
        lang=lang, etitle=html_.escape(title, quote=True), edesc=html_.escape(desc, quote=True),
        rel=rel, body=body, alt=alt, mdsrc=mdsrc, page=page, pager=pager,
        crumb=crumb, meta=meta, toc=toc, guides_label=GUIDES_LABEL[lang],
        canonical=canonical, hreflang=hreflang_block(page, langs),
        jsonld=jsonld_guide(title, desc, lang, upd, canonical), related=related), encoding="utf-8")
    return title


def readme_table(lang: str) -> dict:
    """Parse a language's README guide table → {stem: {num,title,pitch,level}}."""
    name = "README.md" if lang == "en" else f"README.{lang}.md"
    p = SRC.parent / name
    if not p.exists():
        return {}
    rows = {}
    for m in re.finditer(
            r'^\|\s*([^|]*?)\s*\|\s*\[([^\]]+)\]\(guides/(?:[a-z]{2}/)?([a-z0-9-]+)\.md\)\s*\|\s*([^|]*?)\s*\|[^|]*\|\s*([^|]*?)\s*\|',
            p.read_text(encoding="utf-8"), re.M):
        num, title, stem, pitch, level = (s.strip() for s in m.groups())
        rows[stem] = {"num": num, "title": title, "pitch": pitch, "level": level}
    return rows


def pager_for(stem: str, order: list, titles: dict, lang: str) -> str:
    if stem not in order:
        return ""
    i = order.index(stem)
    prev_l, next_l = PAGER_LABEL[lang]
    parts = []
    if i > 0:
        p = order[i - 1]
        parts.append(f'<a class="pg-prev" href="{p}.html"><span class="pg-dir">{prev_l}</span><span class="pg-t">{html_.escape(titles[p], quote=True)}</span></a>')
    if i < len(order) - 1:
        n = order[i + 1]
        parts.append(f'<a class="pg-next" href="{n}.html"><span class="pg-dir">{next_l}</span><span class="pg-t">{html_.escape(titles[n], quote=True)}</span></a>')
    return f'<nav class="guide-pager">{"".join(parts)}</nav>' if parts else ""


def index_body(lang: str, order: list, tables: dict, titles: dict, stages: list) -> str:
    def row(stem: str) -> str:
        t = titles[stem]
        info = tables.get(lang, {}).get(stem, {})
        num = info.get("num", "—") or "—"
        pitch = info.get("pitch", "")
        level = info.get("level", "")
        search = html_.escape(f"{num} {t} {pitch} {level}".lower(), quote=True)
        return (
            f'    <a class="row" href="{stem}.html" data-search="{search}">'
            f'<span class="row-tag">{html_.escape(num)}</span><span>'
            f'<span class="row-title">{html_.escape(t)}</span>'
            f'<span class="row-desc">{html_.escape(pitch)}</span></span>'
            f'<span class="row-num">{html_.escape(level)}</span></a>')

    ph = FILTER_PH[lang]
    parts = [f'<h1>{IDX_TITLE[lang]}</h1>',
             f'<input id="gfilter" class="gfilter" type="search" placeholder="{ph}" '
             f'oninput="document.querySelectorAll(\'.row[data-search]\').forEach(r=>r.style.display=r.dataset.search.includes(this.value.toLowerCase())?\'\':\'none\')">']
    grouped = set()
    for stitle, blurb, stems in stages:
        srows = [row(s) for s in stems if s in titles]
        if not srows:
            continue
        grouped.update(stems)
        parts.append(f'<h2 class="stage-h">{html_.escape(stitle)}</h2>')
        if blurb:
            parts.append(f'<p class="stage-blurb">{html_.escape(blurb)}</p>')
        parts.append(f'<div class="rows">{"".join(srows)}\n</div>')
    rest = [row(s) for s in order if s in titles and s not in grouped]
    if rest:
        parts.append(f'<div class="rows">{"".join(rest)}\n</div>')
    return "\n".join(parts)


def main():
    en_files = sorted(SRC.glob("*.md"))
    stems = {p.stem for p in en_files}
    readme = (SRC.parent / "README.md").read_text(encoding="utf-8")
    order = [s for s in re.findall(r'guides/(?:[a-z]{2}/)?([a-z0-9-]+)\.md', readme) if s in stems]
    order += sorted(stems - set(order))
    tables = {l: readme_table(l) for l in ("en", "zh", "ja", "pt")}
    stages = {l: stages_for(l) for l in ("en", "zh", "ja", "pt")}

    en_titles = {p.stem: re.search(r"^# (.+)$", p.read_text(encoding="utf-8"), re.M).group(1) for p in en_files}

    def lang_titles(lang: str) -> dict:
        lt = {}
        for s in stems:
            p = SRC / lang / f"{s}.md"
            if p.exists():
                lt[s] = re.search(r"^# (.+)$", p.read_text(encoding="utf-8"), re.M).group(1)
        return lt

    lang_dirs = [d.name for d in sorted(SRC.iterdir()) if d.is_dir() and d.name in ("zh", "ja", "pt")]
    for en in en_files:
        mirrors = [l for l in lang_dirs if (SRC / l / en.name).exists()]
        alts = " · ".join(f'<a href="{l}/{en.stem}.html">{LANG_LABEL[l]}</a>' for l in mirrors)
        alt_en = f" · {alts}" if alts else ""
        render(en, OUT / f"{en.stem}.html", "../", "en", alt_en, en.name, "index.html",
               pager_for(en.stem, order, en_titles, "en"),
               related_html(en.stem, "en", stages["en"], en_titles), mirrors=mirrors)
        for l in mirrors:
            lt = lang_titles(l) or en_titles
            alt_l = f' · <a href="../{en.stem}.html">English</a>' + "".join(
                f' · <a href="../{o}/{en.stem}.html">{LANG_LABEL[o]}</a>' for o in mirrors if o != l)
            render(SRC / l / en.name, OUT / l / f"{en.stem}.html", "../../", l, alt_l,
                   f"{l}/{en.name}", "index.html",
                   pager_for(en.stem, order, lt, l),
                   related_html(en.stem, l, stages[l] or stages["en"], lt), mirrors=mirrors)

    # one index per language, localized titles/pitches in curriculum order
    for l in ("en",) + tuple(lang_dirs):
        lt = lang_titles(l) or en_titles if l != "en" else en_titles
        body = index_body(l, order, tables, lt, stages[l] or stages["en"])
        rel = "../" if l == "en" else "../../"
        langs = ["en"] + lang_dirs
        alt = " · ".join(
            f'<a href="{"" if l == "en" else "../"}{"" if o == "en" else o + "/"}index.html">{LANG_LABEL[o]}</a>'
            for o in langs if o != l)
        alt = f" · {alt}" if alt else ""
        canonical = f"{SITE}/guides/{'' if l == 'en' else l + '/'}"
        out = OUT / "index.html" if l == "en" else OUT / l / "index.html"
        out.write_text(PAGE.format(
            lang=l, etitle=GUIDES_LABEL[l], edesc=IDX_DESC[l].format(n=len(order)),
            rel=rel, body=body, alt=alt, mdsrc="../", page=("index.html" if l == "en" else f"{l}/index.html"),
            pager="", crumb=f"{rel}index.html", related="",
            canonical=canonical, hreflang=hreflang_block("index.html", langs),
            jsonld=jsonld_index(l, canonical, order, lt),
            meta="", toc="", guides_label="built-with-devin"), encoding="utf-8")

    print(f"rendered {len(en_files)} guides × {1 + len(lang_dirs)} languages + {1 + len(lang_dirs)} indexes → docs/guides/")


if __name__ == "__main__":
    main()
