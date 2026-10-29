"""Service worker tests: offline page matching ignores the query string.

Run from the project root:
    python -m unittest tests.test_sw -v
"""
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _read(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        return f.read()


class ServiceWorkerFetchTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sw = _read("sw.js")

    def test_cache_version_bumped(self):
        match = re.search(r'^const CACHE = "lifebridge-v(\d+)";', self.sw, re.M)
        self.assertTrue(match, "CACHE version not found in sw.js")
        self.assertGreaterEqual(int(match.group(1)), 7)

    def test_html_fallback_ignores_query_string(self):
        # Links like start.html?situation=student must match the cached
        # start.html when offline. Only the page lookup ignores the query;
        # versioned assets (style.css?v=2) must still miss the cache.
        self.assertIn("caches.match(req, { ignoreSearch: true })", self.sw)
        self.assertEqual(self.sw.count("ignoreSearch"), 1)

    def test_html_fallback_tries_exact_first(self):
        first = self.sw.index("caches.match(req)")
        second = self.sw.index("caches.match(req, { ignoreSearch: true })")
        self.assertLess(first, second)

    def test_offline_fallback_page_kept(self):
        self.assertIn('caches.match("offline.html")', self.sw)

    def test_lb_config_bypasses_cache(self):
        self.assertIn('"/lb-config.js"', self.sw)


if __name__ == "__main__":
    unittest.main()
