#!/bin/bash
# Pre-commit hook: ESLint + TypeScript check
# Usage: hook_frontend.sh eslint|tsc
TOOL=$1
if [ ! -f "frontend/node_modules/.bin/eslint" ]; then
  echo "frontend deps not installed — skipping (cd frontend && npm ci)"
  exit 0
fi
cd frontend
if [ "$TOOL" = "eslint" ]; then
  npx eslint --max-warnings=0 .
elif [ "$TOOL" = "tsc" ]; then
  npx tsc --noEmit
fi
