#!/bin/bash
# Pre-commit hook: run unit tests for changed services
for svc in gateway orchestrator rag memory executor evaluator; do
  if git diff --cached --name-only | grep -q "^services/$svc/"; then
    echo ">>> Testing $svc..."
    if [ -d "services/$svc/tests/unit" ] && [ "$(ls -A services/$svc/tests/unit 2>/dev/null)" ]; then
      cd "services/$svc" && pytest tests/unit/ -x -q --tb=short && cd ../..
    else
      echo "No unit tests yet for $svc — skipping"
    fi
  fi
done
