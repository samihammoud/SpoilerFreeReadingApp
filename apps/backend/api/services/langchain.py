from __future__ import annotations

import os
from typing import Any

from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from .llm import get_openai_async_client, get_openai_client
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


def build_prompt(context: str, question: str) -> str:
    return f"""You are a retrieval QA assistant.

If the quote does not contain enough relevant information, reply exactly:
"I couldn't find a suitable quote for that question."

Retrieved quote:
{context}

Question:
{question}

Return only the final answer."""



async def ask_with_langchain(question: str, collection_id: str | None = None) -> str:
    active_collection_id = collection_id or DEFAULT_COLLECTION_ID
    top_match = await get_top_match(
        question=question,
        collection_id=active_collection_id,
    )
    context = top_match["document"] if top_match else "No matching quote was retrieved."
    prompt = build_prompt(context, question)

    response = await chat_model.ainvoke(prompt)
    content = response.content
    return content if isinstance(content, str) else str(content)


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
