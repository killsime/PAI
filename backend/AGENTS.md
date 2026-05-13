# BACKEND

**FastAPI + SQLAlchemy + MySQL** — APScheduler-based push, DeepSeek AI analysis.

## STRUCTURE

```
backend/
├── main.py                # FastAPI app, CORS, router registration, scheduler
├── app/
│   ├── services/          # APIRouter + Service class per domain
│   │   ├── user_service.py
│   │   ├── assessment_service.py
│   │   ├── questions_service.py
│   │   ├── admin_service.py
│   │   ├── push_service.py
│   │   └── paper_service.py
│   └── db/
│       ├── database.py    # SQLAlchemy engine, session, Base
│       └── models.py      # 6 models: User, Assessment, Question, Result, UserStatus, PushMessage
├── requirements.txt
└── .env                   # DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL
```

## WHERE TO LOOK

| Task | File |
|------|------|
| Add a route/endpoint | `app/services/<domain>_service.py` |
| Auth/login | `user_service.py` (users), `admin_service.py` (admin) |
| DASS-21 scoring | `assessment_service.py` — `calculate_severity()` method |
| AI analysis | `assessment_service.py` — `generate_ai_analysis()` / `generate_analysis_with_llm()` |
| Scheduled push | `push_service.py` — `check_and_push()`, `should_push()`, `get_random_message()` |
| DB schema changes | `app/db/models.py` |
| DB connection | `app/db/database.py` |

## CONVENTIONS

- **Pattern per domain**: APIRouter (`domain_router`) at module top, route handlers below, then `class DomainService` with `@staticmethod` methods
- **DB dependency**: `db: Session = Depends(get_db)` injected into every route handler
- **Request validation**: Pydantic `BaseModel` subclasses per request type
- **Error handling**: route-level `try/except` → `raise HTTPException(status_code=500, detail=str(e))`
- **Push messages**: routed under `/api/push/` prefix (not `/push/`)
- **Scheduler**: APScheduler cron job at 9 AM daily for push distribution
- **Config**: `.env` loaded via `python-dotenv` for API keys

## ANTI-PATTERNS

- MD5 password hashing (user_service.py, admin_service.py) — use bcrypt/argon2
- CORS `allow_origins=["*"]` in main.py — restrict in production
- `AI_explain` global flag toggles LLM vs rule-based analysis — should be config-level
- Some exception messages in Chinese, some in English — inconsistent
- Mixed `request.dict()` (Pydantic v1) — Pydantic v2 uses `model_dump()`
- No input sanitization on string fields
- No async DB sessions — all queries are synchronous
- No test files or test configuration
