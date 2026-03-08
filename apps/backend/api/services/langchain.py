from __future__ import annotations

import os
from typing import Any

from langchain_openai import ChatOpenAI, OpenAIEmbeddings


from .chroma_service import get_chroma_service
from .llm import get_openai_async_client, get_openai_client
from .reranking import rerank_matches_by_question

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


def build_prompt(context: str, question: str) -> str:
    return f"""Y Just return the retreived quote and the question exactly back to me. Don't do anything else. Just act as a mirror.


Retrieved quote: {context}

Question:
{question}"""


async def ask_with_langchain(question: str, collection_id: str | None = None) -> str:
    active_collection_id = collection_id or DEFAULT_COLLECTION_ID
    top_match = await get_top_match(question=question, collection_id=active_collection_id)
    context = top_match["document"] if top_match else "No matching quote was retrieved."
    prompt = build_prompt(context, question)

    response = await chat_model.ainvoke(prompt)
    content = response.content
    return content if isinstance(content, str) else str(content)


async def get_top_match(question: str, collection_id: str | None = None) -> dict[str, Any] | None:
    active_collection_id = collection_id or DEFAULT_COLLECTION_ID
    matches = await get_top_12_matches(question=question, collection_id=active_collection_id)
    best_match = await rerank_matches_by_question(
        question=question,
        matches=matches,
        chat_model=chat_model,
    )
    if not best_match:
        return None

    doc = best_match
    return {
        "document": doc.get("document"),
        "metadata": doc.get("metadata"),
        "embedding": doc.get("embedding"),
    }


# Return up to 12 nearest matches for a question.
async def get_top_12_matches(
    question: str, collection_id: str
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
