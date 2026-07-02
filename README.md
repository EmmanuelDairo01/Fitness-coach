# FitAI — AI Fitness Companion

A full-stack fitness app: scan food for instant calorie/macro estimates, log workouts and body weight,
track progress over time, and chat with an AI coach that gives feedback based on your real logged data.

## Architecture

```
frontend/    React + Vite + Tailwind        — the mobile-style web app (UI in this repo)
backend/     Node.js + Express + PostgreSQL — auth, workouts, food logs, body weight (core API)
ai-service/  Python + FastAPI + Claude API  — food photo analysis + AI coach chat/insights
db/          schema.sql + seed.sql          — Postgres schema and a starter exercise library
```

The frontend never talks to Claude directly. It calls the Node backend, which calls the Python AI
service for anything AI-related (image analysis, chat replies, insights) and stores results in Postgres.
This keeps your Anthropic API key on the server, never in the browser.

## MVP features implemented

1. **Food photo → calories**: snap or upload a meal photo, Claude's vision model estimates the dish,
   calories, macros, and an ingredient-level breakdown. Review and save it to your food log.
2. **Gym progress tracking**: log workouts with exercises, sets, weight, and reps; track body weight
   over time; view volume-over-time charts and your top lifts per exercise.
3. **AI gym buddy**: a chat coach with full visibility into your recent sets, weight trend, and
   nutrition. It applies basic progressive-overload logic (e.g. "you've hit 80kg x 8 twice — add 2.5kg
   next session") rather than generic advice.
4. **Improvement tips**: a proactive insights endpoint surfaces 3–5 specific, data-grounded suggestions
   on the home dashboard and when you open the AI Coach.

## Running it locally

### Option A — Docker Compose (easiest)

```bash
cp ai-service/.env.example ai-service/.env   # add your ANTHROPIC_API_KEY (optional, see below)
cp backend/.env.example backend/.env
docker compose up --build
```

Then open **http://localhost:5173**.

### Option B — run each service manually

You'll need Node.js 20+, Python 3.11+, and a local PostgreSQL instance.

```bash
# 1. Database
createdb fitai
psql fitai -f db/schema.sql
psql fitai -f db/seed.sql

# 2. Backend API
cd backend
cp .env.example .env        # edit DATABASE_URL if needed
npm install
npm run dev                 # http://localhost:4000

# 3. AI service (separate terminal)
cd ai-service
cp .env.example .env        # add ANTHROPIC_API_KEY here
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 4. Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## About the Anthropic API key

Food photo analysis and the AI coach call the Claude API (`claude-sonnet-4-6`) from `ai-service`.
Get a key at https://console.anthropic.com/ and put it in `ai-service/.env` as `ANTHROPIC_API_KEY`.

**Without a key**, the app still runs end-to-end — auth, workout logging, progress charts, and body
weight tracking all work normally. The food-scan and AI-coach screens just return a clearly labeled
"demo mode" placeholder instead of a real analysis, so you can see the full UI before adding a key.

## Notes on what's intentionally simple (MVP scope)

- Auth is email/password only; the "Continue with Google/Apple" buttons in the UI are placeholders.
- Food photos are sent as base64 over HTTPS and not persisted as files — only the AI's structured
  nutrition result is stored, to keep the database light. Swap in S3/Cloud Storage if you want to keep
  the original photos.
- The exercise library is a fixed starter set (`db/seed.sql`); add a "create custom exercise" endpoint
  if you want users to extend it.
- There's no push-notification or scheduling system yet for workout reminders.

## Deploying

Each service is a standalone container (see each `Dockerfile`). A simple path: Postgres on a managed
host (Railway, Supabase, RDS...), `backend` + `ai-service` on a small VM or container platform (Render,
Fly.io, ECS...), and `frontend` as a static build behind any CDN/static host (Vercel, Netlify, S3+CloudFront).
Set `VITE_API_URL` at build time to your deployed backend URL, and `FRONTEND_ORIGIN` on the backend
to your deployed frontend URL for CORS.
