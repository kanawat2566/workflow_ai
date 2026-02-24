# Gateway Service

Minimal FastAPI gateway that forwards commands/approvals/feedback to the Orchestrator and proxies SSE from Valkey.

Required env vars:
- `ORCHESTRATOR_URL` e.g. `http://orchestrator:8001`
- `VALKEY_URL` e.g. `redis://valkey:6379/0`
- `VALKEY_CHANNEL_PREFIX` optional (default `sse:`)

Run locally via docker-compose (from repo root):

```bash
docker compose up --build gateway
```
