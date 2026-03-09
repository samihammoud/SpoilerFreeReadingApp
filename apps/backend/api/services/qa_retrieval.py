from __future__ import annotations

from typing import Any

from langchain_core.language_models.chat_models import BaseChatModel

from .retrieval import get_top_match


def build_qa_prompt(context: str, question: str, chapter: str | None) -> str:
    chapter_context = chapter or "unknown"
    return f"""You are a retrieval question-answering assistant.
Use only the Retrieved quote to answer the Question.
If the quote does not contain enough relevant information, reply exactly:
\"I couldn't find a suitable quote for that question.\"
When useful, use the chapter metadata to answer time/order questions.

Retrieved quote:
{context}

Retrieved chapter:
{chapter_context}

Question:
{question}

Return only the final answer."""


async def answer_with_qa_retrieval(
    *,
    question: str,
    collection_id: str | None,
    embedding_model: Any,
    chat_model: BaseChatModel,
) -> dict[str, Any]:
    top_match = await get_top_match(
        question=question,
        embedding_model=embedding_model,
        chat_model=chat_model,
        collection_id=collection_id,
    )
    context = top_match["document"] if top_match else "No matching quote was retrieved."
    metadata = top_match.get("metadata") if top_match else {}
    chapter = metadata.get("chapter") if isinstance(metadata, dict) else None
    prompt = build_qa_prompt(context=context, question=question, chapter=chapter)

    response = await chat_model.ainvoke(prompt)
    content = response.content
    answer = content if isinstance(content, str) else str(content)
    return {
        "context": context,
        "answer": answer,
        "metadata": {
            "chapter": chapter,
        },
    }


#Different cases for WHEN Questions
#Different cases for WHO Questions


#Within one and done,Where does this scene occur
    #different type of retrieval, retrieve the first occurences that mentions this scene.
    #from prompt, then take into account

    #protect against foreshadowing

#implement caching to save money
#local model implementation