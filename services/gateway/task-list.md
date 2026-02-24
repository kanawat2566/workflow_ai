# Gateway Implementation Task List

This file lists actionable tasks to implement the Gateway service described in `CLAUDE.md`.

1. Create `services/gateway/Dockerfile` (Python 3.12 base, install deps, expose 8000).
2. Add `services/gateway/requirements.txt` with: fastapi, uvicorn[standard], httpx, redis, pydantic.
3. Add `services/gateway/README.md` documenting env vars: `ORCHESTRATOR_URL`, `VALKEY_URL`, `VALKEY_CHANNEL_PREFIX` and local run instructions.
4. Add `services/gateway/app/__init__.py` to make package importable.
5. Add `services/gateway/app/config.py` to load and validate env vars and defaults.
6. Add `services/gateway/app/schemas.py` with Pydantic models for requests/responses (commands, approvals, feedback).
7. Add `services/gateway/app/valkey_client.py` — thin async wrapper around `redis.asyncio` for pub/sub.
8. Add `services/gateway/app/main.py` with a minimal FastAPI app, endpoints: `GET /health`, `POST /commands`, `POST /approvals/{runId}/approve`, `POST /approvals/{runId}/reject`, `POST /feedback/{runId}`, `GET /run/{runId}`, and `GET /stream/{runId}` (SSE proxy).
9. Implement basic forwarding of `/commands` to `ORCHESTRATOR_URL` using `httpx.AsyncClient`.
10. Implement SSE proxy: subscribe to Valkey channel `sse:{runId}` and forward messages using SSE framing (`data: <json>\n\n`).
11. Add graceful startup/shutdown to initialize `httpx` and `redis` clients.
12. Add basic logging and consistent error responses in `app/main.py`.
13. Add unit tests scaffold under `services/gateway/tests/` (health, commands, approvals, feedback, run). (deferred)
14. Ensure `docker-compose.yml` mounts `./shared/contracts:/app/contracts:ro` and `gateway` service is configured to build from `services/gateway` (verify and update).
15. Add runtime toggle to validate messages against `shared/contracts/*.json` at runtime (optional).

Next steps:
- Implement the files above (scaffolded here).
- Run tests and iterate.
