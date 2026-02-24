# Backend Contract Gaps (Frontend Integration)

Last Updated: 2026-02-24

## Purpose
Document missing backend API contracts that block full frontend integration for approval actions and history data.

## Missing Contracts

### 1) Approval Actions
Frontend components need explicit endpoint contracts for:
- Approve approval pack
- Reject approval pack with comment
- Submit feedback rating/notes

Required details:
- HTTP method and path
- Request body schema
- Response schema
- Error response schema
- Idempotency/retry behavior
- Auth requirements (if any)

### 2) Approval Pack Fetch API
Route `/approval/[runId]` needs a contract for fetching the full approval pack by `runId`.

Required details:
- Endpoint path and method
- Whether `approval_pack.json` maps 1:1 to response payload
- Not found behavior
- Polling vs one-time fetch expectations

### 3) History API
Route `/history` is currently scaffolded and needs:
- List endpoint path/method
- Pagination shape
- Filter/sort options
- Response fields (summary rows vs full approval pack)

## Current Frontend Placeholder Policy
- `ApprovalButtons` and `FeedbackBar` should remain callback-based until endpoints are defined.
- Page-level handlers may use stub functions/TODO markers.
- `/history` uses placeholder/mock rows and must not be treated as production-ready.

## SSE Status
- SSE proxy route scaffold exists at `src/app/api/stream/[runId]/route.ts`
- `useAgentStream` hook consumes `/api/stream/{runId}`
- Event payload parsing follows `shared/contracts/sse_events.json`
