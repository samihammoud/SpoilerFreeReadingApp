import { ChromaClient } from "chromadb";

const COLLECTION_NAME = process.env.CHROMA_COLLECTION || "books_docs";

//create client wrapper, host server
const client = new ChromaClient({
  host: process.env.CHROMA_HOST || "localhost",
  port: Number(process.env.CHROMA_PORT || 8000),
  ssl: process.env.CHROMA_SSL === "true",
});

let collectionPromise;

//QUERYING BASED ON name given in env (philosophy docs)
export async function getCollection() {
  if (!collectionPromise) {
    collectionPromise = client.getOrCreateCollection({
      name: COLLECTION_NAME,
      embeddingFunction: null,
    });
  }

  return collectionPromise;
}

export async function listCollections() {
  return await client.listCollections();
}

export async function createCollection({ name }) {
  if (!collectionPromise) {
    collectionPromise = client.getOrCreateCollection({
      name: name,
      embeddingFunction: null,
    });
  }

  return collectionPromise;
}

export async function upsertEmbedding({
  id,
  document,
  embedding,
  metadata = {},
}) {
  //return a collection object based on id passed in from node server
  const collection = await client.getOrCreateCollection({
    name: id,
    embeddingFunction: null,
  });

  await collection.upsert({
    ids: [id],
    embeddings: [embedding],
    documents: [document],
    metadatas: [metadata],
  });
}

export async function getEmbeddings({ ids, limit = 10 } = {}) {
  const collection = await getCollection();

  const query = ids?.length
    ? { ids, include: ["documents", "metadatas", "embeddings"] }
    : { limit, include: ["documents", "metadatas", "embeddings"] };

  const result = await collection.get(query);
  return result;
}

export async function getSpecificCollection({ id }) {
  return client.getOrCreateCollection({
    name: id,
    embeddingFunction: null,
  });
}

//takes in an embedding, compares that
export async function querySimilarEmbeddings({
  queryEmbedding,
  limit = 1,
} = {}) {
  if (!queryEmbedding) return [];

  const collection = await getCollection();
  //MONEY QUERY FUNCTION HERE
  const result = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
    include: ["documents", "metadatas", "distances"],
  });

  //returns nested arays, extract first query batch
  const ids = result.ids?.[0] || [];
  const documents = result.documents?.[0] || [];
  const metadatas = result.metadatas?.[0] || [];
  const distances = result.distances?.[0] || [];

  return ids.map((id, index) => ({
    id,
    document: documents[index] ?? null,
    metadata: metadatas[index] ?? null,
    distance: distances[index] ?? null,
  }));
}
