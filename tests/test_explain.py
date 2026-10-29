"""Lens /explain tests: the model is asked for JSON with fixed keys.

Run from the project root:
    python -m unittest tests.test_explain -v
"""
import io
import json
import os
import unittest
from unittest import mock

import server

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JSON_KEYS = ("what", "why", "importance", "next_steps", "deadline", "check")


def _image_file(name="notice.jpg", size=1024):
    body = b"\xff\xd8\xff" + b"x" * max(0, size - 3)  # real JPEG magic bytes
    return (io.BytesIO(body), name, "image/jpeg")


def _api_reply(text):
    body = json.dumps({"choices": [{"message": {"content": text}}]}).encode("utf-8")
    resp = mock.MagicMock()
    resp.read.return_value = body
    ctx = mock.MagicMock()
    ctx.__enter__.return_value = resp
    ctx.__exit__.return_value = False
    return ctx


class ExplainPromptTest(unittest.TestCase):
    def setUp(self):
        server.app.testing = True
        self.client = server.app.test_client()
        self._key = server.API_KEY
        server.API_KEY = "test-key"
        server._reset_rate_limits()

    def tearDown(self):
        server.API_KEY = self._key
        server._reset_rate_limits()

    def _posted_prompt(self, language):
        """POST a photo and return the text prompt sent to the model."""
        seen = {}

        def fake_urlopen(req, timeout=120):
            seen["payload"] = json.loads(req.data.decode("utf-8"))
            return _api_reply("{}")

        with mock.patch.object(server.urllib.request, "urlopen",
                               side_effect=fake_urlopen):
            data = {"photo": _image_file(), "language": language}
            res = self.client.post("/explain", data=data,
                                   content_type="multipart/form-data")
        self.assertEqual(res.status_code, 200)
        return seen["payload"]["messages"][0]["content"][0]["text"]

    def test_prompt_requests_json_keys(self):
        prompt = self._posted_prompt("en")
        self.assertIn("JSON", prompt)
        for key in JSON_KEYS:
            self.assertIn('"%s"' % key, prompt)

    def test_prompt_uses_user_language(self):
        prompt = self._posted_prompt("ne")
        self.assertIn("Nepali", prompt)

    def test_prompt_keeps_no_guessing_rule(self):
        prompt = self._posted_prompt("en")
        self.assertIn("Never invent amounts, dates, or names.", prompt)

    def test_explain_returns_model_text_unchanged(self):
        reply = json.dumps({key: "line %s" % key for key in JSON_KEYS})
        with mock.patch.object(server.urllib.request, "urlopen",
                               side_effect=lambda req, timeout=120: _api_reply(reply)):
            data = {"photo": _image_file(), "language": "en"}
            res = self.client.post("/explain", data=data,
                                   content_type="multipart/form-data")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), {"text": reply})


class ExplainPageScriptTest(unittest.TestCase):
    """explain.html must keep the browser-side Lens fixes."""

    @classmethod
    def setUpClass(cls):
        with open(os.path.join(ROOT, "explain.html"), encoding="utf-8") as f:
            cls.page = f.read()

    def test_array_values_become_numbered_lines(self):
        self.assertIn('". " + cleanText(value[i])', self.page)

    def test_json_retry_uses_first_and_last_brace(self):
        self.assertIn('fenced.indexOf("{")', self.page)
        self.assertIn('fenced.lastIndexOf("}")', self.page)

    def test_shrink_fills_white_background(self):
        self.assertIn('fillStyle = "#ffffff"', self.page)
        self.assertIn("fillRect(0, 0, canvas.width, canvas.height)", self.page)

    def test_ai_fetches_use_timeout(self):
        self.assertIn("AI_TIMEOUT_MS = 45000", self.page)
        self.assertIn("new AbortController()", self.page)
        self.assertIn('fetchWithTimeout("/explain"', self.page)
        self.assertIn('fetchWithTimeout("/ask"', self.page)
        self.assertIn("AbortError", self.page)
        self.assertIn('"explain.tooSlow"', self.page)

    def test_api_replies_checked_before_json(self):
        self.assertIn("application/json", self.page)
        self.assertIn("lbServerError", self.page)
        self.assertIn('"explain.serverError"', self.page)
        self.assertEqual(self.page.count("readApiJson(res)"), 2)
        # Exactly one res.json() call site, inside the guarded helper.
        self.assertEqual(self.page.count("res.json()"), 1)

    def test_photo_always_reencoded(self):
        self.assertIn("Math.min(1, 1600 / longest)", self.page)
        self.assertNotIn("longest <= 1600", self.page)

    def test_same_photo_sent_to_explain_and_ask(self):
        self.assertIn("await shrinkPhoto(photoInput.files[0])", self.page)
        self.assertIn('"data:" + lastPhotoMime + ";base64," + lastPhotoB64',
                       self.page)


if __name__ == "__main__":
    unittest.main()
