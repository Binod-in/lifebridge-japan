"""LifeBridge Japan: LifeBridge Lens backend.

Run (development):
    pip install -r requirements.txt
    set META_API_KEY=your-key-here   (Windows cmd, same shell)
    python server.py

Then open http://127.0.0.1:5000/explain.html and submit a photo.

Run (production): serve behind waitress or gunicorn, e.g.
    waitress-serve --listen=127.0.0.1:5000 server:app

The API key is read only from the META_API_KEY environment variable.
It never belongs in frontend code.

Optional hardening (see .env.example): LB_API_TOKEN requires browsers to
send an X-LB-Token header; TRUST_PROXY=1 honours X-Forwarded-For for rate
limits behind a proxy you control. Cross-site API calls are rejected, and
per-IP rate limits apply. Direct (non-browser) abuse still needs real user
accounts, which this school demo does not have yet.
"""

import base64
import json
import os
import re
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request

from flask import Flask, abort, jsonify, request, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=None)

API_KEY = os.environ.get("META_API_KEY", "")
MODEL = os.environ.get("META_MODEL", "muse-spark-1.3")
BASE_URL = os.environ.get("META_BASE_URL", "https://api.meta.ai/v1")
port = int(os.environ.get("PORT", 5000))

# Optional shared token for the AI endpoints. When LB_API_TOKEN is set,
# browsers must send it as an X-LB-Token header (see explain.html).
API_TOKEN = os.environ.get("LB_API_TOKEN", "")
# Set TRUST_PROXY=1 only when a proxy you control strips X-Forwarded-For.
TRUST_PROXY = os.environ.get("TRUST_PROXY", "") == "1"

# Follow-up (/ask) input caps.
MAX_QUESTION_CHARS = int(os.environ.get("MAX_QUESTION_CHARS", "2000"))
MAX_EXPLANATION_CHARS = int(os.environ.get("MAX_EXPLANATION_CHARS", "8000"))
MAX_ASK_IMAGE_BYTES = int(os.environ.get("MAX_ASK_IMAGE_MB", "8")) * 1024 * 1024
ASK_IMAGE_RE = re.compile(r"^data:(image/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$")

