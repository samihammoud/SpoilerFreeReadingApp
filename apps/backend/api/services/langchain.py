from __future__ import annotations

import os
from typing import Any

from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from .chroma_service import get_chroma_service
from .llm import get_openai_async_client, get_openai_client

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
    return f"""You are a book-reading assistant that helps users understand the content of books by answering 
    questions. Use the following retrieved quote to answer the question. If the quote 
    does not contain relevant information, say you don't know. Add addition information about what the quote
    could mean in relation to the user's question.


Retrieved quote: {context}

Question:
{question}"""


async def ask_with_langchain(question: str, collection_id: str | None = None) -> str:
    active_collection_id = collection_id
    top_match = await get_top_match(question=question, collection_id=active_collection_id)
    context = top_match["document"] if top_match else "No matching quote was retrieved."
    prompt = build_prompt(context, question)

    response = await chat_model.ainvoke(prompt)
    content = response.content
    return content if isinstance(content, str) else str(content)


async def get_top_match(question: str, collection_id: str) -> dict[str, Any] | None:
    query_embedding = await embedding_model.aembed_query(question)
    matches = get_chroma_service().query_similar_embeddings(
        collection_id=collection_id,
        query_embedding=query_embedding,
        limit=1,
    )

    if not matches:
        return None

    doc = matches[0]
    return {
        "document": doc.get("document"),
        "metadata": doc.get("metadata"),
    }
