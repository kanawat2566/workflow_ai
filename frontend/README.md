# Workflow AI Frontend (Next.js 16)

Next.js frontend scaffold and UI implementation for the AI Agent Platform.

## Current Status
- Core routes scaffolded and working: `/`, `/monitor`, `/history`, `/approval/[runId]`
- SSE proxy route implemented: `/api/stream/[runId]`
- Reusable UI components implemented:
  - `AgentProgressBoard`
  - `ApprovalPack`
  - `ApprovalButtons`
  - `FeedbackBar`
  - `StreamingChat`
- Test suite and coverage thresholds configured (Vitest + Testing Library)
- Coverage thresholds currently pass (>= 70 for lines/functions/branches)

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (initialized)
- `@git-diff-view/react`
- `react-complex-tree`
- Vitest + Testing Library

## Design Theme
- Ant Design-inspired UI template (light surfaces, blue primary, card/form/table style)
- Theme foundation file: `src/styles/ant-theme.css`

## Setup

### Requirements
- Node.js 22+ (tested with `v22.14.0`)
- npm 10+

### Install
```bash
cd frontend
npm install
```

## Environment Variables
Create `.env.local` in `frontend/` with:

```bash
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8000
```

Notes:
- SSE proxy route reads `GATEWAY_URL` first, then falls back to `NEXT_PUBLIC_GATEWAY_URL`.
- If no gateway variable is provided, `/api/stream/[runId]` returns HTTP 500.

## Run Commands

### Development
```bash
npm run dev
```

### Lint
```bash
npm run lint
```

### Tests
```bash
npm run test:run
```

### Coverage
```bash
npm run test:coverage
```

### Production Build
```bash
npm run build
```

## Project Structure (key paths)
- `src/app/` - routes and app shell
- `src/components/` - feature components
- `src/components/ui/state-panels.tsx` - shared loading/error/empty/shell wrappers
- `src/hooks/useAgentStream.ts` - SSE client hook
- `src/lib/contracts/` - TS types + runtime guards for shared contracts
- `src/lib/sse/agent-stream.ts` - SSE parsing/reducer helpers
- `__tests__/` - hooks/components/lib tests
- `task-list.md` - implementation tracking plan and status
- `IMPLEMENTATION_NOTES.md` - handoff notes

## Implemented Pages

### `/`
- Uses `StreamingChat`
- SSE-driven transcript preview
- Run ID control + reconnect/disconnect controls
- Recent event list

### `/monitor`
- Uses `MonitorStreamPanel` + `AgentProgressBoard`
- Displays agent statuses from `useAgentStream`

### `/approval/[runId]`
- Uses `ApprovalPageClient`
- Renders `ApprovalPack`, `ApprovalButtons`, `FeedbackBar`
- Uses mock approval pack data for now

### `/history`
- Placeholder table + empty-state notice
- Waiting for backend history API contract

## Known Gaps / Blockers
- No backend contract yet for:
  - approve action endpoint
  - reject action endpoint
  - feedback submission endpoint
  - approval pack fetch endpoint
  - history list endpoint
- Approval page currently uses mock data (`src/lib/mock/approval-pack.ts`)
- Theme direction was changed by request from OpenRouter-style to Ant Design-style (`https://ant.design/`)
- Next.js build warns about inferred workspace root due multiple lockfiles in parent dirs
  - Resolved: `turbopack.root` is set in `next.config.ts`

## QA / Handoff Checklist (Current)
- [x] `npm run lint`
- [x] `npm run test:run`
- [x] `npm run test:coverage` (>= 70 thresholds)
- [x] `npm run build`
- [ ] Responsive smoke pass (mobile/tablet widths)
- [ ] Accessibility smoke pass (keyboard/focus/labels)
- [ ] Backend contract alignment for approval/history APIs

## Tracking
- Detailed task tracking: `task-list.md`
- Continuation notes: `IMPLEMENTATION_NOTES.md`
