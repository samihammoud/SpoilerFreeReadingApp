import os

import chromadb

#singleeton client instance, get_client() will initialize it on first call and reuse for subsequent calls in chroma_service
_client = None


def get_client():
    global _client
    if _client is None:
        _client = chromadb.HttpClient(
            host=os.getenv("CHROMA_HOST", "localhost"),
            port=int(os.getenv("CHROMA_PORT", "8000")),
            ssl=os.getenv("CHROMA_SSL", "false").lower() == "true",
        )
    return _client
