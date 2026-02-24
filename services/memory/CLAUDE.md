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

## ห้ามแก้ไฟล์นอก working directory
