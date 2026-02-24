#!/usr/bin/env bash
# Validates that parser output format matches shared/contracts/chunk_schema.json
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"
SCHEMA_PATH="${REPO_ROOT}/shared/contracts/chunk_schema.json"

if [ ! -f "${SCHEMA_PATH}" ]; then
  echo "ERROR: Schema not found at ${SCHEMA_PATH}"
  exit 1
fi

echo "→ Schema: ${SCHEMA_PATH}"
echo "→ Installing jsonschema..."
python3 -m pip install jsonschema --quiet 2>&1 | grep -v "already satisfied" || true

echo "→ Running contract validation..."
SCHEMA_PATH="${SCHEMA_PATH}" python3 "${SCRIPT_DIR}/validate_chunk_schema.py"
