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
import json
import os
import time
import urllib.error
import urllib.request

from flask import Flask, abort, jsonify, request, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=None)

API_KEY = os.environ.get("META_API_KEY", "")
MODEL = os.environ.get("META_MODEL", "muse-spark-1.3")
BASE_URL = os.environ.get("META_BASE_URL", "https://api.meta.ai/v1")
port = int(os.environ.get("PORT", 5000))

# Upload limits: Flask rejects bodies over this before the view runs,
# and the view double-checks the decoded photo size.
MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_MB", "8")) * 1024 * 1024
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Static files: only public site assets. Backend files (.py), config
# (.env), dependency lists and tool directories are never served.
ALLOWED_STATIC_EXTS = {
    ".html", ".css", ".js", ".webp", ".png", ".jpg", ".jpeg", ".svg", ".ico",
}
BLOCKED_FIRST_PARTS = {
    "tests", "__pycache__", ".git", ".hg", ".sl", ".eden", ".agents", ".muse",
}

# Simple per-IP rate limits (requests per minute, per endpoint).
RATE_WINDOW = 60
EXPLAIN_LIMIT = int(os.environ.get("RATE_LIMIT_EXPLAIN", "10"))
ASK_LIMIT = int(os.environ.get("RATE_LIMIT_ASK", "30"))
_rate_hits = {}


def _reset_rate_limits():
    """Clear rate-limit counters (used by tests)."""
    _rate_hits.clear()


def _rate_limited(bucket, limit):
    now = time.monotonic()
    hits = _rate_hits.setdefault(bucket, [])
    cutoff = now - RATE_WINDOW
    while hits and hits[0] <= cutoff:
        hits.pop(0)
    if len(hits) >= limit:
        return True
    hits.append(now)
    return False


def _client_bucket(endpoint):
    return (endpoint, request.remote_addr or "unknown")


HEADERS = [
    "What is this?",
    "Why did you get it?",
    "How important is it?",
    "What to do next",
    "Deadline",
    "Things to check",
]

LANG_NAMES = {"ne": "Nepali", "en": "English", "ja": "Japanese", "vi": "Vietnamese", "my": "Burmese"}


@app.get("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:path>")
def static_files(path):
    parts = (path or "").replace("\\", "/").split("/")
    if not parts or any(part in ("", ".", "..") for part in parts):
        abort(404)
    if parts[0] in BLOCKED_FIRST_PARTS or any(part.startswith(".") for part in parts):
        abort(404)
    _, dot, ext = parts[-1].rpartition(".")
    if not dot or ("." + ext.lower()) not in ALLOWED_STATIC_EXTS:
        abort(404)
    return send_from_directory(BASE_DIR, path)


@app.errorhandler(413)
def too_large(error):
    return jsonify({"error": "Photo is too large. Please use a smaller image."}), 413


@app.after_request
def security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    return response


def _too_many_requests():
    resp = jsonify({"error": "Too many requests. Please wait a minute and try again."})
    resp.status_code = 429
    resp.headers["Retry-After"] = "60"
    return resp


@app.post("/explain")
def explain():
    if _rate_limited(_client_bucket("explain"), EXPLAIN_LIMIT):
        return _too_many_requests()

    if not API_KEY:
        return jsonify({"error": "Server is missing META_API_KEY"}), 500

    photo = request.files.get("photo")
    if photo is None or photo.filename == "":
        return jsonify({"error": "No photo received"}), 400
    if (photo.mimetype or "") not in ALLOWED_IMAGE_TYPES:
        return jsonify({"error": "Please upload a photo (JPEG, PNG or WebP)."}), 400

    raw = photo.read()
    if not raw:
        return jsonify({"error": "No photo received"}), 400
    if len(raw) > MAX_UPLOAD_BYTES:
        return jsonify({"error": "Photo is too large. Please use a smaller image."}), 413

    lang = request.form.get("language", "en")
    lang_name = LANG_NAMES.get(lang, "English")

    img_b64 = base64.b64encode(raw).decode("ascii")
    mime = photo.mimetype
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


@app.post("/ask")
def ask():
    if _rate_limited(_client_bucket("ask"), ASK_LIMIT):
        return _too_many_requests()

    if not API_KEY:
        return jsonify({"error": "Server is missing META_API_KEY"}), 500

    body = request.get_json(silent=True) or {}
    question = (body.get("question") or "").strip()
    if not question:
        return jsonify({"error": "No question received"}), 400

    lang = body.get("language", "en")
    lang_name = LANG_NAMES.get(lang, "English")
    image = body.get("image") or ""
    explanation = body.get("explanation") or ""

    prompt = (
        "You are helping a newcomer in Japan with a follow-up question about "
        "an official Japanese notice. Answer briefly and simply.\n\n"
        f"Write the answer in {lang_name}.\n"
        "Use the earlier explanation below as context, and the photo of the "
        "notice if it helps.\n\n"
        f"Earlier explanation:\n{explanation}\n\n"
        "Rules:\n"
        "- Answer only about this notice. Keep it short and simple.\n"
        "- If the notice does not contain the answer, honestly say it is not "
        "written in the notice instead of guessing.\n"
        "- Never invent amounts, dates, or names."
    )

    content = [{"type": "text", "text": prompt + f"\n\nQuestion: {question}"}]
    if image:
        content.append({"type": "image_url", "image_url": {"url": image}})

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": content}],
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
        answer = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return jsonify({"error": "Unexpected reply from Meta API"}), 502

    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port)
