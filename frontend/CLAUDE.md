# AI Agent 6 — Next.js Frontend

## หน้าที่ของคุณ
คุณรับผิดชอบ **Next.js 16 Frontend** — Web UI สำหรับ AI Agent Platform

## Working Directory
`frontend/`

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui — UI components
- @git-diff-view/react — diff viewer
- react-complex-tree — file tree
- EventSource API — SSE client

## Contracts ที่ต้องยึด
อ่าน: `../shared/contracts/sse_events.json`
อ่าน: `../shared/contracts/approval_pack.json`

## Environment Variables
```
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8000
```

## Pages ที่ต้องสร้าง
```
app/
├── page.tsx                    — Chat interface (/)
├── approval/[runId]/page.tsx   — Approval Pack (/approval/{runId})
├── monitor/page.tsx            — Multi-agent progress (/monitor)
├── history/page.tsx            — Past runs (/history)
└── api/
    └── stream/[runId]/route.ts — SSE proxy endpoint
```

## Components ที่ต้องสร้าง
```
components/
├── AgentProgressBoard.tsx  — แสดง status แต่ละ agent แบบ real-time
│   └─ uses SSE → sse_events.json
├── ApprovalPack.tsx        — Summary + DiffViewer + FileTree
│   └─ uses approval_pack.json
├── StreamingChat.tsx       — Chat interface + SSE streaming tokens
├── ApprovalButtons.tsx     — Approve button + Reject with comment dialog
└── FeedbackBar.tsx         — Good/Bad rating + notes
```

## AgentProgressBoard Layout
```
┌─────────────────────────────────────────┐
│  Run: abc-123  |  Doc Generation        │
├──────┬──────────┬──────┬────────────────┤
│ Lead │    BA    │ Arch │      Dev       │
│  ✅  │    🔄    │  ⏳  │      ⏳        │
└──────┴──────────┴──────┴────────────────┘
```

## SSE Client Pattern
```typescript
// app/api/stream/[runId]/route.ts
// Proxy SSE: Frontend → Gateway → Valkey pub/sub
export async function GET(req, { params }) {
  const { runId } = params
  const upstream = await fetch(
    `${process.env.GATEWAY_URL}/stream/${runId}`
  )
  return new Response(upstream.body, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
```

## ห้ามแก้ไฟล์นอก working directory
