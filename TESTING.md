# Validation (October 2026)

Tested in a real Chromium browser (Playwright), all 24 pages, at 1440, 1000, 600 and 390 px wide:
- No JavaScript errors on any page.
- No horizontal scrolling at any width.
- Every local link, image and `#anchor` target exists.
- No emoji icons in any HTML or JS file. (Em dashes appear inside translation
  strings only, never as icon substitutes.)

Feature checks (all passed):
- Checklist: tick, progress updates, ticks shared between Home and Start Here, kept after reload. Separate lists for student, worker, moving-home, senmon-school and university situations.
- Phrase card: category switch, previous/next with counter, Save and Unsave, saved phrase shows reading, English and Nepali on Saved Phrases, Remove. Nepali meaning line shows only when the UI language is Nepali.
- Search: `move house`, `find a job`, `bank`, `銀行`, `बैंक`, no-match text, HTML-like input shown as plain text.
- Guides: bookmark on Guides and topic pages, Saved Guides list, removing the last one shows the empty message.
- Start Here: plan per situation, unknown situation falls back to "Just arrived", display name in the title.
- Demo profile: save name, header changes to "My Profile".
- Important Dates: add, sorted by date, remove.
- Settings: reset removes `lifego-` data and money records; the language choice is kept. Appearance picker switches light/dark/follow-device.
- Money Tracker: goal form validates input, deleting an entry asks first, goal progress bars expose their values to screen readers.
- Mobile: bottom navigation on every page, hamburger menu under 600 px, current page marked in the menu.
- Offline: core pages load from cache, `offline.html` is shown for uncached pages.

Automated suite (`python -m unittest discover tests -v`):
- `tests/test_ask.py`: `/ask` key/question handling and context forwarding.
- `tests/test_security.py`: static allowlist, upload and magic-byte checks, rate limits, security headers, same-origin/token access, proxy-aware limits, `/ask` validation, `/explain` success path, 404 pages, cache headers.
- `tests/test_i18n.py`: translation key parity across en/ne/vi/my, every HTML `data-i18n*` key exists, every guide-data key resolves.

Not tested automatically:
- Voice playback depends on installed device voices.
- Clipboard needs localhost or HTTPS. Try Listen and Copy on your own device before presenting.
- Contrast ratios and screen-reader announcements need a real browser + device check.
- The live Meta API call needs `META_API_KEY`; tests use mocked replies.
