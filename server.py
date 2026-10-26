"""LifeBridge Japan: AI notice explainer backend.

Run:
    pip install flask
    set META_API_KEY=your-key-here   (Windows cmd, same shell)
    python server.py

Then open http://127.0.0.1:5000/explain.html and submit a photo.

The API key is read only from the META_API_KEY environment variable.
It never belongs in frontend code.
"""

import base64
import os
import urllib.error
import urllib.request
import json

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=None)

API_KEY = os.environ.get("META_API_KEY", "")
MODEL = os.environ.get("META_MODEL", "muse-spark-1.3")
BASE_URL = os.environ.get("META_BASE_URL", "https://api.meta.ai/v1")
PORT = int(os.environ.get("PORT", "5000"))

HEADERS = [
    "What is this?",
    "Why did you get it?",
    "How important is it?",
    "What to do next",
    "Deadline",
    "Things to check",
]

LANG_NAMES = {"ne": "Nepali", "en": "English", "ja": "Japanese"}


@app.get("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:path>")
def static_files(path):
    return send_from_directory(BASE_DIR, path)


@app.post("/explain")
def explain():
    if not API_KEY:
        return jsonify({"error": "Server is missing META_API_KEY"}), 500

    photo = request.files.get("photo")
    if photo is None or photo.filename == "":
        return jsonify({"error": "No photo received"}), 400

    lang = request.form.get("language", "en")
    lang_name = LANG_NAMES.get(lang, "English")

    img_b64 = base64.b64encode(photo.read()).decode("ascii")
    mime = photo.mimetype or "image/jpeg"
    data_uri = f"data:{mime};base64,{img_b64}"

    header_list = "\n".join(f"{h}" for h in HEADERS)
    prompt = (
        "You are helping a newcomer in Japan understand an official Japanese notice "
        "shown in the photo. Explain it in simple, friendly words.\n\n"
        f"Write the content in {lang_name}.\n"
        "Use EXACTLY these section headers in English, in this order, each on its own line:\n"
        f"{header_list}\n\n"
        "Rules:\n"
        "- Under 'What to do next', give clear steps in order.\n"
        "- Under 'Deadline', write the exact date/amount from the notice if shown.\n"
        "- If any detail in the photo is unclear or unreadable, say so under "
        "'Things to check' instead of guessing. Never invent amounts, dates, or names.\n"
        "- Keep each section short. No text before the first header."
    )

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": data_uri}},
                ],
            }
        ],
    }

    req = urllib.request.Request(
        f"{BASE_URL}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:500]
        return jsonify({"error": f"Meta API error {e.code}: {detail}"}), 502
    except Exception as e:  # network, timeout, etc.
        return jsonify({"error": f"Could not reach Meta API: {e}"}), 502

    try:
        text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return jsonify({"error": "Unexpected reply from Meta API"}), 502

    return jsonify({"text": text})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
