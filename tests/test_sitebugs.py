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


if __name__ == "__main__":
    unittest.main()
