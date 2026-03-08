from __future__ import annotations

import re
from typing import Any

from langchain_core.language_models.chat_models import BaseChatModel


def build_rerank_prompt(question: str, matches: list[dict[str, Any]]) -> str:
    candidates: list[str] = []
    for index, match in enumerate(matches, start=1):
        raw_document = match.get("document")
        document = raw_document if isinstance(raw_document, str) else ""
        compact_document = " ".join(document.split())
        preview = compact_document[:1200]
        candidates.append(f"{index}. {preview}")

    candidate_block = "\n".join(candidates)
    return f"""You are ranking retrieved quotes for relevance to a question.
Pick the single best candidate and reply with only its number.

Question:
{question}

Candidates:
{candidate_block}
"""


def parse_rerank_index(raw_output: str, total_matches: int) -> int | None:
    match = re.search(r"\d+", raw_output)
    if not match:
        return None

    index = int(match.group()) - 1
    if index < 0 or index >= total_matches:
        return None
    return index


async def rerank_matches_by_question(
    question: str,
    matches: list[dict[str, Any]],
    *,
    chat_model: BaseChatModel,
) -> dict[str, Any] | None:
    if not matches:
        return None
    if len(matches) == 1:
        return matches[0]

    rerank_prompt = build_rerank_prompt(question=question, matches=matches)
    response = await chat_model.ainvoke(rerank_prompt)
    content = response.content
    output_text = content if isinstance(content, str) else str(content)

    index = parse_rerank_index(raw_output=output_text, total_matches=len(matches))
    if index is None:
        return matches[0]
    return matches[index]
