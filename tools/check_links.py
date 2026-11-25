#!/usr/bin/env python3
"""Check generated guide HTML links against the local Pages tree."""
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

DOCS = Path(__file__).resolve().parent.parent / "docs"
SITE = "https://till3005.github.io/built-with-devin/"
PLACEHOLDER = re.compile(r"\{[A-Za-z_]\w*\}")


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.targets = []

    def handle_starttag(self, tag, attrs):
        if tag == "link" and dict(attrs).get("rel") in {"alternate", "canonical"}:
            return
        self.targets.extend(
            (self.getpos()[0], value) for name, value in attrs
            if name in {"href", "src", "poster"} and value
        )


def errors(page):
    parser = Links()
    parser.feed(page.read_text(encoding="utf-8"))
    for line, target in parser.targets:
        if PLACEHOLDER.search(unquote(target)):
            yield line, f"unresolved placeholder: {target}"
            continue
        if target.startswith("#"):
            continue
        absolute = urljoin(SITE + page.relative_to(DOCS).as_posix(), target)
        parts = urlsplit(absolute)
        if parts.hostname == "docs.devin.ai" and parts.path.endswith(".html"):
            yield line, f"unexpected .html suffix on official docs URL: {target}"
        if absolute.startswith(SITE):
            local = DOCS / unquote(parts.path.removeprefix("/built-with-devin/"))
            if local.is_dir():
                local /= "index.html"
            if not local.is_file():
                yield line, f"missing Pages target: {target}"


def main():
    pages = sorted((DOCS / "guides").rglob("*.html"))
    failures = 0
    for page in pages:
        for line, error in errors(page):
            failures += 1
            print(f"{page.relative_to(DOCS)}:{line}: {error}")
    print(f"Checked {len(pages)} guide HTML pages: {failures} link errors")
    return int(bool(failures))


if __name__ == "__main__":
    raise SystemExit(main())
