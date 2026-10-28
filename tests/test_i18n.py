"""i18n coverage tests: key parity, HTML key usage, guide-data keys.

Run from the project root (no Flask needed):
    python -m unittest tests.test_i18n -v
"""
import glob
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = ("en", "ne", "vi", "my")


def _read(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        return f.read()


def _lang_key_list(src, lang):
    match = re.search(
        r"\n        " + lang + r": \{(.*?)(?:\n        (?:en|ne|vi|my): \{|\n    \};)",
        src,
        re.S,
    )
    if not match:
        raise AssertionError("language block not found: " + lang)
    return re.findall(r'^            "([^"]+)":', match.group(1), re.M)


class KeyParityTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        src = _read("i18n.js")
        cls.lists = {lang: _lang_key_list(src, lang) for lang in LANGS}
        cls.keys = {lang: set(items) for lang, items in cls.lists.items()}

    def test_no_duplicate_keys(self):
        for lang in LANGS:
            items = self.lists[lang]
            dupes = sorted({k for k in items if items.count(k) > 1})
            self.assertEqual(dupes, [], lang + " has duplicate keys")

    def test_all_languages_match_english(self):
        for lang in ("ne", "vi", "my"):
            missing = sorted(self.keys["en"] - self.keys[lang])
            extra = sorted(self.keys[lang] - self.keys["en"])
            self.assertEqual(missing, [], lang + " missing keys")
            self.assertEqual(extra, [], lang + " unknown keys")

    def test_formerly_missing_keys_present(self):
        required = ["guide.stepsTitle", "guide.bringTitle", "guide.linksTitle"]
        for prefix in ("doc", "jobs"):
            required += ["%s.step%d" % (prefix, i) for i in range(1, 6)]
            required += ["%s.bring%d" % (prefix, i) for i in range(1, 5)]
            required += ["%s.link%d" % (prefix, i) for i in range(1, 3)]
            required.append("%s.source" % prefix)
        self.assertEqual(len(required), 27)
        for lang in LANGS:
            for key in required:
                self.assertIn(key, self.keys[lang], lang)


class KeyUsageTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.en_keys = set(_lang_key_list(_read("i18n.js"), "en"))

    def test_html_keys_exist(self):
        pattern = re.compile(r'data-i18n(?:-html|-placeholder|-aria-label|-alt)?="([^"]+)"')
        unknown = {}
        for path in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
            with open(path, encoding="utf-8") as f:
                for key in pattern.findall(f.read()):
                    if key not in self.en_keys:
                        unknown.setdefault(os.path.basename(path), []).append(key)
        self.assertEqual(unknown, {})

    def test_guide_data_keys_exist(self):
        src = _read("guide-data.js")
        for key in re.findall(r'(?:titleKey|descKey): "([^"]+)"', src):
            self.assertIn(key, self.en_keys, "guide-data.js uses " + key)


if __name__ == "__main__":
    unittest.main()
