"""Site bug-fix tests: tracker safety, save-button i18n, theme pre-paint script.

Run from the project root:
    python -m unittest tests.test_sitebugs -v
"""
import glob
import os
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = ("en", "ne", "vi", "my")


def _read(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        return f.read()


class TrackerSafetyTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.page = _read("tracker.html")

    def test_save_uses_try_catch(self):
        self.assertIn("const save = (key, value) => {", self.page)
        self.assertIn("localStorage.setItem(key, JSON.stringify(value));", self.page)
        self.assertIn("return false;", self.page)

    def test_save_failure_shows_message(self):
        self.assertIn("tracker.saveFailed", self.page)

    def test_broken_entries_skipped_on_load(self):
        self.assertIn("function cleanEntries(list)", self.page)
        self.assertIn("cleanEntries(load(ENTRIES_KEY, []))", self.page)

    def test_broken_goals_skipped_on_load(self):
        self.assertIn("function cleanGoals(list)", self.page)
        self.assertIn("cleanGoals(load(GOALS_KEY, []))", self.page)

    def test_goal_name_uses_text_content(self):
        self.assertIn('row.querySelector(".entry-goal").textContent', self.page)
        self.assertNotIn('goal.name) : ""}</small>', self.page)

    def test_delete_goal_button_with_confirm(self):
        self.assertIn('t("tracker.deleteGoal", "Delete goal")', self.page)
        self.assertIn('confirm(t("tracker.deleteGoalConfirm"', self.page)


class TrackerKeysTest(unittest.TestCase):
    def test_new_keys_in_all_languages(self):
        src = _read("i18n.js")
        for key in ("tracker.deleteGoal", "tracker.deleteGoalConfirm",
                    "tracker.saveFailed"):
            self.assertEqual(src.count('"%s"' % key), 4, key)


class SaveButtonTest(unittest.TestCase):
    def test_save_button_has_i18n_key(self):
        page = _read("index.html")
        self.assertIn('id="save-phrase-btn" type="button" data-i18n="main.saveOff"',
                      page)


class ThemeScriptTest(unittest.TestCase):
    def test_every_page_sets_theme_in_head(self):
        pages = sorted(glob.glob(os.path.join(ROOT, "*.html")))
        self.assertGreater(len(pages), 20)
        missing = []
        for path in pages:
            with open(path, encoding="utf-8") as f:
                head = f.read().split("</head>")[0]
            if ('localStorage.getItem("lb_theme")' not in head
                    or 'setAttribute("data-theme", theme)' not in head):
                missing.append(os.path.basename(path))
        self.assertEqual(missing, [])


class HeaderProfileTest(unittest.TestCase):
    """No Demo Profile button is injected into the shared header."""

    @classmethod
    def setUpClass(cls):
        cls.src = _read("i18n.js")

    def test_no_profile_link_injected(self):
        self.assertNotIn("addProfileLink", self.src)

    def test_menu_and_bottom_nav_builders_kept(self):
        self.assertIn("addMenuButton", self.src)
        self.assertIn("addBottomNav", self.src)


class HeroContrastTest(unittest.TestCase):
    """Dark-theme hero text must read over the darkened photo."""

    @classmethod
    def setUpClass(cls):
        cls.css = _read("style.css")

    def test_dark_hero_headline_is_light(self):
        self.assertRegex(self.css,
                         r'html\[data-theme="dark"\] \.hero h1 \{\s*'
                         r'color: #ffffff;')

    def test_dark_hero_subtext_is_light(self):
        self.assertRegex(self.css,
                         r'html\[data-theme="dark"\] \.hero-desc \{\s*'
                         r'color: #c3cede;')


class TrackerContrastTest(unittest.TestCase):
    """Dark-theme tracker tiles and search card must stay readable."""

    @classmethod
    def setUpClass(cls):
        cls.css = _read("style.css")

    def test_dark_tracker_tile_text_is_light(self):
        self.assertRegex(
            self.css,
            r'html\[data-theme="dark"\] \.summary-box span \{\s*'
            r'color: #c3cede;')
        self.assertRegex(
            self.css,
            r'html\[data-theme="dark"\] \.summary-box strong \{\s*'
            r'color: #ffffff;')

    def test_dark_extra_surfaces_at_end(self):
        marker = "Dark theme: extra surfaces"
        self.assertIn(marker, self.css)
        tail = self.css.split(marker)[1]
        for selector in ('html[data-theme="dark"] h1',
                         'html[data-theme="dark"] .stage-card',
                         'html[data-theme="dark"] .japanese-helper',
                         'html[data-theme="dark"] .emergency-help',
                         'html[data-theme="dark"] .faq-section',
                         'html[data-theme="dark"] .page-lead',
                         'html[data-theme="dark"] .topic-card a',
                         'html[data-theme="dark"] .content-page'
                         ' a:not(.btn):not(.saved-back)',
                         'html[data-theme="dark"] .del-btn',
                         'html[data-theme="dark"] .progress',
                         'html[data-theme="dark"] #journey-progress-bar'
                         '::-webkit-progress-bar',
                         'html[data-theme="dark"] .skip-link'):
            self.assertIn(selector, tail)

    def test_dark_polish_at_end(self):
        marker = "Dark theme: polish pass"
        self.assertIn(marker, self.css)
        tail = self.css.split(marker)[1]
        for selector in ('html[data-theme="dark"] .footer-project p',
                         'html[data-theme="dark"] .footer-links a',
                         'html[data-theme="dark"] #saved-empty',
                         'html[data-theme="dark"] #journey-progress-bar,',
                         'html[data-theme="dark"] .bottom-nav a.bottom-nav-main',
                         'html[data-theme="dark"] .emergency-desc',
                         'html[data-theme="dark"] .journey-note'):
            self.assertIn(selector, tail)

    def test_dark_tracker_inputs_usable(self):
        self.assertRegex(
            self.css,
            r'html\[data-theme="dark"\] \.tracker-promo \.tracker-quick-form input,'
            r'\s*html\[data-theme="dark"\] \.tracker-promo \.tracker-quick-form select \{\s*'
            r'background-color: #101d3d;')

    def test_dark_search_card_has_dark_surface(self):
        self.assertIn('html[data-theme="dark"] .search-section', self.css)

    def test_dark_search_links_stay_readable(self):
        self.assertRegex(self.css,
                         r'html\[data-theme="dark"\] \.search-popular a \{\s*'
                         r'color: #9dbcff;')


class ChatScrollTest(unittest.TestCase):
    """Open chat locks page scroll; messages contain overscroll."""

    @classmethod
    def setUpClass(cls):
        cls.css = _read("style.css")
        cls.js = _read("chatbot.js")

    def test_message_area_contains_overscroll(self):
        self.assertRegex(self.css,
                         r'\.chat-msgs\s*\{[^}]*?overscroll-behavior: contain;')

    def test_open_chat_fixes_body(self):
        self.assertRegex(self.css,
                         r'html\.chat-open body \{\s*position: fixed;')

    def test_toggle_saves_and_restores_scroll(self):
        self.assertIn("document.body.style.top", self.js)
        self.assertIn("window.scrollTo", self.js)
        self.assertIn('classList.add("chat-open")', self.js)
        self.assertIn('classList.remove("chat-open")', self.js)


if __name__ == "__main__":
    unittest.main()
