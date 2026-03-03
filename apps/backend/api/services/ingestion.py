import hashlib
from pathlib import Path
from typing import Any

from data_ingestion.ingest import pdf_to_chunks
from fastapi import HTTPException
from .chroma_service import ChromaService
from .llm import create_embeddings


class IngestionService:
    def __init__(self, chroma_service: ChromaService):
        self._chroma_service = chroma_service

    # Execute the full ingestion pipeline from PDF chunks to vector upsert.
    def run_ingestion_pipeline(
        self, *, file_path: Path, collection_id: str, chunk_size: int
    ) -> dict[str, Any]:
        records = self._run_ingest(file_path=file_path, chunk_size=chunk_size)

        if not records:
            return {
                "collectionId": collection_id,
                "filePath": str(file_path),
                "totalChunks": 0,
                "upsertedChunks": 0,
            }

        embeddings = create_embeddings([record["document"] for record in records])

        try:
            upserted_chunks = self._chroma_service.upsert_records(
                collection_id=collection_id,
                records=records,
                embeddings=embeddings,
            )
        except ValueError as error:
            raise HTTPException(status_code=500, detail=str(error)) from error

        return {
            "collectionId": collection_id,
            "filePath": str(file_path),
            "totalChunks": len(records),
            "upsertedChunks": upserted_chunks,
        }

    # Convert a PDF file into chunks/format of records ready for upsert.
    def _run_ingest(self, *, file_path: Path, chunk_size: int) -> list[dict[str, Any]]:
        try:
            chunk_items = pdf_to_chunks(str(file_path), chunk_size=chunk_size)
            records: list[dict[str, Any]] = []
            source_file_name = file_path.name

            for item in chunk_items:
                chapter = item.get("chapter")
                index = item.get("chunkIndex")
                chunk = item.get("text")
                if not isinstance(chapter, str) or not isinstance(index, int):
                    continue
                if not isinstance(chunk, str) or not chunk.strip():
                    continue

                #create our own UUID to prevent duplicates across potentially multiple ingestions
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
        except Exception as error:  # noqa: BLE001
            raise HTTPException(
                status_code=500, detail=f"Ingestion failed: {error}"
            ) from error
