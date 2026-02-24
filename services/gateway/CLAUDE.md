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

## ห้ามแก้ไฟล์นอก working directory
