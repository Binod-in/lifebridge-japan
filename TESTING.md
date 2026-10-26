# Validation (October 2026)

Tested in a real Chromium browser (Playwright), all 18 pages, at 1440, 1000, 600 and 390 px wide:
- No JavaScript errors on any page.
- No horizontal scrolling at any width.
- Every local link, image and `#anchor` target exists.
- No emoji icons and no em dashes in any HTML or JS file.

Feature checks (all passed):
- Checklist: tick, progress updates, ticks shared between Home and Start Here, kept after reload.
- Phrase card: category switch, Save and Unsave, saved phrase shows reading, English and Nepali on Saved Phrases, Remove.
- Search: `move house`, `find a job`, `bank`, `銀行`, `बैंक`, no-match text, HTML-like input shown as plain text.
- Guides: bookmark on Guides and topic pages, Saved Guides list, removing the last one shows the empty message.
- Start Here: plan per situation, unknown situation falls back to "Just arrived", display name in the title.
- Demo profile: save name, header changes to "My Profile".
- Important Dates: add, sorted by date, remove.
- Settings: reset removes only `lifego-` data.

Not tested automatically:
- Voice playback depends on installed device voices.
- Clipboard needs localhost or HTTPS. Try Listen and Copy on your own device before presenting.
