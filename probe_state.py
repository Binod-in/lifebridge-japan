"""Scratch probe: failed scan must not corrupt previous photo+explanation.

Letter A scans OK (mocked /explain), then the server is STOPPED and letter B
is scanned (network failure). A follow-up question must still send letter A's
photo with letter A's explanation. Also checks the follow-up UI is disabled
while a scan is in flight.

Usage: .venv python.exe probe_state.py  (exit 0/1). Delete after use.
"""
import base64
import json
import os
import subprocess
import sys
import threading
import time
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
VENV_PY = os.path.join(ROOT, ".venv", "Scripts", "python.exe")
PORT = 8766
BASE = "http://127.0.0.1:%d" % PORT
TMP = os.path.join(os.environ.get("TEMP", r"C:\Temp"), "lbprobe")
PNG_A = os.path.join(TMP, "letterA.png")
PNG_B = os.path.join(TMP, "letterB.png")
EXPL_A = ('{"what": "Letter A water bill", "why": "monthly charge", '
          '"importance": "low", "next_steps": "pay at conbini", '
          '"deadline": "none shown", "check": "account name"}')

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


def make_images():
    from PIL import Image
    import random
    os.makedirs(TMP, exist_ok=True)
    rnd = random.Random(7)
    img = Image.new("RGB", (800, 600))
    px = img.load()
    for y in range(0, 600, 4):
        for x in range(0, 800, 4):
            v = rnd.randrange(180, 256)
            for dy in range(4):
                for dx in range(4):
                    px[x + dx, y + dy] = (v, v - 30, v - 60)
    img.save(PNG_A, "PNG")
    Image.new("RGB", (400, 300), (40, 90, 200)).save(PNG_B, "PNG")


def poll_text(page, selector, needle, timeout_ms):
    deadline = time.time() + timeout_ms / 1000.0
    while time.time() < deadline:
        try:
            if needle in (page.text_content(selector) or ""):
                return True
        except Exception:
            pass
        time.sleep(0.25)
    return False


def poll_disabled(page, selector, want_disabled, timeout_ms):
    deadline = time.time() + timeout_ms / 1000.0
    while time.time() < deadline:
        try:
            if page.is_disabled(selector) == want_disabled:
                return True
        except Exception:
            pass
        time.sleep(0.1)
    return False


def main():
    from playwright.sync_api import sync_playwright

    make_images()
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
            page = ctx.new_page()

            # ---- Scan A succeeds (2s delayed mock) ----
            def slow_ok(route):
                def later():
                    try:
                        route.fulfill(status=200, content_type="application/json",
                                       body=json.dumps({"text": EXPL_A}))
                    except Exception:
                        pass
                threading.Timer(2.0, later).start()

            page.route("**/explain", slow_ok)
            page.goto(BASE + "/explain.html")
            page.set_input_files("#photo", PNG_A)
            page.click("#explain-btn")
            # While the scan is in flight, follow-up UI must be disabled.
            in_flight = all([
                poll_disabled(page, "#ask-input", True, 1500),
                poll_disabled(page, "#ask-btn", True, 1500),
                poll_disabled(page, ".chip >> nth=0", True, 1500),
            ])
            check("inflight.followup-disabled", in_flight)
            page.wait_for_selector("#followup-card", state="visible", timeout=30000)
            re_enabled = all([
                poll_disabled(page, "#ask-input", False, 5000),
                poll_disabled(page, "#ask-btn", False, 5000),
                poll_disabled(page, ".chip >> nth=0", False, 5000),
            ])
            check("inflight.followup-reenabled", re_enabled)

            # ---- Follow-up Q1 captures letter A's stored pair ----
            seen = {}
            page.route("**/ask", lambda r: (
                seen.setdefault("ask1", r.request.post_data),
                r.fulfill(status=200, content_type="application/json",
                           body=json.dumps({"answer": "ok 1"})))
            )
            page.fill("#ask-input", "what is this about?")
            page.click("#ask-btn")
            page.wait_for_selector(".chat-a >> nth=0", timeout=30000)
            ask1 = json.loads(seen.get("ask1") or "{}")
            img1, expl1 = ask1.get("image", ""), ask1.get("explanation", "")
            try:
                raw1 = base64.b64decode(img1.split(",", 1)[1])
            except Exception:
                raw1 = b""
            check("pair.q1-is-letter-a",
                  expl1 == EXPL_A and raw1[:3] == b"\xff\xd8\xff",
                  "expl_match=%s jpeg=%s img_len=%d" % (
                      expl1 == EXPL_A, raw1[:3] == b"\xff\xd8\xff", len(img1)))

            # ---- Server stopped; scan B fails with a network error ----
            page.unroute("**/explain")
            server.terminate()
            try:
                server.wait(timeout=15)
            except Exception:
                server.kill()
            page.set_input_files("#photo", PNG_B)
            page.click("#explain-btn")
            failed = poll_text(page, "#status", "Sorry, it did not work", 30000)
            status = page.text_content("#status") or ""
            check("scanb.network-failure-shown", failed, "status=%r" % status)

            # ---- Follow-up Q2 must still send letter A's pair ----
            page.route("**/ask", lambda r: (
                seen.setdefault("ask2", r.request.post_data),
                r.fulfill(status=200, content_type="application/json",
                           body=json.dumps({"answer": "ok 2"})))
            )
            page.fill("#ask-input", "and the deadline?")
            page.click("#ask-btn")
            page.wait_for_selector(".chat-a >> nth=1", timeout=30000)
            ask2 = json.loads(seen.get("ask2") or "{}")
            img2, expl2 = ask2.get("image", ""), ask2.get("explanation", "")
            check("pair.q2-photo-unchanged", img2 == img1,
                  "len1=%d len2=%d" % (len(img1), len(img2)))
            check("pair.q2-explanation-unchanged", expl2 == expl1 == EXPL_A,
                  "expl2_match=%s" % (expl2 == EXPL_A))

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
