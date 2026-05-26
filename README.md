# Luxefin AI Assistant

Standalone Next.js chat UI for the Luxefin embed API (`chatbot.therelah.com`). Extracted from [luxefin-fe](https://github.com/yeeyon/luxefin-fe) — no Luxefin auth or dashboard dependencies.

## Setup

1. Copy `.env.example` to `.env.local` and set:

   - `NEXT_PUBLIC_AI_EMBED_TOKEN` — from chatbot dashboard → Settings → Embed Tokens
   - `NEXT_PUBLIC_AI_ORIGIN` — your deployed URL (must be in the embed token allowed domains)

2. Install and run:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001).

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Add the same env vars in Project Settings → Environment Variables.
4. Add the Vercel production URL to your embed token allowed domains.

## Architecture

- **Frontend only** — calls `GET /api/embed/init` and `POST /api/embed/api` on the chatbot host.
- **No backend** in this repo; the AI/RAG service runs on the configured chatbot URL.
