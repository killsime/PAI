# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-14
**Commit:** 8b91609
**Branch:** master

## OVERVIEW

Online Psychological Assessment and Intervention System (PAI) — a dual-module app: Next.js 16 frontend + FastAPI backend with MySQL (SQLAlchemy), featuring DASS-21 standard assessments, AI-generated analysis via DeepSeek, and scheduled push messages.

## STRUCTURE

```
./
├── frontend/      # Next.js 16 App Router + React 19 + Tailwind 4
├── backend/       # FastAPI + SQLAlchemy + MySQL
├── db/            # SQL init scripts (schema + DASS-21 seed data)
├── .sisyphus/     # Agent orchestration state
├── 论文/          # Thesis/paper documents
├── start.sh       # Launches both frontend + backend
└── kill.sh        # Stops both services
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Frontend routes | `frontend/app/*/page.tsx` | Next.js App Router convention |
| API client | `frontend/app/services/api.ts` | Centralized fetch wrapper |
| Shared components | `frontend/components/` | Modal, Pagination |
| Backend entry | `backend/main.py` | FastAPI app, router registration, scheduler |
| Route handlers | `backend/app/services/*.py` | APIRouter + Service class per domain |
| DB models | `backend/app/db/models.py` | 6 SQLAlchemy models |
| DB connection | `backend/app/db/database.py` | Engine, session, Base |
| SQL schema | `db/init.sql` | MySQL DDL |

## CONVENTIONS

- Backend: APIRouter per domain → routes defined at module top → Service class with static methods below
- Frontend: `'use client'` for interactive pages, `@/*` path alias for imports
- API: REST-ish, JSON request/response, `{ success, data/message }` wrapper in push endpoints
- Auth: localStorage-based (no JWT/token), MD5 password hashing
- Startup: `start.sh` runs both services

## ANTI-PATTERNS

- MD5 password hashing (security concern — consider bcrypt/argon2)
- CORS `allow_origins=["*"]` (relaxed for dev, restrict in production)
- Direct `fetch` calls in pages bypassing `api.ts` (inconsistent API layer)
- Mixed Chinese/English comments and variable names
- No test files or test configuration found

## COMMANDS

```bash
# Frontend dev
cd frontend && npm run dev

# Backend dev
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000

# Full startup
bash start.sh
```
