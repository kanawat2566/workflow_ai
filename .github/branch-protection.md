# Branch Protection Rules
ตั้งค่านี้ใน GitHub → Settings → Branches

## Branch: `main`
```
✅ Require pull request before merging
✅ Require 1 approval
✅ Require status checks to pass:
   - CI — .NET Parser (ถ้า parser-dotnet เปลี่ยน)
   - CI — Python Services (ถ้า services เปลี่ยน)
   - CI — Next.js Frontend (ถ้า frontend เปลี่ยน)
   - CI — Validate Shared Contracts (ถ้า contracts เปลี่ยน)
✅ Require branches to be up to date
❌ Allow force pushes — ห้าม
❌ Allow deletions — ห้าม
```

## Branch: `develop`
```
✅ Require pull request before merging
✅ Require status checks to pass (same as main)
✅ Allow squash merge
```

## Branch Naming Convention
```
feat/parser-dotnet     ← AI Agent 1 branch
feat/rag-service       ← AI Agent 2 branch
feat/orchestrator      ← AI Agent 3 branch
feat/executor-eval     ← AI Agent 4 branch
feat/gateway-memory    ← AI Agent 5 branch
feat/frontend          ← AI Agent 6 branch
feat/infra             ← AI Agent 7 branch
fix/<description>      ← bug fixes
chore/<description>    ← maintenance
```
