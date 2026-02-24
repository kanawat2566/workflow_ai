#!/usr/bin/env python3
"""Validate all shared/contracts files."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent

errors = []

# 1. Validate JSON files parse correctly
json_files = [
    "shared/contracts/chunk_schema.json",
    "shared/contracts/retrieve_schema.json",
    "shared/contracts/sse_events.json",
    "shared/contracts/approval_pack.json",
    "shared/contracts/artifact_schema.json",
    "shared/contracts/ports.json",
]

for path in json_files:
    try:
        json.load(open(ROOT / path, encoding="utf-8"))
        print(f"OK  {path}")
    except Exception as e:
        print(f"FAIL {path} — {e}")
        errors.append(path)

# 2. Validate no duplicate ports
try:
    data = json.load(open(ROOT / "shared/contracts/ports.json", encoding="utf-8"))
    all_ports = list(data["services"].values()) + list(data["infrastructure"].values())
    dupes = [p for p in set(all_ports) if all_ports.count(p) > 1]
    if dupes:
        print(f"FAIL ports.json — duplicate ports: {dupes}")
        errors.append("ports.json duplicate")
    else:
        print("OK  ports.json — all ports unique")
except Exception as e:
    print(f"FAIL ports.json — {e}")
    errors.append("ports.json")

# 3. Validate agent_state.py syntax
try:
    import py_compile
    py_compile.compile(str(ROOT / "shared/contracts/agent_state.py"), doraise=True)
    print("OK  shared/contracts/agent_state.py")
except py_compile.PyCompileError as e:
    print(f"FAIL shared/contracts/agent_state.py — {e}")
    errors.append("agent_state.py")

if errors:
    print(f"\n{len(errors)} error(s) found.")
    sys.exit(1)

print("\nAll contracts valid.")
