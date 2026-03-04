from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

APP_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = APP_DIR.parent
load_dotenv(BACKEND_ROOT / ".env")

from .services.chroma_service import get_chroma_service
from .services.ingestion import IngestionService
from .services.langchain import ask_with_langchain, get_top_match

app = FastAPI(title="chapter-and-verse-api")
chroma_service = get_chroma_service()
ingestion_service = IngestionService(chroma_service=chroma_service)


class EmbedRequest(BaseModel):
    filePath: str = Field(min_length=1)
    collectionId: str = Field(min_length=1)
    chunkSize: int = Field(default=1000, gt=0)


class CreateCollectionRequest(BaseModel):
    collectionId: str = Field(min_length=1)


class UpsertRequest(BaseModel):
    id: str = Field(min_length=1)
    document: str = Field(min_length=1)
    embedding: list[float] = Field(min_length=1)
    metadata: dict[str, Any] = Field(default_factory=dict)

class AskRequest(BaseModel):
    question: str = Field(min_length=1)


@app.post("/embed")
# Ingest a PDF, generate embeddings for all chunks, and upsert them into a collection.

def embed_pdf(payload: EmbedRequest):
    resolved_path = resolve_file_path(payload.filePath)
    if not resolved_path.exists() or not resolved_path.is_file():
        raise HTTPException(status_code=400, detail="filePath does not exist")

    result = ingestion_service.run_ingestion_pipeline(
        file_path=resolved_path,
        collection_id=payload.collectionId,
        chunk_size=payload.chunkSize,
    )
    return {"status": "completed", **result}


@app.post("/{collection_id}/ask")
# Answer a user question by retrieving relevant context and invoking the LLM.
async def ask_question(collection_id: str, payload: AskRequest) -> dict[str, Any]:
    answer = await ask_with_langchain(
        question=payload.question,
        collection_id=collection_id,
    )
    return {"answer": answer}


@app.post("/{collection_id}/ask/test")
# Return only the retrieved quote used as context for question answering.
async def ask_question_test(collection_id: str, payload: AskRequest) -> dict[str, Any]:
    top_match = await get_top_match(
        question=payload.question,
        collection_id=collection_id,
    )
    return {
        "retrievedQuote": top_match["document"] if top_match else None,
        "metadata": top_match["metadata"] if top_match else None,
        
        
    }



@app.get("/health")
# Return a lightweight health check for service monitoring.
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "chapter-and-verse-api",
    }


@app.get("/collections")
# List all known Chroma collection IDs.
def collections() -> dict[str, Any]:
    return {"collectionIds": chroma_service.list_collection_ids()}


@app.post("/collections", status_code=201)
# Create a collection if it does not exist and return its ID.
def create_collection(payload: CreateCollectionRequest) -> dict[str, Any]:
    collection = chroma_service.get_or_create_collection(payload.collectionId)
    return {"collectionId": collection.name}


@app.get("/collections/{collection_id}")
# Fetch metadata for a specific collection.
def get_collection(collection_id: str) -> dict[str, Any]:
    collection = chroma_service.get_or_create_collection(collection_id)
    return {
        "collection": {
            "collectionId": collection.name,
            "metadata": collection.metadata,
        }
    }


@app.post("/collections/{collection_id}/embeddings")
# Upsert a single precomputed embedding record into a collection.
def upsert_collection_embedding(
    collection_id: str, payload: UpsertRequest
) -> dict[str, Any]:
    chroma_service.upsert_embedding(
        collection_id=collection_id,
        record_id=payload.id,
        document=payload.document,
        embedding=payload.embedding,
        metadata=payload.metadata,
    )
    return {
        "ok": True,
        "collectionId": collection_id,
        "id": payload.id,
    }


@app.get("/")
# Return a simple root message for quick manual checks.
def root() -> dict[str, str]:
    return {"message": "Chapter & Verse backend is running."}


# Resolve and validate file paths so input stays within the backend directory.
def resolve_file_path(input_path: str) -> Path:
    raw = Path(input_path.strip())
    resolved = raw.resolve() if raw.is_absolute() else (APP_DIR / raw).resolve()

    try:
        resolved.relative_to(BACKEND_ROOT)
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Invalid file path") from error

    return resolved
