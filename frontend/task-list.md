# Frontend Task List - AI Agent Platform (Next.js 16)

Last Updated: 2026-02-24
Owner: AI Agent 6 (Frontend)
Working Directory: `frontend/`

## Goal
Build the Next.js frontend UI for AI Agent Platform with:
- Chat interface
- Approval Pack page
- Monitor page (real-time multi-agent progress)
- History page
- SSE proxy + client hook
- Tests with coverage >= 70%

## Source Specs / Contracts
- `frontend/CLAUDE.md`
- `shared/contracts/sse_events.json`
- `shared/contracts/approval_pack.json`
- `CODING_STANDARDS.md`

## Global Assumptions (Locked)
- `frontend/` currently has no app scaffold and must be bootstrapped from scratch.
- Use Next.js 16 + App Router + TypeScript + Tailwind.
- Use Vitest + Testing Library (instead of Jest).
- Approval/Reject/Feedback backend endpoints are not yet defined; UI components are callback-based and page handlers can be stubs/TODOs.
- `/history` is a scaffold/placeholder page in this iteration unless a backend contract is added.
- Visual style target is Ant Design-inspired clean enterprise UI (light surfaces + blue primary).

## Status Legend
- `To Do` = not started
- `In Progress` = actively being implemented
- `Blocked` = waiting on dependency / contract / decision
- `In Review` = code + tests ready for review
- `Done` = completed and verified

## Phase Overview
- P0: Contract & interfaces
- P1: Bootstrap & tooling
- P2: SSE/data layer
- P3: Components
- P4: Page integration
- P5: QA & coverage

## Master Task Table

