import os
from typing import Any

import chromadb

_client = None
_collection_cache: dict[str, Any] = {}


def get_client():
    global _client
    if _client is None:
        _client = chromadb.HttpClient(
            host=os.getenv("CHROMA_HOST", "localhost"),
            port=int(os.getenv("CHROMA_PORT", "8000")),
            ssl=os.getenv("CHROMA_SSL", "false").lower() == "true",
        )
    return _client


def list_collection_ids() -> list[str]:
    collections = get_client().list_collections()
    return [collection.name for collection in collections]


def get_or_create_collection(collection_id: str):
    if collection_id not in _collection_cache:
        _collection_cache[collection_id] = get_client().get_or_create_collection(
            name=collection_id,
            embedding_function=None,
        )
    return _collection_cache[collection_id]
