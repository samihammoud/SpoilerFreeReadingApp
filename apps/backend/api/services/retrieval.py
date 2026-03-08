from __future__ import annotations

import os
from typing import Any

from langchain_core.language_models.chat_models import BaseChatModel

from .chroma_service import get_chroma_service
from .reranking import rerank_matches_by_question

DEFAULT_COLLECTION_ID = os.getenv("DEFAULT_COLLECTION_ID", "default")



##uses reranking file to get top match
async def get_top_match(
    question: str,
    *,
    embedding_model: Any,
    chat_model: BaseChatModel,
    collection_id: str | None = None,
) -> dict[str, Any] | None:
    active_collection_id = collection_id or DEFAULT_COLLECTION_ID
    matches = await get_top_12_matches(
        question=question,
        collection_id=active_collection_id,
        embedding_model=embedding_model,
    )
    best_match = await rerank_matches_by_question(
        question=question,
        matches=matches,
        chat_model=chat_model,
    )
    if not best_match:
        return None

    return {
        "document": best_match.get("document"),
        "metadata": best_match.get("metadata"),
        "embedding": best_match.get("embedding"),
    }


async def get_top_12_matches(
    question: str,
    *,
    collection_id: str,
    embedding_model: Any,
) -> list[dict[str, Any]]:
    query_embedding = await embedding_model.aembed_query(question)
    matches = get_chroma_service().query_similar_embeddings(
        collection_id=collection_id,
        query_embedding=query_embedding,
        limit=12,
    )

    return [
        {
            "document": doc.get("document"),
            "metadata": doc.get("metadata"),
            "embedding": doc.get("embedding"),
        }
        for doc in matches
    ]
