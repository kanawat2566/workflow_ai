# AI Agent 5A — Gateway Service

## หน้าที่ของคุณ
คุณรับผิดชอบ **Gateway API** — entry point ของระบบทั้งหมด

## Working Directory
`services/gateway/`

## Tech Stack
- Python 3.12
- FastAPI + Uvicorn
- valkey (redis-py) — subscribe SSE events จาก orchestrator
- httpx — forward requests ไป orchestrator

## Internal Port
`8000`

## Contracts
อ่าน: `../../shared/contracts/sse_events.json`
อ่าน: `../../shared/contracts/approval_pack.json`

## Endpoints ที่ต้องสร้าง
```
POST /commands
  body: { userId, request, useCase?, source: "telegram"|"web" }
  return: { runId }

POST /approvals/{runId}/approve
  body: { comment?: string }

POST /approvals/{runId}/reject
  body: { comment: string }

POST /feedback/{runId}
  body: { rating: "good"|"bad", notes?: string }

GET /stream/{runId}
  SSE endpoint — subscribe Valkey channel sse:{runId}
  stream events ไป client

GET /run/{runId}
  return: run status + approval pack

GET /health
```

## SSE Streaming Pattern
```python
# Subscribe Valkey pub/sub → stream ไป client
async def stream_events(run_id: str):
    async with valkey.pubsub() as ps:
        await ps.subscribe(f"sse:{run_id}")
        async for message in ps.listen():
            yield f"data: {message['data']}\n\n"
```

## Coding Standards
อ่าน: `../../CODING_STANDARDS.md` — บังคับปฏิบัติตามทั้งหมด

### Test Structure
```
services/gateway/
├── src/gateway/
│   ├── router.py
│   ├── sse.py
│   └── models.py
└── tests/
    ├── conftest.py          ← fixtures (mock_valkey, mock_orchestrator_client)
    ├── unit/
    │   ├── test_router.py   ← test endpoint logic (mock httpx)
    │   └── test_sse.py      ← test SSE streaming logic
    └── integration/
        └── test_api.py      ← test with TestClient
```

### Test Naming
```python
# test_{endpoint}_{scenario}_{expected}
def test_post_commands_with_valid_request_returns_run_id(): ...
def test_get_stream_publishes_sse_events_in_correct_format(): ...
def test_post_approve_with_unknown_run_id_returns_404(): ...
```

### Coverage
รัน: `pytest tests/unit/ --cov=src --cov-fail-under=70`

## ห้ามแก้ไฟล์นอก working directory