# Upload limits: Flask rejects bodies over this before the view runs,
# and the view double-checks the decoded photo size.
MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_MB", "8")) * 1024 * 1024
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Static files: only public site assets. Backend files (.py), config
# (.env), dependency lists and tool directories are never served.
ALLOWED_STATIC_EXTS = {
    ".html", ".css", ".js", ".webp", ".png", ".jpg", ".jpeg", ".svg", ".ico",
    ".webmanifest",
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


def _client_ip():
    if TRUST_PROXY:
        first = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        if first:
            return first
    return request.remote_addr or "unknown"


def _client_bucket(endpoint):
    return (endpoint, _client_ip())


def _check_access():
    """Same-origin + optional shared token for the AI endpoints.

    Returns a Flask response when the request must be rejected, else None.
    """
    if API_TOKEN and not secrets.compare_digest(
        request.headers.get("X-LB-Token", ""), API_TOKEN
    ):
        return jsonify({"error": "Not authorized."}), 401
    origin = request.headers.get("Origin") or request.headers.get("Referer", "")
    if origin:
        try:
            origin_host = (urllib.parse.urlparse(origin).hostname or "").lower()
        except Exception:
            origin_host = ""
        if origin_host != request.host.split(":")[0].lower():
            return jsonify({"error": "Cross-site requests are not allowed."}), 403
    return None


def _image_kind(raw):
    """Detect a real photo by magic bytes. Returns the MIME type or ""."""
    if len(raw) >= 3 and raw[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if len(raw) >= 8 and raw[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if len(raw) >= 12 and raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
        return "image/webp"
    return ""


def _call_meta_api(payload):
    """POST to the Meta chat API. Returns (ok, data_or_public_error)."""
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
            return True, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            detail = e.read().decode("utf-8", "replace")[:500]
        except Exception:
            detail = ""
        app.logger.warning("Meta API HTTP error %s: %s", e.code, detail)
        return False, "The AI service had a problem. Please try again."
    except Exception as e:  # network, timeout, etc.
        app.logger.warning("Meta API request failed: %s", e)
        return False, "Could not reach the AI service. Please try again."


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
    return static_files("index.html")


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
    resp = send_from_directory(BASE_DIR, path)
    if ("." + ext.lower()) == ".html":
        resp.cache_control.no_cache = True
    else:
        resp.cache_control.public = True
        resp.cache_control.max_age = 86400
    return resp


@app.errorhandler(413)
def too_large(error):
    return jsonify({"error": "Photo is too large. Please use a smaller image."}), 413


@app.after_request
def security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data: blob:; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "script-src 'self' 'unsafe-inline'; connect-src 'self'; "
        "object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    )
    response.headers.setdefault("Strict-Transport-Security", "max-age=31536000")
    response.headers.setdefault(
        "Permissions-Policy", "camera=(self), microphone=(), geolocation=()"
    )
    return response


@app.errorhandler(404)
def not_found(error):
    if request.path.startswith(("/explain", "/ask")):
        return jsonify({"error": "Not found."}), 404
    return (
        "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">"
        "<title>Not found | LifeBridge Japan</title></head>"
        "<body><h1>Page not found</h1>"
        "<p><a href=\"/index.html\">Back to LifeBridge Japan home</a></p>"
        "</body></html>"
    ), 404


def _too_many_requests():
    resp = jsonify({"error": "Too many requests. Please wait a minute and try again."})
    resp.status_code = 429
    resp.headers["Retry-After"] = "60"
    return resp


@app.post("/explain")
def explain():
    denied = _check_access()
    if denied is not None:
        return denied
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
    kind = _image_kind(raw)
    if not kind:
        return jsonify({"error": "That file is not a real photo. Please upload a JPEG, PNG or WebP image."}), 400

    lang = request.form.get("language", "en")
    lang_name = LANG_NAMES.get(lang, "English")

    img_b64 = base64.b64encode(raw).decode("ascii")
    data_uri = f"data:{kind};base64,{img_b64}"

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

    ok, data = _call_meta_api(payload)
    if not ok:
        return jsonify({"error": data}), 502

    try:
        text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return jsonify({"error": "Unexpected reply from Meta API"}), 502

    return jsonify({"text": text})


@app.post("/ask")
def ask():
    denied = _check_access()
    if denied is not None:
        return denied
    if _rate_limited(_client_bucket("ask"), ASK_LIMIT):
        return _too_many_requests()

    if not API_KEY:
        return jsonify({"error": "Server is missing META_API_KEY"}), 500

    body = request.get_json(silent=True) or {}
    question = (body.get("question") or "").strip()
    if not question:
        return jsonify({"error": "No question received"}), 400
    if len(question) > MAX_QUESTION_CHARS:
        return jsonify({"error": "That question is too long. Please keep it short."}), 400

    lang = body.get("language", "en")
    lang_name = LANG_NAMES.get(lang, "English")
    image = body.get("image") or ""
    explanation = body.get("explanation") or ""
    if len(explanation) > MAX_EXPLANATION_CHARS:
        return jsonify({"error": "That explanation is too long. Please start a new explanation."}), 400
    if image:
        match = ASK_IMAGE_RE.match(image.strip())
        if not match:
            return jsonify({"error": "That photo format is not supported."}), 400
        try:
            image_raw = base64.b64decode(match.group(2), validate=True)
        except Exception:
            return jsonify({"error": "That photo could not be read."}), 400
        if len(image_raw) > MAX_ASK_IMAGE_BYTES or not _image_kind(image_raw):
            return jsonify({"error": "That photo could not be read."}), 400
        image = f"data:{match.group(1)};base64,{base64.b64encode(image_raw).decode('ascii')}"

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

    ok, data = _call_meta_api(payload)
    if not ok:
        return jsonify({"error": data}), 502

    try:
        answer = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return jsonify({"error": "Unexpected reply from Meta API"}), 502

    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port)
