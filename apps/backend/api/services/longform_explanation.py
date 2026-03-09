from __future__ import annotations

import re
from typing import Any

from langchain_core.language_models.chat_models import BaseChatModel

from .retrieval import get_top_12_matches


def build_longform_query_prompt(question: str) -> str:
    return f"""Create retrieval queries for a longform explanation request.

Return exactly three lines:
Q1: <query>
Q2: <query>
Q3: <query>

Question:
{question}
"""


def parse_longform_queries(raw_output: str, question: str) -> list[str]:
    queries: list[str] = []
    for line in raw_output.splitlines():
        lowered = line.strip().lower()
        if lowered.startswith("q1:") or lowered.startswith("q2:") or lowered.startswith("q3:"):
            candidate = line.split(":", 1)[1].strip()
            if candidate:
                queries.append(candidate)
    if question not in queries:
        queries.insert(0, question)
    # Keep unique, preserve order
    seen: set[str] = set()
    deduped: list[str] = []
    for query in queries:
        key = query.strip().lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(query)
    return deduped[:4]


def _chapter_sort_key(chapter: Any) -> tuple[int, str]:
    if not isinstance(chapter, str):
        return (10**9, "")
    match = re.search(r"\d+", chapter)
    if not match:
        return (10**9, chapter.lower())
    return (int(match.group()), chapter.lower())


def merge_matches(match_groups: list[list[dict[str, Any]]]) -> list[dict[str, Any]]:
    merged: list[dict[str, Any]] = []
    seen: set[tuple[Any, Any, Any]] = set()
    for group in match_groups:
        for item in group:
            metadata = item.get("metadata") or {}
            key = (
                item.get("document"),
                metadata.get("chapter"),
                metadata.get("chunkIndex"),
            )
            if key in seen:
                continue
            seen.add(key)
            merged.append(item)
    return merged


def build_timeline_context(matches: list[dict[str, Any]]) -> str:
    if not matches:
        return "No source context retrieved."

    ordered_matches = sorted(
        matches,
        key=lambda item: (
            _chapter_sort_key((item.get("metadata") or {}).get("chapter")),
            (item.get("metadata") or {}).get("chunkIndex", 10**9),
        ),
    )

    lines: list[str] = []
    for index, match in enumerate(ordered_matches, start=1):
        metadata = match.get("metadata") or {}
        chapter = metadata.get("chapter", "unknown")
        chunk_index = metadata.get("chunkIndex", "unknown")
        document = match.get("document") if isinstance(match.get("document"), str) else ""
        compact_document = " ".join(document.split())
        excerpt = compact_document[:500]
        lines.append(f"{index}. chapter={chapter}, chunk={chunk_index}, excerpt={excerpt}")

    return "\n".join(lines)


def build_longform_prompt(question: str, timeline_context: str) -> str:
    return f"""You are a longform retrieval explanation assistant.
Use only the Timeline context below.

Task:
1) Identify relevant chapter progression.
2) Provide a chronological explanation.
3) Give a short conclusion.
4) If context is insufficient, reply exactly:
\"I couldn't find enough relevant context to explain this request.\"

Output format:
Relevant chapters: <comma-separated chapters>
Explanation timeline:
- <point 1>
- <point 2>
Conclusion: <2-4 sentences>

Question:
{question}

Timeline context:
{timeline_context}
"""


async def answer_with_longform_explanation(
    *,
    question: str,
    collection_id: str | None,
    embedding_model: Any,
    chat_model: BaseChatModel,
) -> str:
    query_response = await chat_model.ainvoke(build_longform_query_prompt(question=question))
    query_content = query_response.content
    query_text = query_content if isinstance(query_content, str) else str(query_content)
    queries = parse_longform_queries(raw_output=query_text, question=question)

    match_groups: list[list[dict[str, Any]]] = []
    for query in queries:
        matches = await get_top_12_matches(
            question=query,
            collection_id=collection_id or "default",
            embedding_model=embedding_model,
        )
        match_groups.append(matches)

    merged = merge_matches(match_groups)
    if not merged:
        return "I couldn't find enough relevant context to explain this request."

    timeline_context = build_timeline_context(merged)
    prompt = build_longform_prompt(question=question, timeline_context=timeline_context)

    response = await chat_model.ainvoke(prompt)
    content = response.content
    return content if isinstance(content, str) else str(content)
