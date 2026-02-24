# AI Agent 3 — Orchestrator Service

## หน้าที่ของคุณ
คุณรับผิดชอบ **Orchestrator** — หัวใจของระบบ
จัดการ multi-agent workflows ด้วย LangGraph และ Temporal

## Working Directory
`services/orchestrator/`

## Tech Stack
- Python 3.12
- FastAPI + Uvicorn
- LangGraph — StateGraph per use case
- temporalio — Temporal SDK (long-running workflow)
- httpx — call internal services
- valkey (redis-py) — pub/sub SSE events

## Internal Port
`8001`

## Service URLs (Docker network)
```
memory    : http://memory:8003
rag       : http://rag:8002
executor  : http://executor:8004
evaluator : http://evaluator:8005
temporal  : temporal:7233
valkey    : redis://valkey:6379/0
```

## Contracts

### Shared State
ใช้: `../../shared/contracts/agent_state.py` → AgentState TypedDict

### SSE Events (emit ทุก step)
อ่าน: `../../shared/contracts/sse_events.json`
Publish ไป Valkey channel: `sse:{run_id}`

### Approval Pack Output
อ่าน: `../../shared/contracts/approval_pack.json`

## Endpoints ที่ต้องสร้าง
```
POST /run
  body: { userId: string, request: string, useCase: string }
  return: { runId: string }

GET /run/{runId}/status
  return: { status, agentStatuses, approvalPack? }

POST /run/{runId}/approve
  body: { comment?: string }

POST /run/{runId}/reject
  body: { comment: string }

POST /run/{runId}/feedback
  body: { rating: "good"|"bad", notes?: string }

GET /health
```

## LangGraph Graphs ที่ต้องสร้าง
```
graphs/
├── doc_generation_graph.py    # Diagram1.mmd flow
├── bot_team_graph.py          # BotTeam.mmd (parallel agents)
├── web_app_graph.py           # FlowWebApp.mmd
└── media_generation_graph.py  # Usecase2.mmd
```

## Agent Nodes ที่ต้องสร้าง
```
agents/
├── lead_agent.py      # แตกงาน + assign ไป BA/Arch/Dev/QA
├── ba_agent.py        # Requirements / Acceptance Criteria
├── arch_agent.py      # Architecture / Diagrams
├── dev_agent.py       # Code generation / Scaffold
├── qa_agent.py        # Test cases / Checklist
├── planner_agent.py   # Sequential flow planner
└── memory_agent.py    # fetch + curate memory
```

## SSE Event Emitter
```
sse/event_emitter.py
  async def emit(run_id, agent, status, message, result=None)
  → publish ไป Valkey pub/sub → gateway subscribe → stream ไป client
```

## LLM Routing (OpenRouter Free)
```python
MODEL_ROUTER = {
    "planning":      "deepseek/deepseek-r1-0528:free",
    "code_analysis": "google/gemini-2.0-flash-exp:free",
    "code_gen":      "mistralai/devstral-2:free",
    "evaluation":    "deepseek/deepseek-r1-0528:free",
    "general":       "meta-llama/llama-3.3-70b:free",
}
```

## ห้ามแก้ไฟล์นอก working directory
