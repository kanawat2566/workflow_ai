from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
import asyncio
import json
import httpx

from .config import settings
from .schemas import CommandRequest, ApprovalRequest, FeedbackRequest
from .valkey_client import ValkeyClient

app = FastAPI(title="gateway")


@app.on_event("startup")
async def startup():
    app.state.http = httpx.AsyncClient(timeout=10.0)
    app.state.valkey = ValkeyClient(settings.VALKEY_URL)
    await app.state.valkey.connect()


@app.on_event("shutdown")
async def shutdown():
    try:
        await app.state.http.aclose()
    except Exception:
        pass
    try:
        await app.state.valkey.close()
    except Exception:
        pass


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/commands")
async def post_commands(cmd: CommandRequest):
    url = settings.ORCHESTRATOR_URL.rstrip("/") + settings.ORCHESTRATOR_COMMANDS_PATH
    try:
        resp = await app.state.http.post(url, json=cmd.dict())
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    try:
        data = resp.json()
    except Exception:
        data = {"status_code": resp.status_code}
    return JSONResponse(status_code=resp.status_code, content=data)


@app.post("/approvals/{run_id}/approve")
async def approve(run_id: str, body: ApprovalRequest):
    url = settings.ORCHESTRATOR_URL.rstrip("/") + f"/runs/{run_id}/approve"
    try:
        resp = await app.state.http.post(url, json=body.dict())
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    try:
        content = resp.json()
    except Exception:
        content = {"status_code": resp.status_code}
    return JSONResponse(status_code=resp.status_code, content=content)


@app.post("/approvals/{run_id}/reject")
async def reject(run_id: str, body: ApprovalRequest):
    url = settings.ORCHESTRATOR_URL.rstrip("/") + f"/runs/{run_id}/reject"
    try:
        resp = await app.state.http.post(url, json=body.dict())
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    try:
        content = resp.json()
    except Exception:
        content = {"status_code": resp.status_code}
    return JSONResponse(status_code=resp.status_code, content=content)


@app.post("/feedback/{run_id}")
async def feedback(run_id: str, body: FeedbackRequest):
    url = settings.ORCHESTRATOR_URL.rstrip("/") + f"/runs/{run_id}/feedback"
    try:
        resp = await app.state.http.post(url, json=body.dict())
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    return JSONResponse(status_code=resp.status_code, content={})


@app.get("/run/{run_id}")
async def get_run(run_id: str):
    url = settings.ORCHESTRATOR_URL.rstrip("/") + f"/runs/{run_id}"
    try:
        resp = await app.state.http.get(url)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    try:
        content = resp.json()
    except Exception:
        content = {"status_code": resp.status_code}
    return JSONResponse(status_code=resp.status_code, content=content)


@app.get("/stream/{run_id}")
async def stream(run_id: str, request: Request):
    channel = f"{settings.VALKEY_CHANNEL_PREFIX}{run_id}"

    async def event_generator():
        try:
            async for msg in app.state.valkey.subscribe_generator(channel):
                if await request.is_disconnected():
                    break
                try:
                    payload = json.dumps(msg)
                except Exception:
                    payload = str(msg)
                yield f"data: {payload}\n\n"
        except asyncio.CancelledError:
            return

    return StreamingResponse(event_generator(), media_type="text/event-stream")
