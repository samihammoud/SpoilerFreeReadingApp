from openai import AsyncOpenAI, OpenAI

_openai_client = None
_openai_async_client = None


#lazy initialization of OpenAI client, since it may not be needed for all API calls and we want to avoid unnecessary initialization overhead

#langchain references this singleton, getter returns the OpenAI client instance, creating it if it does not already exist
def get_openai_client() -> OpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAI()
    return _openai_client


def get_openai_async_client() -> AsyncOpenAI:
    global _openai_async_client
    if _openai_async_client is None:
        _openai_async_client = AsyncOpenAI()
    return _openai_async_client


# Create embeddings for a list of text chunks using OpenAI embeddings API.
def create_embeddings(inputs: list[str]) -> list[list[float]]:
    response = get_openai_client().embeddings.create(
        model="text-embedding-3-small",
        input=inputs,
        encoding_format="float",
    )
    return [item.embedding for item in response.data]
