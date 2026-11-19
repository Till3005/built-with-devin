#!/usr/bin/env python3
"""Re-check every source URL in docs/registry.json and record liveness.

Writes a "source_checks" map into the dataset:
  {url: {"ok": bool, "status": int, "checked_at": ISO-8601}}
Run occasionally (not in sync.py — it's network-bound):
  python3 tools/verify_sources.py
"""
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "registry.json"


def check(url):
    req = urllib.request.Request(url, method="HEAD",
                                 headers={"User-Agent": "built-with-devin-linkcheck/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status < 400, r.status
    except urllib.error.HTTPError as e:
        return e.code < 400, e.code
    except Exception:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "built-with-devin-linkcheck/1.0"})
            with urllib.request.urlopen(req, timeout=10) as r:
                return r.status < 400, r.status
        except Exception as e2:
            return False, 0


def main():
    data = json.loads(OUT.read_text())
    urls = sorted({s["url"] for k in ("bot_deployments", "products", "enterprise_cases")
                   for e in data[k] for s in e.get("sources", [])})
    checked_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with ThreadPoolExecutor(max_workers=12) as ex:
        results = dict(zip(urls, ex.map(check, urls)))
    data["source_checks"] = {
        u: {"ok": ok, "status": st, "checked_at": checked_at}
        for u, (ok, st) in results.items()}
    data["source_checks_summary"] = {
        "checked_at": checked_at,
        "total": len(urls),
        "broken": sum(1 for ok, _ in results.values() if not ok),
    }
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    for u, (ok, st) in results.items():
        if not ok:
            print(f"  BROKEN {st}: {u}")
    print(f"checked {len(urls)} sources — broken: {data['source_checks_summary']['broken']}")


if __name__ == "__main__":
    main()
