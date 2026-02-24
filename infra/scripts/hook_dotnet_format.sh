#!/bin/bash
# Pre-commit hook: dotnet format check
if command -v dotnet >/dev/null 2>&1; then
  cd services/parser-dotnet && dotnet format --verify-no-changes --severity warn
else
  echo "dotnet not installed — skipping"
fi
