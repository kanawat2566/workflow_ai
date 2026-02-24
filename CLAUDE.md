# AI Agent Platform — Root CLAUDE.md

## Project Overview
AI Agent Platform สำหรับ:
1. สร้างเอกสารจาก ASP.NET MVC repo
2. สร้าง Web App อัตโนมัติ
3. Multi-agent team (BA/Arch/Dev/QA)
4. เรียนรู้จาก feedback
5. สร้าง media content

## Tech Stack
- **Backend**: Python 3.12 (FastAPI + LangGraph) + .NET 8 (Roslyn Parser)
- **Frontend**: Next.js 16 (App Router)
- **LLM**: OpenRouter free models
- **Vector DB**: Qdrant
- **SQL**: PostgreSQL
- **Cache/PubSub**: Valkey (Redis-compatible)
- **Workflow**: Temporal
- **Observability**: Langfuse

## Multi-AI Development — สำคัญมาก

Project นี้แบ่งงานให้ AI 7 ตัวทำพร้อมกัน:

| AI | Working Dir | รับผิดชอบ |
|----|------------|-----------|
| AI 1 | `services/parser-dotnet/` | .NET Roslyn Parser |
| AI 2 | `services/rag/` | RAG + Embedding |
| AI 3 | `services/orchestrator/` | LangGraph Orchestrator |
| AI 4 | `services/executor/` + `services/evaluator/` | Executor + Evaluator |
| AI 5 | `services/gateway/` + `services/memory/` + `services/telegram-bot/` | Gateway + Memory + Bot |
| AI 6 | `frontend/` | Next.js UI |
| AI 7 | `infra/` + root | Docker + DevOps |

## Contracts (อ่านก่อนทำงาน)
```
shared/contracts/
├── ports.json          — port ของทุก service
├── chunk_schema.json   — .NET Parser → RAG
├── retrieve_schema.json — RAG → Orchestrator
├── agent_state.py      — LangGraph state
├── sse_events.json     — SSE event format
├── approval_pack.json  — Approval Pack structure
└── artifact_schema.json — Executor output
```

## Coding Standards (อ่านก่อนเขียน code ทุกบรรทัด)
ดู [CODING_STANDARDS.md](CODING_STANDARDS.md) — บังคับทุก AI agent ปฏิบัติตาม:
- Function ≤ 20 บรรทัด, Class ≤ 200 บรรทัด
- Type hints ครบ (Python), Nullable enable (.NET), No `any` (TypeScript)
- **Unit test ทุก public function** — coverage ≥ 70%
- AAA pattern (Arrange-Act-Assert) ทุก test
- ห้าม hard-code URL/secret — ใช้ env var เสมอ

## กฎสำคัญ
1. **แต่ละ AI ทำได้เฉพาะ working directory ของตัวเอง**
2. **ถ้าต้องการเปลี่ยน contract → แจ้ง human ก่อน**
3. **Internal service URL ใช้ Docker service name** (เช่น `http://rag:8002`)
4. **ทุก service ต้องมี `GET /health` endpoint**
5. **ทุก service ต้องมี `Dockerfile`**
6. **ทุก service ต้องมี unit tests ใน `tests/unit/`** (Python) หรือ `*.Tests/Unit/` (.NET)

## Run Development
```bash
cp .env.example .env
# แก้ไข .env ใส่ API keys
docker compose up -d
```

## Service URLs (localhost)
- Frontend:    http://localhost:3000
- Gateway:     http://localhost:8000
- Temporal UI: http://localhost:8080
- Langfuse:    http://localhost:3001
- Qdrant:      http://localhost:6333/dashboard
