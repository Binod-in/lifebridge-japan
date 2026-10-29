"""Scratch probe: phone-visible fixes at mobile width (NOT committed).

Checks at 390px (and 1000px for the wide hero):
  fix1: no login.html link in .header-act on index/guide/start; lang
        selector and Menu button still present.
  fix2: hero h1/desc readable over both hero images in dark theme
        (WCAG contrast vs the overlay colour), light theme unchanged.
  fix3: tracker tiles, quick-form inputs, search card + links readable
        in both themes (WCAG contrast vs computed backgrounds).
  fix4: open chat locks body scroll (fixed + offset), chat messages
        contain overscroll and still scroll internally; close restores.

Usage: .venv python.exe probe_phone.py  (exit 0/1). Delete after use.
"""
import os
import re
import subprocess
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
VENV_PY = os.path.join(ROOT, ".venv", "Scripts", "python.exe")
PORT = 8767
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


def parse_rgb(s):
    return tuple(map(int, re.findall(r"\d+", s or "")[:3]))


def lum(rgb):
    out = []
    for c in rgb:
        c = c / 255.0
        out.append(c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * out[0] + 0.7152 * out[1] + 0.0722 * out[2]


def ratio(fg, bg):
    a, b = sorted([lum(fg), lum(bg)])
    return (b + 0.05) / (a + 0.05)


def style(page, selector, prop):
    return page.evaluate(
        "([s, p]) => getComputedStyle(document.querySelector(s))[p]",
        [selector, prop])


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

            def themed_page(theme, width=390):
                ctx = browser.new_context(viewport={"width": width, "height": 844},
                                          is_mobile=(width < 700),
                                          has_touch=(width < 700))
                ctx.add_init_script(
                    "try { localStorage.setItem('lb_theme', '%s'); } catch (e) {}" % theme)
                page = ctx.new_page()
                return ctx, page

            # ---- fix1: header on three pages ----
            ctx, page = themed_page("light")
            for name in ("index.html", "guide.html", "start.html"):
                page.goto(BASE + "/" + name)
                page.wait_for_selector(".menu-btn", timeout=15000)
                page.wait_for_selector(".chat-fab", timeout=15000)
                n_login = page.locator('.header-act a[href="login.html"]').count()
                has_lang = page.locator("#lang-select").count() == 1
                menu_txt = page.text_content(".menu-btn") or ""
                check("fix1.no-profile-%s" % name, n_login == 0,
                      "login links=%d" % n_login)
                if name == "index.html":
                    check("fix1.lang-kept", has_lang)
                    check("fix1.menu-kept", "Menu" in menu_txt, repr(menu_txt))
            ctx.close()

            # ---- fix2: hero text over both images, dark theme ----
            for width, img in ((390, "hero-mobile.jpg"), (1000, "hero-wide.jpg")):
                ctx, page = themed_page("dark", width)
                page.goto(BASE + "/index.html")
                page.wait_for_selector(".hero h1", timeout=15000)
                bg = style(page, ".hero", "backgroundImage") or ""
                h1 = parse_rgb(style(page, ".hero h1", "color"))
                desc = parse_rgb(style(page, ".hero-desc", "color"))
                overlay = (15, 26, 51)
                check("fix2.dark-%dpx-photo" % width,
                      img in bg and "linear-gradient" in bg,
                      bg[:80])
                check("fix2.dark-%dpx-h1" % width, ratio(h1, overlay) >= 4.5,
                      "h1=%s ratio=%.1f" % (h1, ratio(h1, overlay)))
                check("fix2.dark-%dpx-desc" % width, ratio(desc, overlay) >= 4.5,
                      "desc=%s ratio=%.1f" % (desc, ratio(desc, overlay)))
                ctx.close()

            # ---- fix2/3: light theme unchanged ----
            ctx, page = themed_page("light")
            page.goto(BASE + "/index.html")
            page.wait_for_selector(".hero h1", timeout=15000)
            h1 = parse_rgb(style(page, ".hero h1", "color"))
            check("fix2.light-h1-dark", ratio(h1, (255, 255, 255)) >= 4.5,
                  "h1=%s ratio=%.1f" % (h1, ratio(h1, (255, 255, 255))))
            tile_bg = parse_rgb(style(page, ".tracker-promo .summary-box",
                                        "backgroundColor"))
            tile_strong = parse_rgb(style(page, ".tracker-promo .summary-box strong",
                                           "color"))
            check("fix3.light-tile", ratio(tile_strong, tile_bg) >= 4.5,
                  "strong=%s bg=%s ratio=%.1f"
                  % (tile_strong, tile_bg, ratio(tile_strong, tile_bg)))
            card_bg = parse_rgb(style(page, ".search-section", "backgroundColor"))
            h2 = parse_rgb(style(page, "#search-title", "color"))
            check("fix3.light-search-h2", ratio(h2, card_bg) >= 4.5,
                  "h2=%s bg=%s ratio=%.1f" % (h2, card_bg, ratio(h2, card_bg)))
            ctx.close()

            # ---- fix3: dark theme tracker + search ----
            ctx, page = themed_page("dark")
            page.goto(BASE + "/index.html")
            page.wait_for_selector("#home-sum-income", timeout=15000)
            tile_bg = parse_rgb(style(page, ".tracker-promo .summary-box",
                                        "backgroundColor"))
            tile_span = parse_rgb(style(page, ".tracker-promo .summary-box span",
                                         "color"))
            tile_strong = parse_rgb(style(page, ".tracker-promo .summary-box strong",
                                           "color"))
            check("fix3.dark-tile-label", ratio(tile_span, tile_bg) >= 4.5,
                  "span=%s bg=%s ratio=%.1f"
                  % (tile_span, tile_bg, ratio(tile_span, tile_bg)))
            check("fix3.dark-tile-amount", ratio(tile_strong, tile_bg) >= 4.5,
                  "strong=%s bg=%s ratio=%.1f"
                  % (tile_strong, tile_bg, ratio(tile_strong, tile_bg)))
            inp_bg = parse_rgb(style(page, "#home-amount", "backgroundColor"))
            inp_col = parse_rgb(style(page, "#home-amount", "color"))
            check("fix3.dark-tile-input", ratio(inp_col, inp_bg) >= 4.5,
                  "fg=%s bg=%s ratio=%.1f" % (inp_col, inp_bg, ratio(inp_col, inp_bg)))
            card_bg = parse_rgb(style(page, ".search-section", "backgroundColor"))
            h2 = parse_rgb(style(page, "#search-title", "color"))
            link = parse_rgb(style(page, ".search-popular a", "color"))
            check("fix3.dark-search-h2", ratio(h2, card_bg) >= 4.5,
                  "h2=%s bg=%s ratio=%.1f" % (h2, card_bg, ratio(h2, card_bg)))
            check("fix3.dark-search-link", ratio(link, card_bg) >= 4.5,
                  "link=%s bg=%s ratio=%.1f" % (link, card_bg, ratio(link, card_bg)))
            ctx.close()

            # ---- fix4: chat scroll lock at mobile width ----
            ctx, page = themed_page("light")
            page.goto(BASE + "/index.html")
            page.wait_for_selector(".chat-fab", timeout=15000)
            page.evaluate("window.scrollTo(0, 800)")
            page.wait_for_function("window.scrollY > 700", timeout=10000)
            y0 = page.evaluate("window.scrollY")
            page.click(".chat-fab")
            page.wait_for_selector(".chat-panel:not([hidden])", timeout=15000)
            has_cls = page.evaluate(
                "document.documentElement.classList.contains('chat-open')")
            body_pos = style(page, "body", "position")
            body_top = style(page, "body", "top")
            os_behavior = style(page, ".chat-msgs", "overscrollBehavior")
            check("fix4.lock-engaged",
                  has_cls and body_pos == "fixed" and body_top == "%dpx" % -y0,
                  "cls=%s pos=%s top=%s y0=%s" % (has_cls, body_pos, body_top, y0))
            check("fix4.msgs-contained", os_behavior == "contain",
                  "overscroll-behavior=%s" % os_behavior)
            # Scroll inside the messages: internal list moves, page stays.
            page.evaluate("document.querySelector('.chat-msgs').scrollTop = 0")
            box = page.locator(".chat-msgs").bounding_box()
            page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
            page.mouse.wheel(0, 600)
            time.sleep(0.5)
            y1 = page.evaluate("window.scrollY")
            check("fix4.page-does-not-scroll", abs(y1 - y0) < 2,
                  "y0=%s y1=%s" % (y0, y1))
            page.click(".chat-close")
            page.wait_for_selector(".chat-panel[hidden]", timeout=15000)
            has_cls = page.evaluate(
                "document.documentElement.classList.contains('chat-open')")
            body_pos = style(page, "body", "position")
            body_top = page.evaluate("document.body.style.top")
            y2 = page.evaluate("window.scrollY")
            check("fix4.restore-on-close",
                  (not has_cls) and body_pos == "static" and body_top == ""
                  and abs(y2 - y0) < 2,
                  "cls=%s pos=%s top=%r y2=%s y0=%s"
                  % (has_cls, body_pos, body_top, y2, y0))
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
