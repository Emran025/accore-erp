#!/usr/bin/env python3
"""Translate the deterministic Arabic source catalog into a resumable English catalog.

This script only translates catalog data. It never edits application source files.
Every response is validated against the requested IDs before it is persisted.
"""

import concurrent.futures
import json
import os
import re
import sys
import threading
from pathlib import Path

from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "i18n" / "catalog" / "source.json"
OUTPUT_PATH = ROOT / "i18n" / "catalog" / "en-US.json"
MODEL = "gpt-5-nano"
BATCH_SIZE = 8
MAX_WORKERS = 1

client = OpenAI()
write_lock = threading.Lock()


def placeholders(text: str) -> set[str]:
    return set(re.findall(r"\$\{[^}]+\}|\{[^}]+\}|%[a-zA-Z]", text))


def translate_batch(batch: list[dict]) -> dict[str, str]:
    prompt_items = [{"id": item["id"], "source": item["source"]} for item in batch]
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a precise enterprise software translator. Translate Arabic interface text into concise professional English. "
                    "Preserve identifiers, interpolation placeholders, markup-like tokens, numbers, currency codes, product codes, and whitespace meaning. "
                    "Do not add commentary or change business meaning. Return JSON only."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Translate every item. Output exactly an object with one property named translations. "
                    "translations must be an array of objects containing exactly id and translation. "
                    f"Items: {json.dumps(prompt_items, ensure_ascii=False)}"
                ),
            },
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "catalog_translation_batch",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "translations": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "translation": {"type": "string"},
                                },
                                "required": ["id", "translation"],
                                "additionalProperties": False,
                            },
                        },
                    },
                    "required": ["translations"],
                    "additionalProperties": False,
                },
            },
        },
        max_completion_tokens=5000,
    )
    content = response.choices[0].message.content if response.choices else None
    if not content:
        finish_reason = response.choices[0].finish_reason if response.choices else "no-choice"
        raise ValueError(f"Translation model returned no content (finish_reason={finish_reason}).")
    parsed = json.loads(content)
    if not isinstance(parsed, dict) or not isinstance(parsed.get("translations"), list):
        raise ValueError("Translation model response did not contain a translations array.")
    translated = {entry["id"]: entry["translation"].strip() for entry in parsed["translations"]}
    expected = {item["id"] for item in batch}
    if set(translated) != expected:
        missing = sorted(expected - set(translated))
        unexpected = sorted(set(translated) - expected)
        raise ValueError(f"ID mismatch: missing={missing[:5]}, unexpected={unexpected[:5]}")
    for item in batch:
        output = translated[item["id"]]
        if not output:
            raise ValueError(f"Empty translation for {item['id']}")
        if not placeholders(item["source"]).issubset(placeholders(output)):
            raise ValueError(f"Placeholder mismatch for {item['id']}")
    return translated


def persist(translations: dict[str, str]) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps({"locale": "en-US", "translations": translations}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    source = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    items = source["items"]
    existing: dict[str, str] = {}
    if OUTPUT_PATH.exists():
        existing = json.loads(OUTPUT_PATH.read_text(encoding="utf-8")).get("translations", {})
    pending = [item for item in items if item["id"] not in existing]
    print(f"i18n translation: {len(existing)} completed, {len(pending)} pending")
    if not pending:
        return 0

    batches = [pending[index:index + BATCH_SIZE] for index in range(0, len(pending), BATCH_SIZE)]
    failures: list[str] = []

    def work(batch: list[dict]) -> tuple[list[dict], dict[str, str]]:
        return batch, translate_batch(batch)

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(work, batch) for batch in batches]
        for position, future in enumerate(concurrent.futures.as_completed(futures), start=1):
            try:
                _, result = future.result()
                with write_lock:
                    existing.update(result)
                    persist(existing)
                print(f"Completed {position}/{len(batches)} batches; {len(existing)}/{len(items)} translations saved")
            except Exception as exc:  # noqa: BLE001
                failures.append(str(exc))
                print(f"Batch failed: {exc}", file=sys.stderr)

    if failures:
        print(f"Translation finished with {len(failures)} failed batches. Re-run to resume safely.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
