"""PWA manifest tests: valid JSON, installable icons exist.

Run from the project root:
    python -m unittest tests.test_manifest -v
"""
import json
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _read(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        return f.read()


class ManifestTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads(_read("site.webmanifest"))

    def test_manifest_has_name_and_icons(self):
        self.assertTrue(self.manifest.get("name"))
        self.assertTrue(self.manifest.get("icons"))

    def test_icons_exist_and_have_sizes(self):
        seen_192 = False
        seen_512 = False
        for icon in self.manifest["icons"]:
            src = icon.get("src", "")
            sizes = icon.get("sizes", "")
            self.assertTrue(src.endswith(".png"), src)
            self.assertRegex(sizes, r"^\d+x\d+$", src)
            self.assertTrue(os.path.isfile(os.path.join(ROOT, src)), src)
            width, height = sizes.split("x")
            self.assertEqual(width, height, src)
            if sizes == "192x192":
                seen_192 = True
            if sizes == "512x512":
                seen_512 = True
        self.assertTrue(seen_192, "need a 192x192 icon")
        self.assertTrue(seen_512, "need a 512x512 icon")

    def test_manifest_icons_are_precached(self):
        sw = _read("sw.js")
        for icon in self.manifest["icons"]:
            self.assertIn('"%s"' % icon["src"], sw)


if __name__ == "__main__":
    unittest.main()
