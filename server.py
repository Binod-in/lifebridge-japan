"""LifeBridge Japan: AI notice explainer backend.

Run:
    pip install flask
    set META_API_KEY=your-key-here   (Windows, same shell)
    python server.py                 (once a Python is installed)

Then open http://127.0.0.1:5000/explain.html and submit a photo.

The API key is read only from the META_API_KEY environment variable.
It never belongs in frontend code.
"""

import base64
import json
import os
import urllib.error
import urllib.request

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# OpenAI-compatible chat completions endpoint of the Meta Model API.
# Overridable with META_BASE_URL for local testing or endpoint moves.
DEFAULT_BASE_URL = "https://api.llama.com/compat/v1/chat/completions"
MODEL_NAME = os.environ.get("META_MODEL", "muse-spark")

LANGUAGE_NAMES = {
    "ne": "Nepali",
    "en": "English",
    "ja": "Japanese",
    "nepali": "Nepali",
    "english": "English",
    "japanese": "Japanese",
    "日本語": "Japanese",
    "नेपाली": "Nepali",
}

SECTIONS = [
    "What is this?",
    "Why did you get it?",
    "How important is it?",
    "What to do next",
    "Deadline",
    "Things to check",
]

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB per photo


def build_prompt(language_name):
    section_list = "\n".join("- %s" % s for s in SECTIONS)
    return (
        "You read a photo of an official Japanese notice (city hall letter, "
        "tax notice, school letter, or utility bill).\n"
        "Explain it in %s, in simple everyday words.\n"
        "Reply with exactly these sections, in this order:\n"
        "%s\n"
        "Rules: use simple words and short sentences. "
        "When any date, amount, name, or other detail in the photo is "
        "unclear or unreadable, say so under 'Things to check' instead of "
        "guessing. Never invent a deadline, amount, or office name."
        % (language_name, section_list)
    )


def call_meta_model(image_bytes, mime_type, language_name, api_key, base_url):
    image_b64 = base64.b64encode(image_bytes).decode("ascii")
    data_url = "data:%s;base64,%s" % (mime_type, image_b64)

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": build_prompt(language_name)},
                    {
                        "type": "image_url",
                        "image_url": {"url": data_url},
                    },
                ],
            }
        ],
        "max_tokens": 1200,
        "temperature": 0.2,
    }

    req = urllib.request.Request(
        base_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer " + api_key,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        try:
            detail = exc.read().decode("utf-8")[:500]
        except Exception:
            detail = "HTTP %s" % exc.code
        raise RuntimeError("Model API error: %s" % detail)
    except urllib.error.URLError as exc:
        raise RuntimeError("Could not reach the model API: %s" % exc.reason)

    try:
        return body["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise RuntimeError("Unexpected model API response shape.")


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.post("/explain")
def explain():
    api_key = os.environ.get("META_API_KEY", "").strip()
    if not api_key:
        return jsonify({"error": "Server is missing META_API_KEY."}), 500

    language_raw = (request.form.get("language", "en") or "en").strip().lower()
    language_name = LANGUAGE_NAMES.get(language_raw, "English")

    file = request.files.get("image")
    if file is None or not file.filename:
        return jsonify({"error": "No image uploaded."}), 400
    if file.content_type and not file.content_type.startswith("image/"):
        return jsonify({"error": "Please upload an image file."}), 400

    image_bytes = file.read()
    if not image_bytes:
        return jsonify({"error": "The uploaded file is empty."}), 400

    mime_type = file.content_type or "image/jpeg"
    base_url = os.environ.get("META_BASE_URL", DEFAULT_BASE_URL).strip() or DEFAULT_BASE_URL

    try:
        explanation = call_meta_model(image_bytes, mime_type, language_name, api_key, base_url)
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 502

    return jsonify({"explanation": explanation, "language": language_name})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="127.0.0.1", port=port)
