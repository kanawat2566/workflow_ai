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

## Coding Standards
อ่าน: `../../CODING_STANDARDS.md` — บังคับปฏิบัติตามทั้งหมด

### Test Structure
```
services/executor/
├── src/executor/
│   ├── doc_generator.py
│   ├── git_ops.py
│   ├── scaffolder.py
│   └── build_runner.py
└── tests/
    ├── conftest.py          ← fixtures (tmp_workspace, mock_git_repo, mock_github_client)
    ├── unit/
    │   ├── test_doc_generator.py  ← test Jinja2 rendering (ใช้ tmp_path)
    │   ├── test_git_ops.py        ← test git commit/push (mock GitPython)
    │   └── test_scaffolder.py     ← test project scaffold (ใช้ tmp_path)
    └── integration/
        └── test_executor_api.py
```

### Test Naming
```python
# test_{function}_{scenario}_{expected}
def test_generate_readme_with_chunks_produces_all_sections(): ...
def test_create_pr_with_valid_token_returns_pr_url(): ...
def test_scaffold_nextjs_creates_correct_file_structure(): ...
```

### Key Test Cases
```python
def test_render_readme_template_includes_all_endpoints(tmp_path):
    """Jinja2 template + chunk data → README.md มีครบทุก endpoint"""

async def test_git_commit_uses_correct_author_from_env(mock_repo):
    """GITHUB_TOKEN env var ถูกใช้ authenticate"""

def test_generate_docs_raises_when_template_missing(tmp_path):
    """template ไม่มี → TemplateNotFoundError"""
```

### Coverage
รัน: `pytest tests/unit/ --cov=src --cov-fail-under=70`

## ห้ามแก้ไฟล์นอก working directory
