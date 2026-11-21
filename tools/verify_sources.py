#!/usr/bin/env python3
"""Re-check every source URL in docs/registry.json and record liveness.

Writes a "source_checks" map into the dataset:
  {url: {"ok": bool, "status": int, "kind"?: str, "checked_at": ISO-8601}}
kind is only present on failures: "broken" (real HTTP error),
"unreachable" (status 0 — host not reachable from this machine),
"waf_blocked" (bot-guard on a host listed in WAF_HOSTS; verify in a browser).
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

# Hosts that 403 automated clients but serve browsers fine (WAF/bot-guard).
# Verify these manually in a browser before treating them as broken.
WAF_HOSTS = ("medium.com", "linux.do")


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
        except urllib.error.HTTPError as e2:
            return e2.code < 400, e2.code
        except Exception:
            # status 0 = unreachable from this host (DNS/TLS/WAF block),
            # not evidence the link is dead — reported separately
            return False, 0


def main():
    data = json.loads(OUT.read_text())
    urls = sorted({s["url"] for k in ("bot_deployments", "products", "enterprise_cases")
                   for e in data[k] for s in e.get("sources", [])})
    checked_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with ThreadPoolExecutor(max_workers=12) as ex:
        results = dict(zip(urls, ex.map(check, urls)))
    def kind(u, ok, st):
        if ok:
            return "ok"
        if st == 0:
            return "unreachable"
        if st in (401, 403) and any(h in u for h in WAF_HOSTS):
            return "waf_blocked"
        return "broken"

    kinds = {u: kind(u, ok, st) for u, (ok, st) in results.items()}
    data["source_checks"] = {
        u: {"ok": ok, "status": st, "checked_at": checked_at,
            **({"kind": kinds[u]} if kinds[u] != "ok" else {})}
        for u, (ok, st) in results.items()}
    counts = {k: sum(1 for v in kinds.values() if v == k)
              for k in ("broken", "unreachable", "waf_blocked")}
    data["source_checks_summary"] = {
        "checked_at": checked_at,
        "total": len(urls),
        **counts,
    }
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    for u, (ok, st) in results.items():
        if not ok:
            print(f"  {kinds[u].upper()} {st}: {u}")
    print(f"checked {len(urls)} sources — " +
          ", ".join(f"{k}: {v}" for k, v in counts.items()))


if __name__ == "__main__":
    main()
