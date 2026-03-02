from openai import OpenAI


openai_client = OpenAI()


# Create embeddings for a list of text chunks using OpenAI embeddings API.
def create_embeddings(inputs: list[str]) -> list[list[float]]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=inputs,
        encoding_format="float",
    )
    return [item.embedding for item in response.data]
