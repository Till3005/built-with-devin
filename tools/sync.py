#!/usr/bin/env python3
"""Single-source-of-truth sync for built-with-devin.

README.md (English) is the source of truth. This script:
  1. Counts real entries per section in README.md.
  2. Rewrites the stats line in every README.<lang>.md and docs/index.html.
  3. Checks every external URL in README.md also appears in each translated
     README (link parity). Exits 1 on any drift; --write to fix stats in place.

Usage: python3 tools/sync.py [--write]
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
LANGS = ['zh', 'de', 'es', 'ja', 'pt']

def section(lines, start_pat, end_pat=r'^#{2,3} '):
    i = next(i for i, l in enumerate(lines) if re.match(start_pat, l))
    j = next((i + 1 + k for k, l in enumerate(lines[i + 1:]) if re.match(end_pat, l)), len(lines))
    return lines[i:j]

def table_rows(lines):
    return [l for l in lines if l.startswith('| ') and not l.startswith('| ---')
            and not re.match(r'\|\s*\w+\s*\|\s*\w+', l.split('---')[0] or '') and 'Owner' not in l and 'Company' not in l and 'Template' not in l]

def bullets(lines):
    return [l for l in lines if l.startswith('- ')]

def counts(md):
    lines = md.splitlines()
    dep = table_rows(section(lines, r'^### Documented deployments'))
    prod = bullets(section(lines, r'^## Products built'))
    side = next((i for i, l in enumerate(prod) if 'Side quest' in l or 'side quest' in l), None)
    if side is not None:
        prod = prod[:side]
    ent = table_rows(section(lines, r'^## Enterprise deployments'))
    tools = len(bullets(section(lines, r'^## Bots & surfaces'))) \
          + len(bullets(section(lines, r'^## SDKs'))) \
          + len(bullets(section(lines, r'^## Tooling around Devin')))
    reports = len(bullets(section(lines, r'^## Patterns & write-ups')))
    return {'bots': len(dep), 'enterprise': len(ent), 'products': len(prod),
            'tools': tools, 'reports': reports}

def stats_line(c):
    return (f"**{c['bots']}** documented Bot deployments · **{c['enterprise']}** enterprise case studies · "
            f"**{c['products']}** shipped products · **{c['tools']}** tools & integrations · **{c['reports']}** field reports")

# Localized stats-line templates and the anchor that identifies the stats <sub> line.
STATS = {
    'zh': ('Bot 部署',
           "**{b}** 个有据可查的 Bot 部署 · **{e}** 个企业案例 · **{p}** 个已发布产品 · **{t}** 个工具与集成 · **{r}** 篇实战报告"),
    'ja': ('Bot 導入',
           "**{b}** 件の実証済み Bot 導入 · **{e}** 件のエンタープライズ事例 · **{p}** 件の公開プロダクト · **{t}** 件のツール・統合 · **{r}** 件の実践レポート"),
    'pt': ('implantações de Bot',
           "**{b}** implantações de Bot documentadas · **{e}** casos corporativos · **{p}** produtos lançados · **{t}** ferramentas e integrações · **{r}** relatos de campo"),
    'es': ('despliegues de Bot',
           "**{b}** despliegues de Bot documentados · **{e}** casos empresariales · **{p}** productos lanzados · **{t}** herramientas e integraciones · **{r}** informes de campo"),
    'de': ('Bot-Deployments',
           "**{b}** dokumentierte Bot-Deployments · **{e}** Enterprise-Fallstudien · **{p}** veröffentlichte Produkte · **{t}** Tools & Integrationen · **{r}** Praxisberichte"),
}

def rewrite_stats(t, anchor, new_line):
    """Replace the <sub>...</sub> line containing anchor with the new stats line."""
    pat = re.compile(r'<sub>[^\n]*' + re.escape(anchor) + r'[^\n]*</sub>')
    m = pat.search(t)
    if not m:
        return t, False
    return pat.sub('<sub>' + new_line + '</sub>', t, count=1), m.group(0) != '<sub>' + new_line + '</sub>'

def urls(md):
    return set(re.findall(r'https?://[^)\s>]+', md))

def main():
    en = (ROOT / 'README.md').read_text()
    c = counts(en)
    expected = stats_line(c)
    print(f"true counts: {c}")

    drift = []
    stat_re = re.compile(r'\*\*\d+\*\* documented Bot deployments · \*\*\d+\*\* enterprise case studies · \*\*\d+\*\* shipped products · \*\*\d+\*\* tools & integrations · \*\*\d+\*\* field reports')

    for f in ['README.md'] + [f'README.{l}.md' for l in LANGS]:
        p = ROOT / f
        if not p.exists():
            drift.append(f'{f}: missing file'); continue
        t = p.read_text()
        if f == 'README.md':
            if expected not in t:
                if '--write' in sys.argv:
                    t = stat_re.sub(expected, t); p.write_text(t)
                else:
                    drift.append(f'{f}: stats line stale')
        else:
            lang = f.split('.')[1]
            anchor, tmpl = STATS[lang]
            want = tmpl.format(b=c['bots'], e=c['enterprise'], p=c['products'],
                               t=c['tools'], r=c['reports'])
            t2, changed = rewrite_stats(t, anchor, want)
            if changed:
                if '--write' in sys.argv:
                    p.write_text(t2)
                else:
                    drift.append(f'{f}: stats line stale')

    # index.html stat numbers
    idx = (ROOT / 'docs/index.html').read_text()
    for key, label in [('bots', 'Bot deployments'), ('enterprise', 'Enterprise cases'),
                       ('products', 'Shipped products'), ('tools', 'Tools & integrations'),
                       ('reports', 'Field reports')]:
        pat = re.compile(r'(<div class="stat"><b>)(\d+)(</b><span>' + re.escape(label) + r'</span>)')
        m = pat.search(idx)
        if m and int(m.group(2)) != c[key]:
            if '--write' in sys.argv:
                idx = pat.sub(r'\g<1>' + str(c[key]) + r'\g<3>', idx)
            else:
                drift.append(f'index.html: {label} = {m.group(2)}, want {c[key]}')
    (ROOT / 'docs/index.html').write_text(idx) if '--write' in sys.argv else None

    # link parity: every en URL must exist in each lang README
    en_urls = urls(en) - {'https://till3005.github.io/built-with-devin/'}
    for lang in LANGS:
        t = (ROOT / f'README.{lang}.md').read_text()
        missing = [u for u in en_urls if u not in t]
        for u in missing[:20]:
            drift.append(f'README.{lang}.md: missing link {u}')

    # i18n key parity: every language dict in i18n.js must hold the same keys
    i18n = (ROOT / 'docs/assets/i18n.js').read_text()
    keysets = {}
    for m in re.finditer(r"^(\w+): \{\n(.*?)\n\}", i18n, re.S | re.M):
        keysets[m.group(1)] = set(re.findall(r"'([\w.]+)'\s*:", m.group(2)))
    base_lang = next(iter(keysets), None)
    for lang, ks in keysets.items():
        if lang == base_lang:
            continue
        missing = keysets[base_lang] - ks
        extra = ks - keysets[base_lang]
        for k in sorted(missing | extra):
            drift.append(f'i18n.js: {lang} key mismatch: {k}')

    if drift:
        print('\n'.join('DRIFT: ' + d for d in drift))
        sys.exit(1)
    print('in sync')

if __name__ == '__main__':
    main()
