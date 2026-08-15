#!/usr/bin/env python3
"""Fallback translator for missing catalog IDs.

Uses a public translation endpoint only when the primary schema-validated model
batch process has left entries unresolved. It preserves catalog placeholders and
never edits application source files.
"""

import json
import re
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "i18n" / "catalog" / "source.json"
OUTPUT_PATH = ROOT / "i18n" / "catalog" / "en-US.json"
PLACEHOLDER = re.compile(r"\{value(\d+)\}")


def request_translation(source: str) -> str:
    url = "https://api.mymemory.translated.net/get?" + urlencode({
        "q": source,
        "langpair": "ar|en",
    })
    request = Request(url, headers={"User-Agent": "Accore-ERP i18n inventory"})
    with urlopen(request, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return str(payload.get("responseData", {}).get("translatedText", ""))


def translate(source: str) -> str:
    protected = PLACEHOLDER.sub(lambda match: f"ZZZPH{match.group(1)}ZZZ", source)
    if len(protected) > 450:
        arabic_segments = sorted(set(re.findall(r"[\u0600-\u06FF][\u0600-\u06FF\s\-:()]+", protected)), key=len, reverse=True)
        translated = protected
        for segment in arabic_segments:
            replacement = request_translation(segment.strip())
            if replacement.strip() and "QUERY LENGTH LIMIT" not in replacement:
                translated = translated.replace(segment, replacement)
            time.sleep(0.3)
    else:
        translated = request_translation(protected)
    translated = re.sub(r"(?:Z+)?PH(\d+)Z+", lambda match: "{value" + match.group(1) + "}", translated, flags=re.IGNORECASE)
    if not translated.strip():
        raise ValueError("Empty fallback translation")
    if set(PLACEHOLDER.findall(source)) != set(PLACEHOLDER.findall(translated)):
        raise ValueError(f"Placeholder mismatch: {source!r} -> {translated!r}")
    return translated.strip()


def main() -> int:
    source = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    output = json.loads(OUTPUT_PATH.read_text(encoding="utf-8")) if OUTPUT_PATH.exists() else {"locale": "en-US", "translations": {}}
    translations = output.setdefault("translations", {})
    pending = [item for item in source["items"] if item["id"] not in translations]
    print(f"fallback translation: {len(pending)} pending")
    for index, item in enumerate(pending, start=1):
        translations[item["id"]] = translate(item["source"])
        if index % 10 == 0 or index == len(pending):
            OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"saved {index}/{len(pending)}")
        time.sleep(0.6)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
