from __future__ import annotations

import os
from typing import Any

from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from .intent import classify_intent
from .longform_explanation import answer_with_longform_explanation
from .llm import get_openai_async_client, get_openai_client
from .qa_retrieval import answer_with_qa_retrieval
from .retrieval import (
    get_top_12_matches as retrieve_top_12_matches,
)
from .retrieval import (
    get_top_match as retrieve_top_match,
)

DEFAULT_COLLECTION_ID = os.getenv("DEFAULT_COLLECTION_ID", "default")

chat_model = ChatOpenAI(
    model="gpt-4",
    temperature=0.7,
    client=get_openai_client().chat.completions,
    async_client=get_openai_async_client().chat.completions,
)


embedding_model = OpenAIEmbeddings(
    model="text-embedding-3-small",
    client=get_openai_client().embeddings,
    async_client=get_openai_async_client().embeddings,
)


async def ask_with_langchain(question: str, collection_id: str | None = None) -> Any:
    active_collection_id = collection_id or DEFAULT_COLLECTION_ID
    intent = await classify_intent(
        question=question,
        chat_model=chat_model,
    )

    if intent == "longform_explanation":
        return await answer_with_longform_explanation(
            question=question,
            collection_id=active_collection_id,
            embedding_model=embedding_model,
            chat_model=chat_model,
        )
    return await answer_with_qa_retrieval(
        question=question,
        collection_id=active_collection_id,
        embedding_model=embedding_model,
        chat_model=chat_model,
    )


async def get_top_match(question: str, collection_id: str | None = None) -> dict[str, Any] | None:
    return await retrieve_top_match(
        question=question,
        embedding_model=embedding_model,
        chat_model=chat_model,
        collection_id=collection_id,
    )


async def get_top_12_matches(
    question: str, collection_id: str
) -> list[dict[str, Any]]:
    return await retrieve_top_12_matches(
        question=question,
        collection_id=collection_id,
        embedding_model=embedding_model,
    )
