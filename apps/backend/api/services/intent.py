from __future__ import annotations

from typing import Literal

from langchain_core.language_models.chat_models import BaseChatModel

IntentLabel = Literal["qa_retrieval", "longform_explanation"]


def build_intent_prompt(question: str) -> str:
    return f"""Classify the user request into exactly one label:
- qa_retrieval
- longform_explanation

Use qa_retrieval for direct factual questions and quote-finding requests.
Use longform_explanation for requests that ask for summaries, character arcs, timelines, themes, or extended explanation.

Return only the label.

Question:
{question}
"""


def parse_intent(raw_output: str) -> IntentLabel:
    normalized = raw_output.strip().lower()
    if "longform_explanation" in normalized:
        return "longform_explanation"
    if "qa_retrieval" in normalized:
        return "qa_retrieval"

    longform_markers = (
        "summar",
        "timeline",
        "character arc",
        "explain",
        "overview",
        "theme",
        "progression",
    )
    if any(marker in normalized for marker in longform_markers):
        return "longform_explanation"
    return "qa_retrieval"


async def classify_intent(*, question: str, chat_model: BaseChatModel) -> IntentLabel:
    response = await chat_model.ainvoke(build_intent_prompt(question=question))
    content = response.content
    output_text = content if isinstance(content, str) else str(content)
    return parse_intent(output_text)
