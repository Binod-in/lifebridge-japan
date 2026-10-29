# Validation (October 2026)

Tested in a real Chromium browser (Playwright), all 24 pages, at 1440, 1000, 600 and 390 px wide:
- No JavaScript errors on any page.
- No horizontal scrolling at any width.
- Every local link, image and `#anchor` target exists.
- No emoji icons in any HTML or JS file. (Em dashes appear inside translation
  strings only, never as icon substitutes.)

Feature checks (all passed):
- Checklist (Start Here only; Home shows the live Money Tracker card now — tiles, goal row, quick-add, recent): tick, progress updates, kept after reload. Separate lists per situation and per guide (`?guide=<id>`).
- Phrase card: category switch, previous/next with counter, Save and Unsave, saved phrase shows reading, English and Nepali on Saved Phrases, Remove. Nepali meaning line shows only when the UI language is Nepali.
- Search: `move house`, `find a job`, `bank`, `銀行`, `बैंक`, no-match text, HTML-like input shown as plain text.
- Guides: bookmark on Guides and topic pages, Saved Guides list, removing the last one shows the empty message.
- Start Here: plan per situation, unknown situation falls back to "Just arrived", display name in the title. `start.html?guide=<id>` shows that guide's plan and checklist instead.
- Demo profile: save name, header changes to "My Profile".
- Important Dates: add, sorted by date, remove.
- Settings: reset removes `lifego-` data and money records; the language choice is kept. Appearance picker switches light/dark/follow-device.
- Money Tracker: goal form validates input, deleting an entry asks first, goal progress bars expose their values to screen readers.
- Mobile: bottom navigation on every page, hamburger menu under 600 px, current page marked in the menu.
- Offline: every page, script, image and icon is precached; `offline.html` is shown when nothing cached matches, and a banner appears while offline.
- PWA: HTML is network-first (fresh pages, offline fallback); images/CSS/JS are cache-first. Manifest has square 192/512 icons (run `scripts/make_pwa_icons.py` after a fresh clone).
- Chatbot: floating button on every page; opens Messenger-style (avatar header, online status, message timestamps, pill input), modal with backdrop/page lock/focus trap, mobile bottom sheet, suggestions stay after each answer, keyword answers in the current UI language with guide links, works fully offline.
- Home: AI-generated hero photos (images/hero-wide.jpg, images/hero-mobile.jpg), larger headline, pill badges, refined card hover. Home emergency numbers are plain text (no direct-dial buttons); the Emergency page keeps its Call buttons.

Automated suite (`python -m unittest discover tests -v`):
- `tests/test_ask.py`: `/ask` key/question handling and context forwarding.
- `tests/test_security.py`: static allowlist, upload and magic-byte checks, rate limits, security headers, same-origin/token access, proxy-aware limits, `/ask` validation, `/explain` success path, 404 pages, cache headers.
- `tests/test_i18n.py`: translation key parity across en/ne/vi/my, every HTML `data-i18n*` key exists, every guide-data key resolves, chatbot knowledge base is complete (4 languages, valid links), and every service-worker precache file exists.
- `tests/test_journey.py`: every guide page links to its own start plan, every guide has a task list with unique ids, every guide task key exists in all 4 languages, home tracker card markup/keys, no header Start Here link.
- `tests/test_manifest.py`: manifest is valid JSON with square 192/512 icons that exist and are precached.

Not tested automatically:
- Voice playback depends on installed device voices.
- Clipboard needs localhost or HTTPS. Try Listen and Copy on your own device before presenting.
- Contrast ratios and screen-reader announcements need a real browser + device check.
- The live Meta API call needs `META_API_KEY`; tests use mocked replies.
