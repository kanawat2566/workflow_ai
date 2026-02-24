# Frontend Implementation Notes (Handoff)

Last Updated: 2026-02-24
Scope: Handoff notes for AI/engineers continuing frontend implementation in `frontend/`

## Current State
- Next.js 16 app scaffold has been created in `frontend/` (TypeScript + Tailwind, `src/app` layout).
- Theme template is present and wired into `src/app/globals.css`.
- Theme direction has been updated to Ant Design-inspired styling (light surfaces + blue primary), while keeping existing `.or-*` utility class names for compatibility.
- Theme file renamed to `src/styles/ant-theme.css`.
- `shadcn/ui` initialized (`components.json`, `src/lib/utils.ts`) and globals re-aligned to the Ant Design-style light palette.
- Placeholder routes created for `/`, `/monitor`, `/history`, `/approval/[runId]`.
- SSE proxy scaffold created at `src/app/api/stream/[runId]/route.ts`.
- Contract types/guards and SSE hook scaffolding implemented.
- Vitest + Testing Library are configured (`vitest.config.ts`, `vitest.setup.ts`).
- Hook tests exist at `__tests__/hooks/useAgentStream.test.ts`.
- `AgentProgressBoard` component and tests are implemented and monitor scaffold now reuses it.
- Approval UI components are implemented: `ApprovalPack`, `ApprovalButtons`, `FeedbackBar`.
- `StreamingChat` is implemented and `/` now renders it.
- Shared UI state wrappers are implemented in `src/components/ui/state-panels.tsx`.
- `/approval/[runId]` now renders a client composition (`ApprovalPageClient`) with mock approval pack data.
- Approval component tests are present for render and interaction flows.
- `/monitor` uses a hook-based client panel (`src/components/MonitorStreamPanel.tsx`) for early SSE integration.
- Contract/reducer unit tests exist under `__tests__/lib/`.
- `npm run test:coverage` passes (thresholds >= 70 for lines/functions/branches).
- `npm run lint` and `npm run build` pass.
- Responsive + accessibility smoke pass completed (focus-visible states, mobile nav stacking, contrast cleanup on light theme).

## Locked Assumptions
- Use Next.js 16 App Router + TypeScript + Tailwind CSS.
- Use `shadcn/ui`, `@git-diff-view/react`, `react-complex-tree`.
- Use EventSource (SSE) client via frontend proxy route.
- Use Vitest + Testing Library + jsdom with coverage thresholds >= 70.
- `/history` is placeholder/scaffold in current iteration until backend contract exists.
- Approve/Reject/Feedback UI should be callback-based until backend endpoints are defined.

## Required Routes (from `frontend/CLAUDE.md`)
- `app/page.tsx` (`/`)
- `app/approval/[runId]/page.tsx`
- `app/monitor/page.tsx`
- `app/history/page.tsx`
- `app/api/stream/[runId]/route.ts` (SSE proxy)

## Required Components
- `AgentProgressBoard`
- `ApprovalPack`
- `StreamingChat`
- `ApprovalButtons`
- `FeedbackBar`

## Contracts To Follow
- `shared/contracts/sse_events.json`
- `shared/contracts/approval_pack.json`

## Env Var
- `NEXT_PUBLIC_GATEWAY_URL=http://localhost:8000`

## Suggested Next Implementation Steps
1. Backend contract alignment for approval/history APIs.
2. Replace approval mock data with real API fetch integration.
3. Optional cleanup: rename `.or-*` utility prefix if desired.

## Known Gaps / Blockers
- No explicit backend contract yet for approve/reject/feedback endpoints.
- No explicit history data API contract.
- `next.config.ts` now sets `turbopack.root`, so the previous workspace-root warning is resolved.

## Tracking
- Use `frontend/task-list.md` as source of truth for status updates and dependencies.
