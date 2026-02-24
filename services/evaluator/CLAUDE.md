# AI Agent 4B — Evaluator Service

## หน้าที่ของคุณ
คุณรับผิดชอบ **Evaluator Service** — Quality Gate ตรวจคุณภาพ artifacts

## Working Directory
`services/evaluator/`

## Tech Stack
- Python 3.12
- FastAPI + Uvicorn
- httpx — call OpenRouter API (LLM-as-Judge)
- OpenRouter: `deepseek/deepseek-r1-0528:free`

## Internal Port
`8005`

## Endpoints ที่ต้องสร้าง
```
POST /evaluate/docs
  body: { runId, artifacts: [{path, content}], ruleset?: string[] }
  return: { score: float, issues: string[], passed: bool, details: string }

POST /evaluate/code
  body: { runId, workspace, language }
  return: { score, lintErrors, testCoverage, securityIssues, passed }

POST /evaluate/approval-pack
  body: { runId, approvalPack }
  return: { complete: bool, missing: string[] }

GET /health
```

## Evaluation Rules (docs)
```
- ต้องมี Section: Overview, Prerequisites, API Endpoints, Database Schema
- ทุก endpoint ที่ parse ได้จาก route map ต้องมีใน API.md
- ไม่มี section ว่าง (TODO หรือ placeholder)
- มี example request/response อย่างน้อย 1 ตัวต่อ endpoint
```

## Score Calculation
```
score = 100
score -= 10 * len(missing_sections)
score -= 5  * len(empty_sections)
score -= 3  * len(missing_endpoints)
passed = score >= 75
```

## ห้ามแก้ไฟล์นอก working directory
