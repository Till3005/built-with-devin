import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import build_guides


class GuideLinkTests(unittest.TestCase):
    def test_render_rewrites_only_relative_links_to_existing_guides(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = root / "guides"
            localized = src / "ja"
            localized.mkdir(parents=True)
            out = root / "docs" / "guides"
            (localized / "other.md").touch()
            (root / "README.md").touch()
            source = localized / "example.md"
            source.write_text(
                "# Example\n\n"
                "[local](other.md?mode=test#verify)\n\n"
                "[docs](https://docs.devin.ai/cli/essential-commands.md)\n\n"
                "[external](//example.com/guide.md)\n\n"
                "[readme](../../README.md)\n",
                encoding="utf-8",
            )
            page = out / "ja" / "example.html"
            with patch.multiple(build_guides, SRC=src, OUT=out, last_updated=lambda _: ""):
                build_guides.render(source, page, "../../", "ja", "", "ja/example.md", "index.html")
            html = page.read_text(encoding="utf-8")
            for target in (
                "other.html?mode=test#verify",
                "https://docs.devin.ai/cli/essential-commands.md",
                "//example.com/guide.md",
                "../../README.md",
            ):
                with self.subTest(target=target):
                    self.assertIn(f'href="{target}"', html)


if __name__ == "__main__":
    unittest.main()
