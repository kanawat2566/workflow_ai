# TASKS — AI Agent Platform
> อัปเดต checkbox แล้วบอก Claude ว่า "ทำ TASKS ถึงข้อไหนแล้ว" ได้เลย

---

## ✅ เสร็จแล้ว (Foundation)

- [x] สร้าง Monorepo structure
- [x] สร้าง shared/contracts ทั้ง 7 schemas
- [x] สร้าง docker-compose.yml (15 services)
- [x] สร้าง Dockerfiles (Python / .NET / Next.js)
- [x] สร้าง CLAUDE.md ต่อ service (7 AI agents)
- [x] Git init + .gitignore + .gitattributes
- [x] GitHub Actions CI/CD pipelines
- [x] Self-hosted runner ติดตั้งแล้ว

---

## 🔧 Phase 0 — Human Setup (ทำเอง)

- [x] **0.1** สร้าง GitHub repo + push code ขึ้น
  ```
  git add .
  git commit -m "chore: initial scaffold"
  git remote add origin https://github.com/<name>/bot_ai.git
  git push -u origin main
  ```

- [x] **0.2** Copy `.env.example` → `.env` แล้วใส่ค่า
  - [x] `OPENROUTER_API_KEY` — จาก openrouter.ai
  - [x] `GOOGLE_API_KEY` — จาก aistudio.google.com (ฟรี)
  - [x] `TELEGRAM_BOT_TOKEN` — จาก @BotFather บน Telegram
  - [x] `GITHUB_TOKEN` — จาก github.com/settings/tokens

- [x] **0.3** ติดตั้ง Self-Hosted Runner
  - [x] ดาวน์โหลด + configure แล้ว
  - [x] รัน `.\run.cmd` หรือ NSSM service
  - [x] เช็ค GitHub → Settings → Actions → Runners → เห็น **Idle**

- [x] **0.4** สร้าง branch สำหรับแต่ละ AI agent
  ```
  git checkout -b feat/parser-dotnet && git push -u origin feat/parser-dotnet
  git checkout main
  git checkout -b feat/orchestrator && git push -u origin feat/orchestrator
  git checkout main
  git checkout -b feat/rag-service && git push -u origin feat/rag-service
  git checkout main
  git checkout -b feat/executor-eval && git push -u origin feat/executor-eval
  git checkout main
  git checkout -b feat/gateway-memory && git push -u origin feat/gateway-memory
  git checkout main
  git checkout -b feat/frontend && git push -u origin feat/frontend
  git checkout main
  ```

- [ ] **0.5** ทดสอบ docker infrastructure ขึ้น
  ```
  docker compose up -d qdrant postgres valkey
  docker compose ps
  ```

---

## 🤖 Phase 1 — AI Agent Coding (เปิด Claude แต่ละ session)

### AI Agent 1 — .NET Parser
> เปิด Claude ที่ `services/parser-dotnet/` แล้วพิมพ์: "อ่าน CLAUDE.md แล้ว implement เลย"

- [ ] **1.1** `Parser.API.csproj` — setup project + Roslyn packages
- [ ] **1.2** `Models/ChunkDto.cs` — ตาม chunk_schema.json
- [ ] **1.3** `Services/RoslynParserService.cs` — parse .cs files
- [ ] **1.4** `Services/RouteMapService.cs` — extract MVC routes
- [ ] **1.5** `Controllers/ParseController.cs` — POST /parse/repo, /parse/file, /parse/incremental
- [ ] **1.6** `Dockerfile` — build สำเร็จ
- [ ] **1.7** ทดสอบ: ส่ง .cs file → ได้ JSON chunks กลับมา

### AI Agent 2 — RAG Service
> เปิด Claude ที่ `services/rag/` (รอ AI 1 เสร็จก่อน)

- [ ] **2.1** `requirements.txt` — llama-index, qdrant-client, sentence-transformers
- [ ] **2.2** `main.py` — FastAPI app
- [ ] **2.3** `services/indexer.py` — รับ chunks → embed → Qdrant
- [ ] **2.4** `services/retriever.py` — hybrid search (Qdrant + OpenSearch)
- [ ] **2.5** `services/reranker.py` — BGE-Reranker
- [ ] **2.6** `routers/index.py` — POST /index/scan, /index/incremental
- [ ] **2.7** `routers/retrieve.py` — POST /retrieve
- [ ] **2.8** `Dockerfile`
- [ ] **2.9** ทดสอบ: index ไฟล์ → query → ได้ chunks กลับ

### AI Agent 3 — Orchestrator
> เปิด Claude ที่ `services/orchestrator/`

- [ ] **3.1** `requirements.txt` — langgraph, temporalio, httpx
- [ ] **3.2** `contracts/agent_state.py` — copy จาก shared/contracts
- [ ] **3.3** `sse/event_emitter.py` — publish ไป Valkey pub/sub
- [ ] **3.4** `graphs/doc_generation_graph.py` — LangGraph flow (Diagram1)
- [ ] **3.5** `graphs/bot_team_graph.py` — parallel BA/Arch/Dev/QA (BotTeam)
- [ ] **3.6** `agents/lead_agent.py`
- [ ] **3.7** `agents/ba_agent.py`
- [ ] **3.8** `agents/arch_agent.py`
- [ ] **3.9** `agents/dev_agent.py`
- [ ] **3.10** `agents/qa_agent.py`
- [ ] **3.11** `main.py` — FastAPI: POST /run, POST /run/{id}/approve|reject
- [ ] **3.12** `Dockerfile`
- [ ] **3.13** ทดสอบ: ส่ง request → LangGraph รัน → SSE events ออกมา

