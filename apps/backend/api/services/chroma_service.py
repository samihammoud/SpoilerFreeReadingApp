from typing import Any

from db.chroma_client import get_client


class ChromaService:
    def __init__(self):
        self._collection_cache: dict[str, Any] = {}

    # Return all known collection IDs from Chroma.
    def list_collection_ids(self) -> list[str]:
        collections = get_client().list_collections()
        return [collection.name for collection in collections]

    # Create a collection if missing and return the collection object.
    def get_or_create_collection(self, collection_id: str) -> Any:
        if collection_id not in self._collection_cache:
            self._collection_cache[collection_id] = get_client().get_or_create_collection(
                name=collection_id,
                embedding_function=None,
            )
        return self._collection_cache[collection_id]

    def query_similar_embeddings(
        self,
        *,
        collection_id: str,
        query_embedding: list[float],
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        collection = self.get_or_create_collection(collection_id)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            include=["documents", "metadatas"],
        )
        matches = []
        for doc, metadata in zip(results["documents"][0], results["metadatas"][0]):
            matches.append({
                "document": doc,
                "metadata": metadata,
                "embedding": query_embedding,
            })
        return matches

    # Upsert one precomputed embedding record.
    def upsert_embedding(
        self,
        *,
        collection_id: str,
        record_id: str,
        document: str,
        embedding: list[float],
        metadata: dict[str, Any],
    ) -> None:
        collection = self.get_or_create_collection(collection_id)
        collection.upsert(
            ids=[record_id],
            embeddings=[embedding],
            documents=[document],
            metadatas=[metadata],
        )

    # Upsert a batch of ingestion records and aligned embeddings.
    def upsert_records(
        self,
        *,
        collection_id: str,
        records: list[dict[str, Any]],
        embeddings: list[list[float]],
    ) -> int:
        if len(records) != len(embeddings):
            raise ValueError("Embedding response count did not match record count")
        if not records:
            return 0

        collection = self.get_or_create_collection(collection_id)
        collection.upsert(
            ids=[record["id"] for record in records],
            embeddings=embeddings,
            documents=[record["document"] for record in records],
            metadatas=[record["metadata"] for record in records],
        )
        return len(records)


_chroma_service: ChromaService | None = None


def get_chroma_service() -> ChromaService:
    global _chroma_service
    if _chroma_service is None:
        _chroma_service = ChromaService()
    return _chroma_service
