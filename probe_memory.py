"""Scratch probe: multi-turn follow-up memory end to end (NOT committed).

Runs a stub Meta API (canned answers that echo whether history arrived),
the real server.py pointed at it, and a real browser: scan a notice, ask
"Is this urgent?" then "What if I am late?", and show the second answer
uses the first exchange. Also covers history-clear on rescan and the
sample-notice button (image absent -> friendly message).

Usage: .venv python.exe probe_memory.py  (exit 0/1). Delete after use.
"""
import base64
import json
import os
import subprocess
import sys
import threading
import time
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
VENV_PY = os.path.join(ROOT, ".venv", "Scripts", "python.exe")
PORT = 8768
STUB_PORT = 8899
BASE = "http://127.0.0.1:%d" % PORT
TMP = os.path.join(os.environ.get("TEMP", r"C:\Temp"), "lbprobe")
PNG_A = os.path.join(TMP, "memA.png")
PNG_B = os.path.join(TMP, "memB.png")
EXPL = ('{"what": "Test tax bill", "why": "yearly charge", '
        '"importance": "high", "next_steps": "pay soon", '
        '"deadline": "end of month", "check": "amount"}')

ASK_PAYLOADS = []
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ") + name + (" -- " + str(detail) if detail else ""),
          flush=True)


class Stub(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        text = json.dumps(payload)
        if "Reply with ONLY a JSON object" in text:
            answer = EXPL
        elif '"role": "assistant"' in text or '"role":"assistant"' in text:
            n = text.count('"role": "assistant"') + text.count('"role":"assistant"')
            ASK_PAYLOADS.append(payload)
            answer = ("Since it is urgent (your first question), being late "
                      "risks a late fee. Context used: %d prior exchange(s)." % n)
        else:
            ASK_PAYLOADS.append(payload)
            answer = "It is quite urgent - pay it soon."
        body = json.dumps({"choices": [{"message": {"content": answer}}]}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


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
    rnd = random.Random(11)
    img = Image.new("RGB", (800, 600))
    px = img.load()
    for y in range(0, 600, 4):
        for x in range(0, 800, 4):
            v = rnd.randrange(180, 256)
            for dy in range(4):
                for dx in range(4):
                    px[x + dx, y + dy] = (v, v - 40, v - 80)
    img.save(PNG_A, "PNG")
    Image.new("RGB", (500, 400), (30, 120, 60)).save(PNG_B, "PNG")


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

    make_images()
    stub = HTTPServer(("127.0.0.1", STUB_PORT), Stub)
    threading.Thread(target=stub.serve_forever, daemon=True).start()

    env = dict(os.environ)
    env["PORT"] = str(PORT)
    env["META_API_KEY"] = "probe-dummy"
    env["META_BASE_URL"] = "http://127.0.0.1:%d" % STUB_PORT
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

            # ---- Part B: sample button (image absent -> message) ----
            page.wait_for_selector("#sample-btn", timeout=15000)
            btn_text = page.text_content("#sample-btn") or ""
            check("sample.visible", "sample notice" in btn_text.lower(),
                  repr(btn_text))
            page.click("#sample-btn")
            shown = poll_text(page, "#status", "not available", 15000)
            check("sample.missing-message", shown,
                  repr(page.text_content("#status") or ""))

            # ---- Scan notice, ask Q1 then Q2 ----
            page.set_input_files("#photo", PNG_A)
            page.click("#explain-btn")
            page.wait_for_selector("#followup-card", state="visible", timeout=30000)
            page.fill("#ask-input", "Is this urgent?")
            page.click("#ask-btn")
            page.wait_for_selector(".chat-a >> nth=0", timeout=30000)
            a1 = page.text_content(".chat-a >> nth=0") or ""
            print("A1: %s" % a1, flush=True)
            page.fill("#ask-input", "What if I am late?")
            page.click("#ask-btn")
            page.wait_for_selector(".chat-a >> nth=1", timeout=30000)
            a2 = page.text_content(".chat-a >> nth=1") or ""
            print("A2: %s" % a2, flush=True)

            check("memory.q1-plain", "urgent" in a1.lower() and "prior exchange" not in a1,
                  repr(a1))
            check("memory.q2-uses-context",
                  "urgent" in a2.lower() and "late fee" in a2.lower()
                  and "1 prior exchange" in a2,
                  repr(a2))
            if len(ASK_PAYLOADS) >= 2:
                p1, p2 = ASK_PAYLOADS[0], ASK_PAYLOADS[1]
                m1 = p1["messages"]
                check("memory.ask1-legacy-shape",
                      len(m1) == 1 and m1[0]["role"] == "user"
                      and any(part.get("type") == "image_url"
                              for part in m1[0]["content"]),
                      "roles=%s" % [m["role"] for m in m1])
                m2 = p2["messages"]
                roles2 = [m["role"] for m in m2]
                s2 = json.dumps(p2)
                check("memory.ask2-turns", roles2 == ["system", "user", "assistant", "user"],
                      "roles=%s" % roles2)
                check("memory.ask2-no-photo", "image_url" not in s2)
                check("memory.ask2-carries-q1",
                      "Is this urgent?" in s2 and "quite urgent" in s2)
            else:
                check("memory.payloads-captured", False,
                      "got %d" % len(ASK_PAYLOADS))

            # ---- Rescan clears history: next ask is legacy-shaped again ----
            ASK_PAYLOADS.clear()
            page.set_input_files("#photo", PNG_B)
            page.click("#explain-btn")
            deadline = time.time() + 30
            while time.time() < deadline:
                try:
                    if page.locator(".chat-a").count() == 0:
                        break
                except Exception:
                    pass
                time.sleep(0.25)
            page.fill("#ask-input", "Is this urgent?")
            page.click("#ask-btn")
            page.wait_for_selector(".chat-a >> nth=0", timeout=30000)
            if ASK_PAYLOADS:
                m3 = ASK_PAYLOADS[0]["messages"]
                check("memory.rescan-clears",
                      len(m3) == 1 and "image_url" in json.dumps(m3),
                      "roles=%s" % [m["role"] for m in m3])
            else:
                check("memory.rescan-clears", False, "no payload")
            ctx.close()
            browser.close()
    finally:
        try:
            server.terminate()
        except Exception:
            pass
        try:
            stub.shutdown()
        except Exception:
            pass
    failed = [n for (n, ok) in results if not ok]
    print("probe: %d/%d passed" % (len(results) - len(failed), len(results)), flush=True)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
