import hashlib
import importlib.util
from pathlib import Path
from typing import Any

from db.chroma import get_or_create_collection, list_collection_ids
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field

APP_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = APP_DIR.parent
INGEST_SCRIPT_PATH = BACKEND_ROOT / "data-ingestion" / "ingest.py"

load_dotenv(BACKEND_ROOT / ".env")

app = FastAPI(title="chapter-and-verse-api")
openai_client = OpenAI()


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

@app.post("/embed")
# Ingest a PDF, generate embeddings for all chunks, and upsert them into a collection.
def embed_pdf(payload: EmbedRequest):
    resolved_path = resolve_file_path(payload.filePath)
    if not resolved_path.exists() or not resolved_path.is_file():
        raise HTTPException(status_code=400, detail="filePath does not exist")

    result = run_ingestion_pipeline(
        file_path=resolved_path,
        collection_id=payload.collectionId,
        chunk_size=payload.chunkSize,
    )
    return {"status": "completed", **result}


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
    return {"collectionIds": list_collection_ids()}


@app.post("/collections", status_code=201)
# Create a collection if it does not exist and return its ID.
def create_collection(payload: CreateCollectionRequest) -> dict[str, Any]:
    collection = get_or_create_collection(payload.collectionId)
    return {"collectionId": collection.name}


@app.get("/collections/{collection_id}")
# Fetch metadata for a specific collection.
def get_collection(collection_id: str) -> dict[str, Any]:
    collection = get_or_create_collection(collection_id)
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
    collection = get_or_create_collection(collection_id)
    collection.upsert(
        ids=[payload.id],
        embeddings=[payload.embedding],
        documents=[payload.document],
        metadatas=[payload.metadata],
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


# Execute the full ingestion pipeline from PDF chunks to vector upsert.
def run_ingestion_pipeline(
    *, file_path: Path, collection_id: str, chunk_size: int
) -> dict[str, Any]:
    collection = get_or_create_collection(collection_id)
    chapter_chunk_map = run_ingest(file_path=file_path, chunk_size=chunk_size)
    records = flatten_chunk_map(chapter_chunk_map=chapter_chunk_map, file_path=file_path)

    if not records:
        return {
            "collectionId": collection_id,
            "filePath": str(file_path),
            "totalChunks": 0,
            "upsertedChunks": 0,
        }

    embeddings = create_embeddings([record["document"] for record in records])

    if len(embeddings) != len(records):
        raise HTTPException(
            status_code=500,
            detail="Embedding response count did not match record count",
        )

    collection.upsert(
        ids=[record["id"] for record in records],
        embeddings=embeddings,
        documents=[record["document"] for record in records],
        metadatas=[record["metadata"] for record in records],
    )

    return {
        "collectionId": collection_id,
        "filePath": str(file_path),
        "totalChunks": len(records),
        "upsertedChunks": len(records),
    }


# Create embeddings for a list of text chunks using OpenAI embeddings API.
def create_embeddings(inputs: list[str]) -> list[list[float]]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=inputs,
        encoding_format="float",
    )
    return [item.embedding for item in response.data]


# Dynamically load ingest.py and convert a PDF file into chapter-based chunks.
def run_ingest(*, file_path: Path, chunk_size: int) -> dict[str, list[str]]:
    module_name = "chapter_and_verse_ingest"
    spec = importlib.util.spec_from_file_location(module_name, INGEST_SCRIPT_PATH)
    if spec is None or spec.loader is None:
        raise HTTPException(status_code=500, detail="Failed to load ingest.py")

    ingest_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ingest_module)

    try:
        return ingest_module.pdfToChunks(str(file_path), chunk_size=chunk_size)
    except Exception as error:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {error}") from error


# Resolve and validate file paths so input stays within the backend directory.
def resolve_file_path(input_path: str) -> Path:
    raw = Path(input_path.strip())
    resolved = raw.resolve() if raw.is_absolute() else (APP_DIR / raw).resolve()

    try:
        resolved.relative_to(BACKEND_ROOT)
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Invalid file path") from error

    return resolved


# Flatten chapter chunk output into records with stable IDs and metadata for storage.
def flatten_chunk_map(
    *, chapter_chunk_map: dict[str, list[str]], file_path: Path
) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    source_file_name = file_path.name

    for chapter, chunks in (chapter_chunk_map or {}).items():
        if not isinstance(chunks, list):
            continue

        for index, chunk in enumerate(chunks):
            if not isinstance(chunk, str) or not chunk.strip():
                continue

            digest = hashlib.sha1(
                f"{source_file_name}|{chapter}|{index}|{chunk}".encode("utf-8")
            ).hexdigest()[:16]

            records.append(
                {
                    "id": f"{source_file_name}:{chapter}:{index}:{digest}",
                    "document": chunk,
                    "metadata": {
                        "chapter": chapter,
                        "chunkIndex": index,
                        "sourceFileName": source_file_name,
                        "sourcePath": str(file_path),
                    },
                }
            )

    return records
