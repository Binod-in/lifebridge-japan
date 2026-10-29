"""Scratch browser probe for the Lens/offline reliability fixes (NOT committed).

Spins up server.py, drives installed Chrome via Playwright, and checks:
  fix1: start.html?situation=student and start.html?guide=documents load
        their real page (not offline.html) while offline.
  fix4: a small-but-valid PNG upload is re-encoded to JPEG before /explain,
        and /ask sends the same JPEG data URI.
  fix3: an HTML 502 page from /explain shows a clean server-error message,
        never "Unexpected token".
  fix2: a hanging /explain shows the too-long message after ~45s.

Usage: .venv python.exe probe_scratch.py  (exit 0/1). Delete after use.
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
PORT = 8765
BASE = "http://127.0.0.1:%d" % PORT
TMP = os.path.join(os.environ.get("TEMP", r"C:\Temp"), "lbprobe")
PNG_PATH = os.path.join(TMP, "notice.png")

results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), str(detail or "")))
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


def make_png():
    from PIL import Image
    import random
    os.makedirs(TMP, exist_ok=True)
    rnd = random.Random(42)
    img = Image.new("RGB", (800, 600))
    px = img.load()
    for y in range(0, 600, 4):
        for x in range(0, 800, 4):
            v = rnd.randrange(200, 256)
            for dy in range(4):
                for dx in range(4):
                    px[x + dx, y + dy] = (v, v, v - 20)
    img.save(PNG_PATH, "PNG")
    return os.path.getsize(PNG_PATH)


def poll_evaluate(page, expr, timeout_ms):
    """Poll page.evaluate from Python: wait_for_function's injected polling
    is blocked by the site's CSP (no unsafe-eval), but direct CDP evaluate
    calls are allowed."""
    deadline = time.time() + timeout_ms / 1000.0
    while time.time() < deadline:
        try:
            if page.evaluate(expr):
                return True
        except Exception:
            pass
        time.sleep(0.25)
    return False


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


def main():
    from playwright.sync_api import sync_playwright

    png_size = make_png()
    print("probe png bytes: %d" % png_size, flush=True)

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

            # ---- fix1: offline query-string links ----
            ctx = browser.new_context()
            page = ctx.new_page()
            try:
                page.goto(BASE + "/start.html")
                precached = poll_evaluate(
                    page, "caches.match('start.html').then(r => !!r)", 30000)
                check("fix1.precached", precached, "start.html in SW cache")
                if precached:
                    # Reload so the active worker controls this page, then go offline.
                    page.reload()
                    controlled = poll_evaluate(
                        page, "!!navigator.serviceWorker.controller", 15000)
                    check("fix1.controlled", controlled, "SW controls page")
                    if not controlled:
                        raise RuntimeError("SW never took control")
                    ctx.set_offline(True)
                    for qs in ("?situation=student", "?guide=documents"):
                        try:
                            page.goto(BASE + "/start.html" + qs)
                            h1 = page.text_content("h1") or ""
                            html = page.content()
                            ok = ((h1 != "You are offline")
                                  and ("journey-form" in html))
                            check("fix1.offline-start" + qs, ok, "h1=%r" % h1)
                        except Exception as e:
                            check("fix1.offline-start" + qs, False,
                                  "goto raised %s" % e)
            except Exception as e:
                check("fix1.setup", False, "%s" % e)
            ctx.close()

            # ---- fix4: PNG always re-encoded to JPEG for both endpoints ----
            ctx = browser.new_context()
            page = ctx.new_page()
            seen = {}
            page.route("**/explain", lambda r: (
                seen.setdefault("explain_body", r.request.post_data_buffer),
                r.fulfill(status=200, content_type="application/json",
                           body=json.dumps({"text": "{}"})))
            )
            page.goto(BASE + "/explain.html")
            page.set_input_files("#photo", PNG_PATH)
            page.click("#explain-btn")
            page.wait_for_selector("#followup-card", state="visible", timeout=30000)
            body = bytes(seen.get("explain_body") or b"")
            # CDP does not expose multipart file bytes, so assert on the photo
            # part's Content-Type: canvas re-encode yields image/jpeg, while a
            # passed-through PNG keeps image/png.
            has_jpeg_hdr = b"image/jpeg" in body
            has_png_hdr = b"image/png" in body
            check("fix4.explain-part-is-jpeg",
                  has_jpeg_hdr and not has_png_hdr,
                  "jpeg_hdr=%s png_hdr=%s part_bytes=%d" % (
                      has_jpeg_hdr, has_png_hdr, len(body)))
            page.route("**/ask", lambda r: (
                seen.setdefault("ask_body", r.request.post_data),
                r.fulfill(status=200, content_type="application/json",
                           body=json.dumps({"answer": "ok"})))
            )
            page.fill("#ask-input", "is this urgent?")
            page.click("#ask-btn")
            page.wait_for_selector(".chat-a", timeout=30000)
            try:
                ask_img = (json.loads(seen.get("ask_body") or "{}")).get("image", "")
            except Exception:
                ask_img = ""
            try:
                ask_raw = base64.b64decode(ask_img.split(",", 1)[1])
            except Exception:
                ask_raw = b""
            is_jpeg = ask_raw[:3] == b"\xff\xd8\xff"
            check("fix4.ask-sends-jpeg",
                  ask_img.startswith("data:image/jpeg;base64,") and is_jpeg,
                  "prefix=%r jpeg_magic=%s len=%d" % (
                      ask_img[:30], is_jpeg, len(ask_img)))
            ctx.close()

            # ---- fix3: HTML error page -> clean message ----
            ctx = browser.new_context()
            page = ctx.new_page()
            page.route("**/explain", lambda r: r.fulfill(
                status=502, content_type="text/html",
                body="<html><body><h1>502 Bad Gateway</h1>proxy meltdown</body></html>"))
            page.goto(BASE + "/explain.html")
            page.set_input_files("#photo", PNG_PATH)
            page.click("#explain-btn")
            if poll_text(page, "#status", "Sorry", 15000) or poll_text(
                    page, "#status", "Server error", 15000):
                status = page.text_content("#status") or ""
            else:
                status = page.text_content("#status") or "<empty>"
            check("fix3.clean-server-error",
                  ("Server error" in status) and ("Unexpected token" not in status),
                  "status=%r" % status)
            ctx.close()

            # ---- fix2: hanging AI -> too-long message (~45s) ----
            ctx = browser.new_context()
            page = ctx.new_page()

            def slow(route):
                def later():
                    try:
                        route.fulfill(status=200, content_type="application/json",
                                       body=json.dumps({"text": "{}"}))
                    except Exception:
                        pass
                threading.Timer(65, later).start()

            page.route("**/explain", slow)
            page.goto(BASE + "/explain.html")
            page.set_input_files("#photo", PNG_PATH)
            t0 = time.time()
            page.click("#explain-btn")
            if poll_text(page, "#status", "took too long", 60000):
                dt = time.time() - t0
                status = page.text_content("#status") or ""
                check("fix2.timeout-message", True, "%ds status=%r" % (dt, status))
            else:
                status = page.text_content("#status") or ""
                check("fix2.timeout-message", False,
                      "still waiting after 60s, status=%r" % status)
            ctx.close()
            browser.close()
    finally:
        try:
            server.terminate()
        except Exception:
            pass
    failed = [n for (n, ok, _) in results if not ok]
    print("probe: %d/%d passed" % (len(results) - len(failed), len(results)), flush=True)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