### AI Agent 4 — Executor + Evaluator
> เปิด Claude ที่ `services/executor/` และ `services/evaluator/`

- [ ] **4.1** Executor: `requirements.txt` — gitpython, pygithub, jinja2
- [ ] **4.2** Executor: `services/git_service.py` — clone, commit, push, PR
- [ ] **4.3** Executor: `services/doc_generator.py` — Jinja2 templates
- [ ] **4.4** Executor: `routers/tools.py` — POST /tools/generateDocs, /createPR
- [ ] **4.5** Executor: `Dockerfile`
- [ ] **4.6** Evaluator: `services/evaluator_service.py` — LLM-as-Judge
- [ ] **4.7** Evaluator: `routers/evaluate.py` — POST /evaluate/docs
- [ ] **4.8** Evaluator: `Dockerfile`
- [ ] **4.9** ทดสอบ: generate README → evaluate → score กลับมา

### AI Agent 5 — Gateway + Memory + Telegram Bot
> เปิด Claude ที่ `services/gateway/`, `services/memory/`, `services/telegram-bot/`

- [ ] **5.1** Gateway: `main.py` — POST /commands, GET /stream/{runId} (SSE)
- [ ] **5.2** Gateway: `routers/approvals.py` — POST /approvals/{approve|reject}
- [ ] **5.3** Gateway: `sse/stream.py` — subscribe Valkey → stream ไป client
- [ ] **5.4** Gateway: `Dockerfile`
- [ ] **5.5** Memory: `models/` — SQLAlchemy models (user_profiles, memory_entries)
- [ ] **5.6** Memory: `services/memory_service.py` — Mem0 integration
- [ ] **5.7** Memory: `routers/memory.py` — GET /memory/profile, POST /memory/curate
- [ ] **5.8** Memory: `Dockerfile`
- [ ] **5.9** Telegram Bot: `bot.py` — Aiogram handlers
- [ ] **5.10** Telegram Bot: `handlers/commands.py` — /doc, /build, /spec, /status
- [ ] **5.11** Telegram Bot: `handlers/approval.py` — inline buttons Approve/Reject
- [ ] **5.12** Telegram Bot: `Dockerfile`
- [ ] **5.13** ทดสอบ: พิมพ์ /doc ใน Telegram → ได้ reply กลับ

### AI Agent 6 — Next.js Frontend
> เปิด Claude ที่ `frontend/`

- [ ] **6.1** `npx create-next-app@latest` — setup project
- [ ] **6.2** ติดตั้ง shadcn/ui, @git-diff-view/react, react-complex-tree
- [ ] **6.3** `app/page.tsx` — Chat interface
- [ ] **6.4** `app/api/stream/[runId]/route.ts` — SSE proxy
- [ ] **6.5** `components/StreamingChat.tsx` — real-time chat
- [ ] **6.6** `components/AgentProgressBoard.tsx` — per-agent status
- [ ] **6.7** `app/approval/[runId]/page.tsx` — Approval Pack page
- [ ] **6.8** `components/ApprovalPack.tsx` — summary + diff + file tree
- [ ] **6.9** `components/ApprovalButtons.tsx` — Approve/Reject + comment
- [ ] **6.10** `app/monitor/page.tsx` — agent monitor
- [ ] **6.11** `Dockerfile`
- [ ] **6.12** ทดสอบ: เปิด localhost:3000 → เห็น chat interface

---

## 🔗 Phase 2 — Integration Testing

- [ ] **I.1** Gateway ↔ Orchestrator — ส่ง command → orchestrator รับ
- [ ] **I.2** Orchestrator ↔ Memory — fetch user prefs
- [ ] **I.3** .NET Parser ↔ RAG — parse → embed → retrieve
- [ ] **I.4** Orchestrator ↔ RAG — retrieve chunks สำเร็จ
- [ ] **I.5** Orchestrator ↔ Executor — generate docs สำเร็จ
- [ ] **I.6** Orchestrator ↔ Evaluator — quality gate ผ่าน
- [ ] **I.7** SSE stream: Orchestrator → Gateway → Frontend เห็น events
- [ ] **I.8** Telegram Bot: ส่ง command → gateway → ได้ reply กลับ

---

## 🧪 Phase 3 — E2E Test

- [ ] **E.1** Doc Generation: พิมพ์ใน Telegram "ทำ doc จาก repo X"
  → RAG index → generate README → evaluate → Approval Pack → Approve → PR
- [ ] **E.2** BotTeam: "สร้าง web app Y"
  → 4 agents parallel → Assemble → Approval → Execute
- [ ] **E.3** Learning Loop: กด Bad → memory curate → รอบถัดไปดีขึ้น
- [ ] **E.4** Frontend: เห็น AgentProgressBoard แบบ real-time

---

## 📋 วิธีใช้ไฟล์นี้

1. เปิดไฟล์นี้ใน VSCode
2. กด `Ctrl+Shift+V` เพื่อดู preview
3. คลิก checkbox ใน editor เพื่อ check/uncheck
4. แจ้ง Claude ว่า **"ทำถึงข้อ X.X แล้ว"** หรือ **"ข้อ X.X ติด error"**
