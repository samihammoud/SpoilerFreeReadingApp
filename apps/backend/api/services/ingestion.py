import hashlib
import json
import os
import re
from pathlib import Path
from typing import Any

from data_ingestion.enrich_ingestion import enrich_chapters_with_local_llama
from data_ingestion.ingest import pdf_to_chunks
from fastapi import HTTPException
from .chroma_service import ChromaService
from .llm import create_embeddings


def _chapter_number(chapter: Any) -> int | None:
    if not isinstance(chapter, str):
        return None
    match = re.search(r"\d+", chapter)
    if not match:
        return None
    return int(match.group())


class IngestionService:
    def __init__(self, chroma_service: ChromaService):
        self._chroma_service = chroma_service
        self._local_enrichment_enabled = (
            os.getenv("LOCAL_LLM_ENRICHMENT_ENABLED", "false").strip().lower() == "true"
        )
        self._local_enrichment_model = os.getenv(
            "LOCAL_LLM_ENRICHMENT_MODEL", "llama3.1:8b-instruct-q4_K_M"
        )
        self._local_enrichment_timeout_seconds = float(
            os.getenv("LOCAL_LLM_ENRICHMENT_TIMEOUT_SECONDS", "90")
        )

    # Execute the full ingestion pipeline from PDF chunks to vector upsert.
    def run_ingestion_pipeline(
        self,
        *,
        file_path: Path,
        collection_id: str,
        chunk_size: int,
        max_chapter_inclusive: int | None = None,
    ) -> dict[str, Any]:
        records = self._run_ingest(
            file_path=file_path,
            chunk_size=chunk_size,
            max_chapter_inclusive=max_chapter_inclusive,
        )

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
            "maxChapterInclusive": max_chapter_inclusive,
        }

    # Convert a PDF file into chunks/format of records ready for upsert.
    def _run_ingest(
        self,
        *,
        file_path: Path,
        chunk_size: int,
        max_chapter_inclusive: int | None = None,
    ) -> list[dict[str, Any]]:
        try:
            chunk_items = pdf_to_chunks(str(file_path), chunk_size=chunk_size)
            if max_chapter_inclusive is not None:
                limited_chunk_items: list[dict[str, Any]] = []
                for item in chunk_items:
                    chapter_number = _chapter_number(item.get("chapter"))
                    if chapter_number is None:
                        continue
                    if chapter_number <= max_chapter_inclusive:
                        limited_chunk_items.append(item)
                chunk_items = limited_chunk_items
            chapter_enrichment: dict[str, Any] = {}
            if self._local_enrichment_enabled:
                try:
                    chapter_enrichment = enrich_chapters_with_local_llama(
                        chunk_items,
                        model=self._local_enrichment_model,
                        timeout_seconds=self._local_enrichment_timeout_seconds,
                    )
                except Exception:  # noqa: BLE001
                    chapter_enrichment = {}

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

                enrichment = chapter_enrichment.get(chapter)
                records.append(
                    {
                        "id": f"{source_file_name}:{chapter}:{index}:{digest}",
                        "document": chunk,
                        "metadata": {
                            "chapter": chapter,
                            "chunkIndex": index,
                            "sourceFileName": source_file_name,
                            "sourcePath": str(file_path),
                            "chapterSummary": (
                                enrichment.chapter_summary
                                if enrichment and enrichment.chapter_summary
                                else ""
                            ),
                            "keyEventsJson": (
                                json.dumps(enrichment.key_events)
                                if enrichment and enrichment.key_events
                                else "[]"
                            ),
                            "introducedCharactersJson": (
                                json.dumps(enrichment.introduced_characters)
                                if enrichment and enrichment.introduced_characters
                                else "[]"
                            ),
                        },
                    }
                )

            return records
        except Exception as error:  # noqa: BLE001
            raise HTTPException(
                status_code=500, detail=f"Ingestion failed: {error}"
            ) from error
