from __future__ import annotations

import os

from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from .llm import get_openai_async_client, get_openai_client
from .retrieval import get_top_match

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
    top_match = await get_top_match(
        question=question,
        embedding_model=embedding_model,
        chat_model=chat_model,
        collection_id=active_collection_id,
    )
    context = top_match["document"] if top_match else "No matching quote was retrieved."
    prompt = build_prompt(context, question)

    response = await chat_model.ainvoke(prompt)
    content = response.content
    return content if isinstance(content, str) else str(content)

