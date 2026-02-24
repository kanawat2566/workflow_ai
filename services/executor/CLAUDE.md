# AI Agent 4A — Executor Service

## หน้าที่ของคุณ
คุณรับผิดชอบ **Executor Service** — ทำงานจริงกับ file system และ Git

## Working Directory
`services/executor/`

## Tech Stack
- Python 3.12
- FastAPI + Uvicorn
- GitPython — git operations
- PyGithub — GitHub PR creation
- python-gitlab — GitLab support
- Jinja2 — doc template rendering
- Docker SDK (python-on-whales) — build/test runner

## Internal Port
`8004`

## Contracts

### Input
อ่าน: `../../shared/contracts/approval_pack.json`

### Output
อ่าน: `../../shared/contracts/artifact_schema.json`

## Endpoints ที่ต้องสร้าง
```
POST /tools/generateDocs
  body: { runId, workspace, templates, scope, chunks }
  return: ArtifactResult

POST /tools/fixDocs
  body: { runId, workspace, issues: string[] }
  return: ArtifactResult

POST /tools/scaffold
  body: { runId, projectType, name, spec }
  return: ArtifactResult

POST /tools/implement
  body: { runId, workspace, spec, chunks }
  return: ArtifactResult

POST /tools/generateTests
  body: { runId, workspace }
  return: ArtifactResult

POST /tools/createPR
  body: { runId, workspace, branch, title, body }
  return: { prUrl, commitHash, branch }

POST /tools/build
  body: { runId, workspace, command }
  return: { success, logs, exitCode }

GET /health
```

## Workspace Path
`/workspace/{runId}/` — shared volume กับ services อื่น

## Templates Location
`/app/templates/` → mount จาก `shared/templates/`
```
templates/
├── README.md.j2
├── API.md.j2
├── ARCH.md.j2
└── RUNBOOK.md.j2
```

## ห้ามแก้ไฟล์นอก working directory
