from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from typing import Any

import requests


@dataclass
class ChapterEnrichment:
    chapter_summary: str
    key_events: list[str]
    introduced_characters: list[str]


def _chapter_sort_key(chapter: str) -> tuple[int, str]:
    match = re.search(r"\d+", chapter)
    if not match:
        return (10**9, chapter.lower())
    return (int(match.group()), chapter.lower())


def _normalize_name(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9 ]+", "", value.lower()).strip()
    return re.sub(r"\s+", " ", normalized)


def _build_chapter_text(chunk_items: list[dict[str, Any]]) -> list[tuple[str, str]]:
    chapter_to_chunks: dict[str, list[tuple[int, str]]] = {}

    for item in chunk_items:
        chapter = item.get("chapter")
        chunk_index = item.get("chunkIndex")
        text = item.get("text")
        if not isinstance(chapter, str) or not isinstance(chunk_index, int) or not isinstance(text, str):
            continue
        if not text.strip():
            continue
        chapter_to_chunks.setdefault(chapter, []).append((chunk_index, text))

    chapters: list[tuple[str, str]] = []
    for chapter in sorted(chapter_to_chunks.keys(), key=_chapter_sort_key):
        joined = " ".join(
            text.strip()
            for _, text in sorted(chapter_to_chunks[chapter], key=lambda pair: pair[0])
            if text.strip()
        )
        if joined:
            chapters.append((chapter, joined))
    return chapters


def _parse_enrichment_response(raw: str) -> tuple[str, list[str], list[str]]:
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return ("", [], [])

    chapter_summary = payload.get("chapter_summary")
    key_events = payload.get("key_events")
    characters_mentioned = payload.get("characters_mentioned")

    summary_value = chapter_summary.strip() if isinstance(chapter_summary, str) else ""
    events_value: list[str] = []
    if isinstance(key_events, list):
        events_value = [
            event.strip()
            for event in key_events
            if isinstance(event, str) and event.strip()
        ]

    characters_value: list[str] = []
    if isinstance(characters_mentioned, list):
        characters_value = [
            character.strip()
            for character in characters_mentioned
            if isinstance(character, str) and character.strip()
        ]

    return (summary_value, events_value[:8], characters_value[:20])


def _build_prompt(*, chapter: str, chapter_text: str) -> str:
    limited_text = chapter_text[:8000]
    return f"""Extract chapter metadata as strict JSON.

Return only JSON with this exact schema:
{{
  "chapter_summary": "string",
  "key_events": ["string"],
  "characters_mentioned": ["string"]
}}

Rules:
- chapter_summary: 2 to 4 sentences, concise and factual. Refer to characters by their proper names, not generic terms such as "protagonist" or "antagonist".
- key_events: 3 to 8 bullet-style event lines, chronological.
- characters_mentioned: include proper-name characters only, no duplicates. Do not use generic terms such as "protagonist" or "antagonist".
- Do not include markdown or commentary.

Chapter:
{chapter}

Chapter text:
{limited_text}
"""


def _query_ollama(*, model: str, prompt: str, timeout_seconds: float) -> str:
    endpoint = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/") + "/api/generate"
    response = requests.post(
        endpoint,
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.1,
            },
        },
        timeout=timeout_seconds,
    )
    response.raise_for_status()
    payload = response.json()
    value = payload.get("response")
    return value if isinstance(value, str) else ""


def enrich_chapters_with_local_llama(
    chunk_items: list[dict[str, Any]],
    *,
    model: str = "llama3.1:8b-instruct-q4_K_M",
    timeout_seconds: float = 90.0,
) -> dict[str, ChapterEnrichment]:
    chapters = _build_chapter_text(chunk_items)
    chapter_enrichment: dict[str, ChapterEnrichment] = {}
    seen_characters: set[str] = set()

    for chapter, chapter_text in chapters:
        prompt = _build_prompt(chapter=chapter, chapter_text=chapter_text)
        raw = _query_ollama(model=model, prompt=prompt, timeout_seconds=timeout_seconds)
        summary, events, characters = _parse_enrichment_response(raw)

        introduced: list[str] = []
        for character in characters:
            normalized = _normalize_name(character)
            if not normalized or normalized in seen_characters:
                continue
            seen_characters.add(normalized)
            introduced.append(character)

        chapter_enrichment[chapter] = ChapterEnrichment(
            chapter_summary=summary,
            key_events=events,
            introduced_characters=introduced,
        )

    return chapter_enrichment
