#!/bin/bash
# Pre-commit hook: run pyright on changed service
# Usage: hook_pyright.sh <service_name>
SERVICE=$1
if command -v pyright >/dev/null 2>&1; then
  cd "services/$SERVICE" && pyright --pythonversion 3.12 .
else
  echo "pyright not installed — skipping (pip install pyright)"
fi