| ID | Phase | Task | Status | Est. | Depends On | Deliverable |
|---|---|---|---|---:|---|---|
| FE-001 | P0 | Create TS contract types + guards for SSEEvent and ApprovalPack | Done | 0.5d | None | `src/lib/contracts/*` |
| FE-002 | P0 | Define shared component props and `useAgentStream` return shape | Done | 0.5d | FE-001 | `src/types/ui.ts` (or equivalent) |
| FE-003 | P0 | Document backend contract gaps (approve/reject/feedback) + placeholder adapter policy | Done | 0.25d | FE-002 | `frontend/notes/backend-gaps.md` or inline README notes |
| FE-004 | P1 | Bootstrap Next.js 16 + TypeScript + Tailwind app in `frontend/` | Done | 0.5d | None | runnable app scaffold |
| FE-005 | P1 | Install/configure shadcn/ui + diff viewer + file tree libs | Done | 0.5d | FE-004 | dependency setup |
| FE-005A | P1 | Add Ant Design-inspired theme CSS + font setup and wire into globals | Done | 0.5d | FE-004 | `src/styles/ant-theme.css` |
| FE-006 | P1 | Configure Vitest + Testing Library + jsdom + coverage thresholds 70/70/70 | Done | 0.5d | FE-004 | test config |
| FE-007 | P1 | Create app shell/layout and route placeholders (`/`, `/monitor`, `/history`, `/approval/[runId]`) | Done | 0.5d | FE-004, FE-005A | route placeholders |
| FE-008 | P2 | Implement SSE proxy route `app/api/stream/[runId]/route.ts` | Done | 0.5d | FE-004 | proxy route |
| FE-009 | P2 | Build SSE parser + runtime guards + agent reducer utilities | Done | 0.75d | FE-001 | parser/reducer |
| FE-010 | P2 | Implement `useAgentStream` hook (connect, parse, state updates, cleanup, reconnect) | Done | 1d | FE-008, FE-009 | hook |
| FE-011 | P2 | Add hook tests for SSE handling and EventSource cleanup | Done | 0.75d | FE-010, FE-006 | `__tests__/hooks/useAgentStream.test.ts` |
| FE-012 | P3 | Build `AgentProgressBoard` component (real-time board UI) | Done | 0.75d | FE-002, FE-010 | component |
| FE-012A | P3 | Apply theme styles to `AgentProgressBoard` (status tiles/pills/grid) | Done | 0.25d | FE-012, FE-005A | polished board UI |
| FE-013 | P3 | Add `AgentProgressBoard` tests (initial state + SSE updates) | Done | 0.5d | FE-012, FE-006 | component tests |
| FE-014 | P3 | Build `ApprovalPack` component (summary + score + artifacts + diff + file tree) | Done | 1.5d | FE-001, FE-005 | component |
| FE-014A | P3 | Apply theme styles to `ApprovalPack` panels and artifact sections | Done | 0.25d | FE-014, FE-005A | themed approval UI |
| FE-015 | P3 | Add `ApprovalPack` tests (render data, score, optional fields) | Done | 0.75d | FE-014, FE-006 | component tests |
| FE-016 | P3 | Build `ApprovalButtons` component (approve + reject dialog, callback-based) | Done | 0.5d | FE-002, FE-005 | component |
| FE-017 | P3 | Add `ApprovalButtons` tests (approve/reject flows) | Done | 0.5d | FE-016, FE-006 | component tests |
| FE-018 | P3 | Build `FeedbackBar` component (good/bad + notes + submit callback) | Done | 0.5d | FE-002 | component |
| FE-019 | P3 | Add `FeedbackBar` tests (rating selection + submit) | Done | 0.5d | FE-018, FE-006 | component tests |
| FE-020 | P3 | Build `StreamingChat` component (chat UI + token streaming state) | Done | 1d | FE-010 | component |
| FE-020A | P3 | Apply theme styles to `StreamingChat` (shell, transcript, input, CTA) | Done | 0.25d | FE-020, FE-005A | themed chat UI |
| FE-021 | P4 | Integrate `/monitor` page with `AgentProgressBoard` + run ID input | Done | 0.5d | FE-012 | monitor page |
| FE-022 | P4 | Integrate `/approval/[runId]` page with `ApprovalPack`, `ApprovalButtons`, `FeedbackBar` | Done | 0.75d | FE-014, FE-016, FE-018, FE-003 | approval page |
| FE-023 | P4 | Integrate `/` page with `StreamingChat` | Done | 0.5d | FE-020 | chat page |
| FE-024 | P4 | Build `/history` page scaffold (empty state + placeholder list/table) | Done | 0.5d | FE-007, FE-005A | history page |
| FE-025 | P4 | Add shared loading/error/empty states for page-level UX consistency | Done | 0.5d | FE-021, FE-022, FE-023, FE-024 | UX states |
| FE-025A | P4 | Create reusable themed wrappers/utilities for panels, pills, and shell sections | Done | 0.5d | FE-005A, FE-025 | consistent theming |
| FE-026 | P5 | Close coverage gaps to >=70% across lines/functions/branches | Done | 1d | FE-011, FE-013, FE-015, FE-017, FE-019 | coverage pass |
| FE-027 | P5 | Responsive + accessibility smoke pass (keyboard/focus/labels) | Done | 0.5d | FE-021, FE-022, FE-023, FE-024 | a11y/responsive fixes |
| FE-028 | P5 | Final QA checklist + frontend README (run/test/env) | Done | 0.5d | FE-026, FE-027 | handoff docs |

## Execution Order (Recommended)
1. FE-004 -> FE-005 -> FE-005A -> FE-006 -> FE-007
2. FE-001 -> FE-002 -> FE-003
3. FE-008 -> FE-009 -> FE-010 -> FE-011
4. FE-012/014/016/018/020 (parallelizable after dependencies)
5. FE-013/015/017/019 (tests for each component)
6. FE-021..FE-025A integration
7. FE-026..FE-028 QA and handoff

## Acceptance Criteria by Milestone

### Milestone A - Foundation Ready (P0 + P1)
- [ ] `frontend/` app boots with Next.js 16
- [ ] Tailwind and theme CSS loaded
- [ ] test runner and coverage thresholds configured
- [ ] route placeholders available

### Milestone B - Realtime Data Ready (P2)
- [ ] SSE proxy works and returns event-stream response
- [ ] `useAgentStream` parses and updates agent states
- [ ] malformed events do not crash UI
- [ ] EventSource closes on unmount

### Milestone C - UI Components Ready (P3)
- [ ] All 5 required components implemented
- [ ] Core interaction tests passing
- [ ] Theme applied consistently to key surfaces

### Milestone D - Page Integration Ready (P4)
- [ ] `/`, `/monitor`, `/history`, `/approval/[runId]` render successfully
- [ ] empty/loading/error states exist
- [ ] monitor/chat integrate with SSE hook

