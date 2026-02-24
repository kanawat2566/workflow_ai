#!/usr/bin/env python3
"""Validate sample parser output against chunk_schema.json."""

import json
import os
import sys
from pathlib import Path

import jsonschema


def load_schema() -> dict:
    schema_path = os.environ.get("SCHEMA_PATH")
    if not schema_path:
        raise RuntimeError("SCHEMA_PATH env var not set")
    return json.loads(Path(schema_path).read_text(encoding="utf-8"))


def make_valid_chunk() -> dict:
    return {
        "chunkId": "PaymentController.Save.POST",
        "file": "Controllers/PaymentController.cs",
        "type": "action_method",
        "content": "[HttpPost] public IActionResult Save(PaymentViewModel m) => View();",
        "metadata": {
            "controller": "PaymentController",
            "action": "Save",
            "httpMethod": "POST",
            "route": "/Payment/Save",
            "language": "csharp",
            "lineStart": 10,
            "lineEnd": 12,
        },
    }


def make_invalid_chunk() -> dict:
    return {
        "chunkId": "PaymentController.Save.POST",
        "file": "Controllers/PaymentController.cs",
        # missing required: type, content, metadata
    }


def assert_valid(schema: dict, chunk: dict, label: str) -> None:
    try:
        jsonschema.validate(chunk, schema)
        print(f"PASS  {label}")
    except jsonschema.ValidationError as exc:
        print(f"FAIL  {label}: {exc.message}")
        sys.exit(1)


def assert_invalid(schema: dict, chunk: dict, label: str) -> None:
    try:
        jsonschema.validate(chunk, schema)
        print(f"FAIL  {label} — should have been rejected")
        sys.exit(1)
    except jsonschema.ValidationError:
        print(f"PASS  {label}")


def main() -> None:
    schema = load_schema()
    assert_valid(schema, make_valid_chunk(), "valid chunk passes schema")
    assert_invalid(schema, make_invalid_chunk(), "incomplete chunk is rejected")
    print("\nAll contract checks passed.")


if __name__ == "__main__":
    main()
