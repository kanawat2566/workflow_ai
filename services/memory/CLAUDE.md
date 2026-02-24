# AI Agent 5B — Memory Service

## หน้าที่ของคุณ
คุณรับผิดชอบ **Memory Service** — เก็บ user preferences + learned patterns

## Working Directory
`services/memory/`

## Tech Stack
- Python 3.12
- FastAPI + Uvicorn
- Mem0 — memory management library
- SQLAlchemy 2.x + Alembic — PostgreSQL ORM
- valkey (redis-py) — session cache

## Internal Port
`8003`

## DB Tables ที่ต้องสร้าง
```sql
user_profiles   (userId, prefs JSON, style JSON, updatedAt)
memory_entries  (id, userId, type, content, source, createdAt)
  -- type: "fact" | "preference" | "lesson" | "pattern"
run_metrics     (runId, userId, score, passed, feedback, latency, createdAt)
```

## Endpoints ที่ต้องสร้าง
```
GET /memory/profile/{userId}
  return: { prefs, style, pastDecisions, facts }

POST /memory/curate
  body: { userId, runId, feedback: "good"|"bad", notes?, artifacts? }
  action: extract lessons / store patterns via Mem0

GET /metrics/{userId}
  return: { avgScore, passRate, totalRuns, feedbackBreakdown }

GET /health
```

## Coding Standards
อ่าน: `../../CODING_STANDARDS.md` — บังคับปฏิบัติตามทั้งหมด

### Test Structure
```
services/memory/
├── src/memory/
│   ├── profile.py
│   ├── curation.py
│   └── models.py
└── tests/
    ├── conftest.py          ← fixtures (mock_db_session, mock_mem0, sample_user_profile)
    ├── unit/
    │   ├── test_profile.py      ← test get/update user profile
    │   ├── test_curation.py     ← test feedback → lesson extraction
    │   └── test_metrics.py      ← test score calculation
    └── integration/
        └── test_memory_api.py   ← test with actual SQLite in-memory
```

### Test Naming
```python
# test_{function}_{scenario}_{expected}
def test_curate_bad_feedback_extracts_lesson_and_stores(): ...
def test_get_profile_returns_empty_profile_when_user_not_found(): ...
def test_update_metrics_increments_total_runs(): ...
```

### Key Test Cases
```python
async def test_curate_good_feedback_stores_pattern_in_mem0():
    """rating=good → Mem0 stores pattern → profile updated"""

async def test_curate_bad_feedback_extracts_lesson_via_llm():
    """rating=bad → LLM extracts lesson → memory_entries inserted"""
```

### Coverage
รัน: `pytest tests/unit/ --cov=src --cov-fail-under=70`

## ห้ามแก้ไฟล์นอก working directory