### Milestone E - Handoff Ready (P5)
- [ ] Coverage >= 70%
- [ ] README documents setup/run/test/env vars
- [ ] Known backend contract gaps documented

## Known Blockers / Open Dependencies
- Backend API contract for approve/reject/feedback endpoints (request/response schema and paths)
- Data source contract for `/history` page

## Suggested Daily Tracking Update (append below)
```md
## Progress: YYYY-MM-DD

### Completed
- ...

### In Progress
- ...

### Next Steps
1. ...
2. ...

### Blockers
- None / ...

### Decisions Made
- ...

### Notes
- ...
```

## Progress: 2026-02-24

### Completed
- FE-004: Bootstrapped Next.js 16 + TypeScript + Tailwind app in `frontend/`
- FE-005: Installed/configured `shadcn/ui`, `@git-diff-view/react`, and `react-complex-tree`
- FE-005A: Added Ant Design-inspired theme CSS and wired fonts/theme variables into `src/app/globals.css`
- FE-006: Added Vitest + Testing Library + jsdom + coverage thresholds + scripts
- FE-007: Added app shell + placeholder routes for `/`, `/monitor`, `/history`, `/approval/[runId]`
- FE-008: Added SSE proxy route scaffold at `src/app/api/stream/[runId]/route.ts`
- FE-001 / FE-002: Added contract types/guards and shared UI interface types
- FE-003: Added backend gap documentation at `frontend/notes/backend-gaps.md`
- FE-009 / FE-010: Added SSE parser/reducer and `useAgentStream` hook; `/monitor` now uses hook-based client panel
- FE-011: Added hook tests for SSE parsing, tokens, malformed payloads, and cleanup
- FE-012 / FE-013: Added reusable `AgentProgressBoard` component + component tests, and integrated it into monitor scaffold
- FE-012A: Applied Ant Design-style theme classes to `AgentProgressBoard`
- FE-014 / FE-014A / FE-015: Built `ApprovalPack` with summary + score + artifacts + diff viewer + file tree, plus tests
- FE-016 / FE-017: Built `ApprovalButtons` (approve/reject dialog flow) and tests
- FE-018 / FE-019: Built `FeedbackBar` and tests
- FE-021 / FE-022 / FE-024: Integrated monitor + approval pages and history scaffold pages
- FE-020 / FE-020A / FE-023: Built themed `StreamingChat`, added tests, and wired homepage integration
- FE-025 / FE-025A: Added shared state wrappers (`PageEmptyState`, `PageErrorState`, `PageLoadingState`, `SectionShell`) and reused them across pages/components
- FE-026: Coverage thresholds pass (`npm run test:coverage` => lines/functions/branches >= 70%)
- FE-028 (partial): Added `frontend/README.md` with setup/run/test/env/known gaps + QA checklist
- FE-027: Responsive + accessibility smoke pass completed (focus-visible states, mobile nav stacking, light-theme contrast cleanup)
- FE-028: Final handoff docs completed and synced (README + task list + implementation notes)
- Verified `npm run test:run`, `npm run lint`, and `npm run build`

### In Progress
- None

### Next Steps
1. Backend contract alignment for approval/history APIs when specs are available
2. Replace approval mock data with real API fetch integration
3. Optional cleanup: rename `.or-*` utility prefix to neutral prefix if desired

### Blockers
- Backend contract for approve/reject/feedback endpoints still missing

### Decisions Made
- Scaffolded using `create-next-app` in temp folder and merged into `frontend/` to preserve existing spec/handoff files
- Used `src/app` structure and imported `src/styles/ant-theme.css` via `src/app/globals.css`

### Notes
- `turbopack.root` is set in `next.config.ts`; `next build` no longer shows the workspace-root warning.
- `shadcn/ui` init updated `src/app/globals.css`; theme tokens were re-aligned to the Ant Design-style palette afterward.
- Theme direction request changed from OpenRouter-style to Ant Design-style (`https://ant.design/`) and tracking/docs were updated.
- Theme file has been renamed from `openrouter-theme.css` to `ant-theme.css`.
- `npm run test:coverage` passes. ESLint ignores `coverage/**` to avoid generated-file warnings.
- `ApprovalPack` currently uses mock data on `/approval/[runId]` (intentional until backend fetch contract is defined).
