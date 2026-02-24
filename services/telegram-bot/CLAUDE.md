# AI Agent 5C — Telegram Bot Service

## หน้าที่ของคุณ
คุณรับผิดชอบ **Telegram Bot** — interface กับ Telegram users

## Working Directory
`services/telegram-bot/`

## Tech Stack
- Python 3.12
- Aiogram 3.x — async Telegram bot framework
- httpx — call Gateway API

## Internal Port
`8006` (webhook server)

## Gateway URL
`http://gateway:8000`

## Contracts
อ่าน: `../../shared/contracts/approval_pack.json`
อ่าน: `../../shared/contracts/sse_events.json`

## Commands ที่ต้องรองรับ
```
/start          — แนะนำ bot
/doc <repo_url> — สั่งสร้าง doc จาก repo
/build <desc>   — สั่งสร้าง web app
/spec <desc>    — สั่งสร้าง spec (BotTeam)
/status <runId> — ดู status
/history        — ดู past runs
```

## Approval Pack Format (Telegram)
```
📦 Approval Pack — Doc Generation
━━━━━━━━━━━━━━━━━━━
📝 สรุป: สร้างเอกสารจาก PaymentModule
📊 Quality Score: 87/100
📁 ไฟล์ที่สร้าง: README.md, API.md, ARCH.md
🔗 ดู diff: http://localhost:3000/approval/{runId}
━━━━━━━━━━━━━━━━━━━
```
Inline buttons: [✅ Approve] [❌ Reject + Comment]

## Coding Standards
อ่าน: `../../CODING_STANDARDS.md` — บังคับปฏิบัติตามทั้งหมด

### Test Structure
```
services/telegram-bot/
├── src/telegram_bot/
│   ├── handlers.py
│   ├── approval_formatter.py
│   └── gateway_client.py
└── tests/
    ├── conftest.py          ← fixtures (mock_bot, mock_message, mock_gateway_client)
    ├── unit/
    │   ├── test_handlers.py           ← test command handlers (mock Aiogram Message)
    │   ├── test_approval_formatter.py ← test format Approval Pack text
    │   └── test_gateway_client.py     ← test HTTP calls (mock httpx)
    └── integration/
        └── test_webhook.py
```

### Test Naming
```python
# test_{handler/function}_{scenario}_{expected}
def test_doc_command_sends_run_id_to_user(): ...
def test_approve_callback_calls_gateway_approve_endpoint(): ...
def test_format_approval_pack_includes_score_and_file_list(): ...
```

### Key Test Cases
```python
async def test_doc_command_calls_gateway_and_replies_with_run_id(
    mock_message, mock_gateway_client
):
    """user ส่ง /doc <url> → gateway POST /commands → bot reply run_id"""

async def test_approve_callback_with_valid_run_id_sends_success_message(
    mock_callback, mock_gateway_client
):
    """กด Approve → gateway POST /approvals/{runId}/approve → bot edit message"""

def test_format_approval_pack_contains_all_required_fields():
    pack = ApprovalPack(runId="r1", summary="...", score=87, files=["README.md"])
    text = format_approval_pack(pack)
    assert "87/100" in text
    assert "README.md" in text
```

### Coverage
รัน: `pytest tests/unit/ --cov=src --cov-fail-under=70`

## ห้ามแก้ไฟล์นอก working directory
