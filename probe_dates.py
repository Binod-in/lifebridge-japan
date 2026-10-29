"""Scratch probe: sample deadline save -> Important Dates (NOT committed).

Sample notice -> save deadline -> follow "View in Important Dates" link ->
entry visible on Important Dates with date 2026-11-30. Dumps localStorage
and list HTML on failure to expose any save/load mismatch.

Usage: .venv python.exe probe_dates.py  (exit 0/1). Delete after use.
"""
import json
import os
import subprocess
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
VENV_PY = os.path.join(ROOT, ".venv", "Scripts", "python.exe")
PORT = 8769
BASE = "http://127.0.0.1:%d" % PORT

results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ") + name + (" -- " + str(detail) if detail else ""),
          flush=True)


def wait_server():
    for _ in range(100):
        try:
            if urllib.request.urlopen(BASE + "/index.html", timeout=2).status == 200:
                return True
        except Exception:
            time.sleep(0.2)
    return False


def main():
    from playwright.sync_api import sync_playwright

    env = dict(os.environ)
    env["PORT"] = str(PORT)
    env["META_API_KEY"] = "probe-dummy"
    server = subprocess.Popen([VENV_PY, "server.py"], cwd=ROOT, env=env,
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        if not wait_server():
            print("server did not start", flush=True)
            return 1
        with sync_playwright() as p:
            browser = p.chromium.launch(channel="chrome", headless=True,
                                        args=["--no-sandbox"])
            ctx = browser.new_context()
            ctx.add_init_script("try { localStorage.setItem('lb_theme', 'light');"
                                " localStorage.setItem('lb_lang', 'en'); } catch (e) {}")
            page = ctx.new_page()
            page.goto(BASE + "/explain.html")
            page.wait_for_selector("#sample-btn", timeout=15000)

            page.click("#sample-btn")
            page.wait_for_selector("#save-date-btn:visible", timeout=15000)
            check("sample.save-visible", True)
            page.click("#save-date-btn")
            deadline = time.time() + 10
            msg = ""
            while time.time() < deadline:
                try:
                    msg = page.text_content("#save-date-msg") or ""
                    if "Saved" in msg:
                        break
                except Exception:
                    pass
                time.sleep(0.25)
            check("save.confirmed", "Saved" in msg, repr(msg))
            link = page.locator("#save-date-msg a")
            href = ""
            try:
                href = link.get_attribute("href") or ""
            except Exception:
                pass
            link_text = ""
            try:
                link_text = link.text_content() or ""
            except Exception:
                pass
            check("save.link", href == "important-dates.html"
                  and "View in Important Dates" in link_text,
                  "href=%r text=%r" % (href, link_text))

            raw = page.evaluate("localStorage.getItem('lifego-dates')")
            try:
                entries = json.loads(raw or "[]")
            except Exception:
                entries = "<unparseable: %r>" % raw
            print("stored lifego-dates: %s" % json.dumps(entries)[:400], flush=True)
            match = [e for e in entries
                     if isinstance(e, dict) and e.get("date") == "2026-11-30"] \
                if isinstance(entries, list) else []
            check("save.stored", len(match) == 1, "entries=%s" % (
                [(e.get("date"), (e.get("title") or "")[:40]) for e in match]))

            link.click()
            page.wait_for_url("**/important-dates.html", timeout=15000)
            page.wait_for_selector("#date-list li", timeout=15000)
            items = page.locator("#date-list li").all_text_contents()
            print("date-list: %s" % json.dumps(items)[:400], flush=True)
            visible = [t for t in items if "2026-11-30" in t]
            check("dates.entry-visible", len(visible) == 1,
                  "matches=%d" % len(visible))
            if visible:
                check("dates.title-matches",
                      "City notice" in visible[0], repr(visible[0][:90]))
            ctx.close()
            browser.close()
    finally:
        try:
            server.terminate()
        except Exception:
            pass
    failed = [n for (n, ok) in results if not ok]
    print("probe: %d/%d passed" % (len(results) - len(failed), len(results)), flush=True)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
