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
                drift.append(f'{f}: stats line stale')
                if '--write' in sys.argv:
                    t = stat_re.sub(expected, t); p.write_text(t)
        else:
            m = stat_re.search(t)
            if m and m.group(0) != expected:
                drift.append(f'{f}: stats line stale')
                if '--write' in sys.argv:
                    t = stat_re.sub(expected, t); p.write_text(t)

    # index.html stat numbers
    idx = (ROOT / 'docs/index.html').read_text()
    for key, label in [('bots', 'Bot deployments'), ('enterprise', 'Enterprise cases'),
                       ('products', 'Shipped products'), ('tools', 'Tools & integrations'),
                       ('reports', 'Field reports')]:
        pat = re.compile(r'(<div class="stat"><b>)(\d+)(</b><span>' + re.escape(label) + r'</span>)')
        m = pat.search(idx)
        if m and int(m.group(2)) != c[key]:
            drift.append(f'index.html: {label} = {m.group(2)}, want {c[key]}')
            if '--write' in sys.argv:
                idx = pat.sub(r'\g<1>' + str(c[key]) + r'\g<3>', idx)
    (ROOT / 'docs/index.html').write_text(idx) if '--write' in sys.argv else None

    # link parity: every en URL must exist in each lang README
    en_urls = urls(en) - {'https://till3005.github.io/built-with-devin/'}
    for lang in LANGS:
        t = (ROOT / f'README.{lang}.md').read_text()
        missing = [u for u in en_urls if u not in t]
        for u in missing[:20]:
            drift.append(f'README.{lang}.md: missing link {u}')

    # guides: cover tagline should match build-with-devin guide count (checked there)
    if drift:
        print('\n'.join('DRIFT: ' + d for d in drift))
        sys.exit(1)
    print('in sync')

if __name__ == '__main__':
    main()
