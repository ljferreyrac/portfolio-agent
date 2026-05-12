# PathPilot Demo — AI Portfolio Agent

Full-stack AI agent that answers questions about Leonardo Ferreyra's background and analyzes job fit from uploaded job descriptions.

**Tech stack:** React + TypeScript + Vite (frontend) · FastAPI + Python (backend) · Claude API

---

## Features

- Conversational Q&A about experience, projects, and skills
- Job description upload (PDF, PNG, JPEG, WEBP)
- Animated match score with category breakdown, strengths, and gaps
- Session-based — all state resets on page reload
- Rate limiting and cost guards for public demo safety

See [`architecture/overview.md`](architecture/overview.md) for the full technical breakdown.

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- Tesseract OCR binary ([install guide](https://github.com/tesseract-ocr/tesseract#installing-tesseract))
- An Anthropic API key

### Backend

```bash
cd backend
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. Vite proxies `/api/*` to the backend automatically — no extra config needed.

---

## Docker (local, full stack)

```bash
# Copy and fill in your API key
cp backend/.env.example backend/.env

docker compose up --build
```

App runs at `http://localhost`.

---

## Deployment

### Backend → Railway

1. Create a new Railway project, connect this repo, set root to `backend/`
2. Set environment variable: `ANTHROPIC_API_KEY=...`
3. Set `ALLOWED_ORIGINS` to your Vercel frontend URL

Railway auto-detects the Dockerfile and deploys.

### Frontend → Vercel

1. Connect repo to Vercel, set root to `frontend/`
2. Set environment variable: `VITE_API_URL=https://your-railway-url.up.railway.app`
3. Deploy

Vercel builds `npm run build` and serves the static output. SPA routing works out of the box.

---

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Required. Your Anthropic API key. |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins. Default: `http://localhost:5173` |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL. Default: `/api` (Vite proxy / nginx proxy). Set to full Railway URL for Vercel deploys. |

---

## Security Notes

- Rate limits: 10 req/min on `/chat`, 3 req/min on `/analyze`, 30 req/min global per IP
- File uploads: 5 MB max, MIME type whitelist (PDF, PNG, JPEG, WEBP)
- Messages: 1000 character max
- CORS: locked to configured origins only
- The AI agent's system prompt (background profile) is confidential — the agent is instructed to never reveal it
- `ANTHROPIC_API_KEY` is never committed to the repo

**Recommended:** Set a monthly spend alert in your [Anthropic dashboard](https://console.anthropic.com) as an additional cost guard.
