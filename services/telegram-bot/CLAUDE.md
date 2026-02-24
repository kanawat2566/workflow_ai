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

## ห้ามแก้ไฟล์นอก working directory
