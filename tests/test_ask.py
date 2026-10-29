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


class AskHistoryTest(unittest.TestCase):
    def setUp(self):
        server.app.testing = True
        self.client = server.app.test_client()
        self._key = server.API_KEY
        server.API_KEY = "test-key"
        server._reset_rate_limits()

    def tearDown(self):
        server.API_KEY = self._key
        server._reset_rate_limits()

    def _posted_payload(self, body):
        captured = {}

        def fake_urlopen(req, timeout=120):
            captured["body"] = json.loads(req.data.decode("utf-8"))
            return _api_reply("ok")

        with mock.patch.object(server.urllib.request, "urlopen",
                               side_effect=fake_urlopen):
            res = self.client.post("/ask", json=body)
        self.assertEqual(res.status_code, 200)
        return captured["body"]

    def test_second_question_sees_first_exchange(self):
        payload = self._posted_payload({
            "question": "What if I am late?",
            "language": "en",
            "image": "",
            "has_image": False,
            "explanation": "This is a tax bill.",
            "history": [{"question": "Is this urgent?",
                         "answer": "Yes, very urgent."}],
        })
        messages = payload["messages"]
        self.assertEqual([m["role"] for m in messages],
                         ["system", "user", "assistant", "user"])
        self.assertIn("This is a tax bill.", messages[0]["content"])
        self.assertIn("Is this urgent?", messages[1]["content"])
        self.assertIn("Yes, very urgent.", messages[2]["content"])
        self.assertIn("What if I am late?", json.dumps(messages[3]))

    def test_history_capped_at_six_exchanges(self):
        hist = [{"question": "q%d" % i, "answer": "a%d" % i}
                for i in range(10)]
        payload = self._posted_payload({
            "question": "And?", "language": "en", "image": "",
            "has_image": False, "explanation": "ctx", "history": hist,
        })
        self.assertEqual(len(payload["messages"]), 1 + 6 * 2 + 1)
        sent = json.dumps(payload)
        self.assertNotIn("q0", sent)
        self.assertIn("q9", sent)

    def test_bad_history_rejected(self):
        res = self.client.post("/ask", json={"question": "x?",
                                             "history": "nope"})
        self.assertEqual(res.status_code, 400)

    def test_has_image_false_skips_photo(self):
        payload = self._posted_payload({
            "question": "And?", "language": "en",
            "image": "data:image/jpeg;base64,/9j/2Q==",
            "has_image": False, "explanation": "ctx",
            "history": [{"question": "q", "answer": "a"}],
        })
        self.assertNotIn("image_url", json.dumps(payload))

    def test_has_image_true_validates_photo(self):
        res = self.client.post("/ask", json={"question": "x?",
                                             "has_image": True,
                                             "image": "not-a-data-uri"})
        self.assertEqual(res.status_code, 400)

    def test_first_followup_keeps_legacy_shape(self):
        payload = self._posted_payload({
            "question": "Where?", "language": "ne",
            "image": "data:image/jpeg;base64,/9j/2Q==",
            "explanation": "gas bill",
        })
        self.assertEqual(len(payload["messages"]), 1)
        self.assertEqual(payload["messages"][0]["role"], "user")
        content = payload["messages"][0]["content"]
        self.assertEqual(len(content), 2)
        self.assertIn("Nepali", content[0]["text"])


if __name__ == "__main__":
    unittest.main()
