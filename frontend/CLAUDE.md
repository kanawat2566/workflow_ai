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

## Coding Standards
อ่าน: `../CODING_STANDARDS.md` — บังคับปฏิบัติตามทั้งหมด

### Test Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── AgentProgressBoard.tsx
│   │   ├── ApprovalPack.tsx
│   │   └── ...
│   └── hooks/
│       └── useAgentStream.ts
└── __tests__/
    ├── components/
    │   ├── AgentProgressBoard.test.tsx  ← test render + SSE updates
    │   ├── ApprovalPack.test.tsx        ← test render approval data
    │   ├── ApprovalButtons.test.tsx     ← test approve/reject click
    │   └── FeedbackBar.test.tsx         ← test rating selection
    └── hooks/
        └── useAgentStream.test.ts       ← test SSE event handling
```

### Test Naming
```typescript
// Describe: component/hook name
// It: "should {expected} when {scenario}"
describe("AgentProgressBoard", () => {
  it("should render all agents as waiting initially", () => { ... });
  it("should update agent status when SSE event received", () => { ... });
  it("should show completion state when all agents are done", () => { ... });
});

describe("useAgentStream", () => {
  it("should close EventSource on unmount to prevent memory leak", () => { ... });
  it("should parse SSE event and update agent state", () => { ... });
});
```

### Key Test Cases
```typescript
// Component test — ตรวจ render
it("should display quality score in approval pack", () => {
  render(<ApprovalPack data={mockApprovalPack} />);
  expect(screen.getByText("87/100")).toBeInTheDocument();
});

// Interaction test — ตรวจ click
it("should call approve API when approve button clicked", async () => {
  const mockApprove = vi.fn();
  render(<ApprovalButtons runId="r1" onApprove={mockApprove} />);
  await userEvent.click(screen.getByRole("button", { name: /approve/i }));
  expect(mockApprove).toHaveBeenCalledWith("r1");
});

// Hook test — ตรวจ SSE
it("should update agents list when agent_update event received", () => {
  const { result } = renderHook(() => useAgentStream("run-1"));
  act(() => mockEventSource.emit("message", { data: JSON.stringify(sseEvent) }));
  expect(result.current.agents[0].status).toBe("running");
});
```

### Test Config (vitest.config.ts หรือ jest.config.js)
```typescript
// coverage threshold บังคับ
coverage: {
  thresholds: { lines: 70, functions: 70, branches: 70 }
}
```

### Coverage
รัน: `npm run test:coverage` → ต้องได้ ≥ 70%

## ห้ามแก้ไฟล์นอก working directory
