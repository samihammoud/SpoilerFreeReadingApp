import { ChromaClient } from "chromadb";

const COLLECTION_NAME = process.env.CHROMA_COLLECTION || "books_docs";

// ChromaDB client configuration
const client = new ChromaClient({
  host: process.env.CHROMA_HOST || "localhost",
  port: Number(process.env.CHROMA_PORT || 8000),
  ssl: process.env.CHROMA_SSL === "true",
});

let collectionPromise;

// Returns the default collection defined by env configuration.
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

export async function createCollection({ name: collectionName }) {
  return await client.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: null,
  });
}

export async function upsertEmbedding({
  collectionName = COLLECTION_NAME,
  id,
  document,
  embedding,
  metadata = {},
}) {
  const collection = await client.getOrCreateCollection({
    name: collectionName,
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

export async function getSpecificCollection({ name: collectionName }) {
  return client.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: null,
  });
}

// Compares a query embedding against vectors in the default collection.
export async function querySimilarEmbeddings({
  queryEmbedding,
  limit = 1,
} = {}) {
  if (!queryEmbedding) return [];

  const collection = await getCollection();
  // Query for nearest vectors by embedding similarity.
  const result = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
    include: ["documents", "metadatas", "distances"],
  });

  // Returns nested arrays; extract first query batch.
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
