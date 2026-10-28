"""Security regression tests: static allowlist, upload checks, rate limits.

Run from the project root (Flask must be installed):
    python -m unittest tests.test_security -v
"""
import io
import json
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import server


def _api_reply(text):
    body = json.dumps({"choices": [{"message": {"content": text}}]}).encode("utf-8")
    resp = mock.MagicMock()
    resp.read.return_value = body
    ctx = mock.MagicMock()
    ctx.__enter__.return_value = resp
    ctx.__exit__.return_value = False
    return ctx


def _image_file(name="notice.jpg", size=1024):
    return (io.BytesIO(b"x" * size), name, "image/jpeg")


class StaticAllowlistTest(unittest.TestCase):
    def setUp(self):
        server.app.testing = True
        self.client = server.app.test_client()

    def test_public_files_allowed(self):
        for path in ["/", "/index.html", "/style.css", "/app.js"]:
            res = self.client.get(path)
            try:
                self.assertEqual(res.status_code, 200, path)
            finally:
                res.close()

    def test_backend_files_blocked(self):
        for path in ["/server.py", "/requirements.txt", "/.env.example",
                     "/tests/test_ask.py", "/.gitignore"]:
            res = self.client.get(path)
            self.assertEqual(res.status_code, 404, path)


class UploadValidationTest(unittest.TestCase):
    def setUp(self):
        server.app.testing = True
        self.client = server.app.test_client()
        self._key = server.API_KEY
        server.API_KEY = "test-key"
        server._reset_rate_limits()

    def tearDown(self):
        server.API_KEY = self._key
        server._reset_rate_limits()

    def test_non_image_rejected(self):
        with mock.patch.object(server.urllib.request, "urlopen",
                               side_effect=lambda req, timeout=120: _api_reply("ok")):
            data = {"photo": (io.BytesIO(b"not an image"), "note.txt", "text/plain"),
                    "language": "en"}
            res = self.client.post("/explain", data=data,
                                   content_type="multipart/form-data")
        self.assertEqual(res.status_code, 400)

    def test_oversize_rejected(self):
        old = server.MAX_UPLOAD_BYTES
        server.MAX_UPLOAD_BYTES = 100
        try:
            with mock.patch.object(server.urllib.request, "urlopen",
                                   side_effect=lambda req, timeout=120: _api_reply("ok")):
                data = {"photo": _image_file(size=200), "language": "en"}
                res = self.client.post("/explain", data=data,
                                       content_type="multipart/form-data")
        finally:
            server.MAX_UPLOAD_BYTES = old
        self.assertEqual(res.status_code, 413)


class RateLimitTest(unittest.TestCase):
    def setUp(self):
        server.app.testing = True
        self.client = server.app.test_client()
        self._key = server.API_KEY
        server.API_KEY = "test-key"
        self._explain = server.EXPLAIN_LIMIT
        self._ask = server.ASK_LIMIT
        server._reset_rate_limits()

    def tearDown(self):
        server.API_KEY = self._key
        server.EXPLAIN_LIMIT = self._explain
        server.ASK_LIMIT = self._ask
        server._reset_rate_limits()

    def test_explain_rate_limited(self):
        server.EXPLAIN_LIMIT = 2
        with mock.patch.object(server.urllib.request, "urlopen",
                               side_effect=lambda req, timeout=120: _api_reply("What is this?\nA bill.")):
            for _ in range(2):
                data = {"photo": _image_file(), "language": "en"}
                res = self.client.post("/explain", data=data,
                                       content_type="multipart/form-data")
                self.assertEqual(res.status_code, 200)
            data = {"photo": _image_file(), "language": "en"}
            res = self.client.post("/explain", data=data,
                                   content_type="multipart/form-data")
            self.assertEqual(res.status_code, 429)

    def test_ask_rate_limited(self):
        server.ASK_LIMIT = 2
        with mock.patch.object(server.urllib.request, "urlopen",
                               side_effect=lambda req, timeout=120: _api_reply("Pay at a store.")):
            for _ in range(2):
                res = self.client.post("/ask", json={"question": "Where?", "language": "en"})
                self.assertEqual(res.status_code, 200)
            res = self.client.post("/ask", json={"question": "Where?", "language": "en"})
            self.assertEqual(res.status_code, 429)


if __name__ == "__main__":
    unittest.main()
