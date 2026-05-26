# Embed Chat Console

White-label embed AI chat with a password-protected **Admin CRM** to change branding, chatbot API URL, embed token, and site origin — without redeploying.

## URLs

| Page | Path |
|------|------|
| Public chat | `/` |
| Admin login | `/admin/login` |
| Admin CRM | `/admin` |

## Setup

1. Copy `.env.example` to `.env.local`
2. Set `ADMIN_PASSWORD` (required for CRM login)
3. Either configure via **Admin CRM** after login, or set `NEXT_PUBLIC_AI_EMBED_TOKEN` and related env vars

```bash
pnpm install
pnpm dev
```

Open http://localhost:3001 — Admin: http://localhost:3001/admin/login

## Admin CRM

After login you can edit:

- **App name / tagline / assistant title** — branding on the chat page
- **Chatbot API URL** — base URL (e.g. `https://chatbot.therelah.com`)
- **Embed token** — from your chatbot dashboard
- **Site origin** — your live URL; must be in the embed token allowlist

### Persistence

| Environment | Storage |
|-------------|---------|
| Local dev | `data/settings.json` (gitignored) |
| Vercel | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) — set `BLOB_READ_WRITE_TOKEN` |

Without Blob on Vercel, env vars still work for reads; CRM **save** requires Blob or local filesystem.

## Deploy (Vercel)

1. Connect the GitHub repo
2. Environment variables:
   - `ADMIN_PASSWORD` — your CRM password
   - `SESSION_SECRET` — optional; defaults to `ADMIN_PASSWORD`
   - `BLOB_READ_WRITE_TOKEN` — from Vercel → Storage → Blob
   - Optional: `NEXT_PUBLIC_AI_*` as fallbacks
3. Add your production URL to the embed token **allowed domains**
4. Set **Site origin** in CRM to match (e.g. `https://your-app.vercel.app`)

## Architecture

- Chat UI calls your configured chatbot host (`/api/embed/init`, `/api/embed/api`)
- `GET /api/config` — public runtime config for the chat page
- `PUT /api/admin/settings` — authenticated CRM updates
