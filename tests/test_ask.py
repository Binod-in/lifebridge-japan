"""Focused tests for the POST /ask follow-up endpoint in server.py.

Run from the project root (Flask must be installed):
    python -m unittest tests.test_ask -v
or:
    python tests/test_ask.py
"""
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


class AskEndpointTest(unittest.TestCase):
    def setUp(self):
        server.app.testing = True
        self.client = server.app.test_client()
        self._key = server.API_KEY
        server.API_KEY = "test-key"
        server._reset_rate_limits()

    def tearDown(self):
        server.API_KEY = self._key
        server._reset_rate_limits()

    def test_missing_key_returns_500(self):
        server.API_KEY = ""
        res = self.client.post("/ask", json={"question": "Hello?", "language": "en"})
        self.assertEqual(res.status_code, 500)

    def test_missing_question_returns_400(self):
        res = self.client.post("/ask", json={"question": "   ", "language": "en"})
        self.assertEqual(res.status_code, 400)
        res = self.client.post("/ask", json={"language": "en"})
        self.assertEqual(res.status_code, 400)

    def test_answer_returned_with_context_forwarded(self):
        captured = {}

        def fake_urlopen(req, timeout=120):
            captured["body"] = json.loads(req.data.decode("utf-8"))
            return _api_reply("Pay at a convenience store.")

        with mock.patch.object(server.urllib.request, "urlopen", side_effect=fake_urlopen):
            res = self.client.post("/ask", json={
                "question": "Where do I pay?",
                "language": "ne",
                "image": "data:image/jpeg;base64,/9j/2Q==",
                "explanation": "This is a gas bill.",
            })

        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), {"answer": "Pay at a convenience store."})
        sent = json.dumps(captured["body"])
        self.assertIn("Where do I pay?", sent)
        self.assertIn("This is a gas bill.", sent)
        self.assertIn("data:image/jpeg;base64,/9j/2Q==", sent)
        self.assertIn("Nepali", sent)
        self.assertIn("not written in the notice", sent)


if __name__ == "__main__":
    unittest.main()
