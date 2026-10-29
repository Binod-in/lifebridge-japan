"""Journey-by-guide tests: start links, guide task lists, task keys.

Run from the project root (no Flask needed):
    python -m unittest tests.test_journey -v
"""
import glob
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = ("en", "ne", "vi", "my")
GUIDES = ("housing", "jobs", "documents", "money",
          "transport", "health", "japanese", "emergency")


def _read(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        return f.read()


def _guide_ids():
    return re.findall(r'id: "([a-z]+)"', _read("guide-data.js"))


def _task_lists(src):
    """Map each `const <name>JourneyTasks` array to its [(id, text)] items."""
    found = {}
    for match in re.finditer(r"const (\w+)JourneyTasks = \[(.*?)\];", src, re.S):
        items = re.findall(r'\{ id: "([^"]+)", text: "([^"]*)" \}',
                           match.group(2))
        found[match.group(1)] = items
    return found


class GuideStartLinkTest(unittest.TestCase):
    def test_guide_ids_match_expected(self):
        self.assertEqual(_guide_ids(), list(GUIDES))

    def test_each_guide_page_links_to_own_plan(self):
        for guide in GUIDES:
            html = _read(guide + ".html")
            self.assertIn("start.html?guide=" + guide, html, guide)


class GuideTaskListTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.lists = _task_lists(_read("main.js"))
        cls.i18n = _read("i18n.js")

    def test_every_guide_has_task_list(self):
        for guide in GUIDES:
            self.assertIn(guide, self.lists, guide)
            self.assertGreaterEqual(len(self.lists[guide]), 5, guide)

    def test_task_ids_unique(self):
        ids = [task_id for items in self.lists.values()
               for task_id, _ in items]
        dupes = sorted({i for i in ids if ids.count(i) > 1})
        self.assertEqual(dupes, [])

    def test_task_text_present(self):
        for name, items in self.lists.items():
            for task_id, text in items:
                self.assertTrue(text.strip(), name + "/" + task_id)

    def test_guide_task_keys_in_all_languages(self):
        for guide in GUIDES:
            for task_id, _ in self.lists[guide]:
                key = '"journey.task.%s":' % task_id
                self.assertEqual(self.i18n.count(key), len(LANGS), key)


class HomeTrackerPromoTest(unittest.TestCase):
    def test_home_shows_tracker_promo_not_journey(self):
        html = _read("index.html")
        self.assertNotIn('id="journey-list"', html)
        self.assertIn('href="tracker.html"', html)

    def test_home_summary_boxes_present(self):
        html = _read("index.html")
        for box in ("home-sum-income", "home-sum-expense",
                    "home-sum-saving", "home-sum-left"):
            self.assertIn('id="%s"' % box, html)
        for key in ("tracker.earned", "tracker.spent",
                    "tracker.saved", "tracker.left"):
            self.assertIn('data-i18n="%s"' % key, html)
        self.assertIn("lb_money_entries", html)

    def test_no_header_start_link(self):
        for path in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
            with open(path, encoding="utf-8") as f:
                html = f.read()
            nav = re.search(r'<nav[^>]*class="main-nav"[^>]*>(.*?)</nav>',
                            html, re.S)
            if nav:
                self.assertNotIn("start.html", nav.group(1),
                                 os.path.basename(path))

    def test_guide_keywords_cover_vietnamese_and_burmese(self):
        src = _read("guide-data.js")
        for word in ["ngân hàng", "ဘဏ်", "việc làm", "အလုပ်",
                     "bệnh viện", "ဆေးရုံ", "thuế", "အခွန်",
                     "thị thực", "ဗီဇာ", "rác", "အမှိုက်"]:
            self.assertIn(word, src)

    def test_garbage_keywords_live_on_housing(self):
        src = _read("guide-data.js")
        housing = src.split('id: "jobs"')[0]
        documents = src.split('id: "documents"')[1].split('id: "money"')[0]
        for word in ["garbage", "gomi", "ごみ", "फोहोर", "rác", "rac", "အမှိုက်"]:
            self.assertIn(word, housing)
            self.assertNotIn(word, documents)

    def test_search_lead_mentions_all_languages(self):
        src = _read("i18n.js")
        self.assertIn('"search.lead": "Search topics in English, Japanese, '
                      'Nepali, Vietnamese or Burmese."', src)

    def test_home_save_failure_shows_message(self):
        html = _read("index.html")
        self.assertIn('catch (e2) { document.getElementById("home-form-status")'
                      '.textContent = t("tracker.saveFailed"', html)

    def test_home_quick_add_form_present(self):
        html = _read("index.html")
        for element_id in ("home-entry-form", "home-type", "home-amount",
                           "home-note", "home-goal-pick", "home-goal-select",
                           "home-form-status"):
            self.assertIn('id="%s"' % element_id, html)
        for key in ("tracker.addEntry", "tracker.type", "tracker.amount",
                    "tracker.noteLabel", "tracker.savingFor",
                    "tracker.addEntryBtn"):
            self.assertIn('data-i18n="%s"' % key, html)

    def test_home_goal_recent_and_art_present(self):
        html = _read("index.html")
        for element_id in ("home-goal-row", "home-goal-name",
                           "home-goal-text", "home-goal-bar", "home-goal-fill",
                           "home-recent-list"):
            self.assertIn('id="%s"' % element_id, html)
        self.assertIn('data-i18n="idx.trackerRecent"', html)
        self.assertIn('src="images/money.webp"', html)
        self.assertTrue(os.path.isfile(os.path.join(ROOT, "images",
                                                    "money.webp")))

    def test_home_tracker_keys_all_languages(self):
        src = _read("i18n.js")
        for key in ("idx.trackerTitle", "idx.trackerDesc",
                    "idx.trackerRecent", "idx.trackerEmpty"):
            self.assertEqual(src.count('"%s":' % key), len(LANGS), key)


if __name__ == "__main__":
    unittest.main()
