# LifeBridge Japan 🌉

**An AI assistant that helps newcomers in Japan understand official Japanese notices — in their own language.**

Moving to Japan is exciting, but everyday life comes with a stack of Japanese paperwork: city hall letters, tax notices, school letters, utility bills. For a newcomer, one missed deadline in a letter you cannot read can mean a late fee, a lost service, or a stressful trip to the ward office. LifeBridge Japan turns that scary letter into simple, clear guidance.

## What it does

1. **Upload a photo** of any Japanese notice.
2. **Get a simple explanation** in your own language — what the notice is, in plain words. The site UI supports **Nepali, English, Vietnamese and Burmese**; Lens can also answer in **Japanese**.
3. **See your next steps** — exactly what to do, where to go, and what to bring.
4. **Never miss a deadline** — payment and submission dates are pulled out and highlighted.
5. **No guessing** — if a date, amount, or detail in the photo is unclear, the app asks you to confirm it instead of inventing an answer.

## Focus of this prototype

The prototype focuses on the most common notices newcomers receive:

- 🏛️ City hall (市役所) letters
- 🧾 Tax notices (税金)
- 🏫 School letters (学校)
- 💡 Utility bills — water, electricity, gas (水道・電気・ガス)

## Features

- 🔍 Lens: photograph a Japanese notice and get a plain-language explanation
- 💬 Follow-up chat: ask questions about the same notice, with memory of earlier questions
- 📅 Save deadline: check the due date and add it to Important Dates in one tap
- 📴 Offline guides + offline chatbot: saved guides and keyword answers work without internet
- 💰 Money tracker: income, spending and savings goals, stored in your browser
- 🌐 4-language UI: English, Nepali, Vietnamese and Burmese
- 🌙 Dark mode

## How it works

- **Frontend:** a simple, mobile-friendly web page (HTML, CSS, JavaScript)
- **Backend:** a small Python server
- **AI:** Meta models via the **Meta Model API** read the notice photo, understand the Japanese text, and explain it in the user's language with steps and deadlines

## How LifeBridge uses Meta AI

- The **muse-spark-1.3** vision model reads the notice photo and its Japanese text.
- The model must reply in strict JSON with 7 fields (`what`, `why`, `importance`, `next_steps`, `deadline`, `check`, `deadline_date`) — the due date always comes back as `YYYY-MM-DD`.
- Follow-up chat sends the photo again with the explanation and the earlier questions, so every question stays about the same notice.
- The prompt forbids guessing: unclear amounts and dates come back empty with a note to check, never invented.
- Answers come in 5 languages: English, Nepali, Vietnamese, Burmese and Japanese.

## Run locally

```bat
pip install -r requirements.txt
set META_API_KEY=your-key-here
python server.py
```

Then open http://127.0.0.1:5000/ — the AI features need `META_API_KEY`, everything
else (guides, phrases, tracker, settings) works without it. See
[.env.example](.env.example) for optional settings (`LB_API_TOKEN`,
`TRUST_PROXY`, rate limits). For production, serve with waitress or gunicorn
instead of the Flask dev server (see `server.py`).

Note: `LB_API_TOKEN` only blocks casual scripts, it is NOT a secret.
The browser needs it to call the AI endpoints, so anyone can read it.

Run the test suite:

```bat
python -m unittest discover tests -v
```

## Why it matters

Japan's foreign-resident community keeps growing, and language is still the biggest daily barrier. LifeBridge Japan is built from lived experience: its creator is an international student in Tokyo who has stood in front of the same unreadable letters. The goal is simple — help every newcomer handle Japanese paperwork with confidence, one notice at a time.

## Project status

🚧 Prototype built for the **Meta Global AI Developer Hackathon** (Indie track, "Build for Your World"). Development: Oct 27 – Nov 4, 2026.

- Screenshots: *coming soon*
- Demo video: *coming soon*
- Live demo: *coming soon*

## Author

**Binod Gharti Magar** — IT student in Tokyo, Japan 🇯🇵
