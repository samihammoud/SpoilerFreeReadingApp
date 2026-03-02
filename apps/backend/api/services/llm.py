from openai import OpenAI

_openai_client = None


def get_openai_client() -> OpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAI()
    return _openai_client


# Create embeddings for a list of text chunks using OpenAI embeddings API.
def create_embeddings(inputs: list[str]) -> list[list[float]]:
    response = get_openai_client().embeddings.create(
        model="text-embedding-3-small",
        input=inputs,
        encoding_format="float",
    )
    return [item.embedding for item in response.data]
