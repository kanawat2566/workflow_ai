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

## Coding Standards
อ่าน: `../../CODING_STANDARDS.md` — บังคับปฏิบัติตามทั้งหมด

### Test Structure
```
services/evaluator/
├── src/evaluator/
│   ├── doc_evaluator.py
│   ├── code_evaluator.py
│   └── score_calculator.py
└── tests/
    ├── conftest.py          ← fixtures (mock_llm_client, sample_artifacts, sample_rules)
    ├── unit/
    │   ├── test_score_calculator.py   ← test pure score math (no mock needed)
    │   ├── test_doc_evaluator.py      ← test section detection (mock LLM)
    │   └── test_code_evaluator.py     ← test lint/coverage parsing
    └── integration/
        └── test_evaluate_api.py
```

### Test Naming
```python
# test_{function}_{scenario}_{expected}
def test_calculate_score_with_3_missing_sections_returns_70(): ...
def test_evaluate_docs_when_section_empty_deducts_points(): ...
def test_evaluate_docs_when_all_sections_complete_returns_passed(): ...
```

### Key Test Cases
```python
def test_score_calculator_with_no_issues_returns_100():
    """score = 100 เมื่อไม่มี missing/empty sections"""

def test_score_calculator_below_75_returns_not_passed():
    """score < 75 → passed = False"""

async def test_doc_evaluator_detects_missing_api_section(mock_llm):
    """artifact ไม่มี API Endpoints section → issues มี 'missing_api_section'"""
```

### Score Logic Test (pure function — ไม่ต้อง mock)
```python
@pytest.mark.parametrize("missing,empty,endpoints,expected_score,expected_passed", [
    (0, 0, 0, 100, True),
    (2, 1, 3, 65, False),   # 100 - 20 - 5 - 9 = 66 → ปัดลง
    (5, 0, 0, 50, False),
])
def test_calculate_score_parametrized(missing, empty, endpoints, expected_score, expected_passed):
    result = calculate_score(missing, empty, endpoints)
    assert result.score == expected_score
    assert result.passed == expected_passed
```

### Coverage
รัน: `pytest tests/unit/ --cov=src --cov-fail-under=70`

## ห้ามแก้ไฟล์นอก working directory
