import express from "express";
import {
  createCollection,
  listCollections,
  upsertEmbedding,
  getSpecificCollection,
} from "../db/chromaDB.js";

import { createEmbedding } from "../data-ingestion/llm.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

app.post("/embed", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text must be a non-empty string" });
    }

    const embedding = await createEmbedding(text);
    res.status(200).json({
      embedding,
    });
  } catch (error) {
    console.error("Error creating embedding:", error);
    res.status(500).json({
      error: "Failed to create embedding",
    });
  }
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "chapter-and-verse-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/collections", async (_req, res) => {
  try {
    const collections = await listCollections();
    res.status(200).json({
      collections: collections.map((collection) => collection.name),
    });
  } catch (error) {
    console.error("Error retrieving ChromaDB collections:", error);
    res.status(500).json({
      error: "Failed to retrieve ChromaDB collections",
    });
  }
});

app.post("/collections", async (req, res) => {
  try {
    const { name: collectionName } = req.body;
    if (!collectionName) {
      return res.status(400).json({ error: "Collection name is required" });
    }

    const collection = await createCollection({ name: collectionName });
    res.status(201).json({
      collectionName: collection.name,
    });
  } catch (error) {
    console.error("Error creating ChromaDB collection:", error);
    res.status(500).json({
      error: "Failed to create ChromaDB collection",
    });
  }
});

app.get("/collections/:name", async (req, res) => {
  try {
    const { name: collectionName } = req.params;
    const collection = await getSpecificCollection({ name: collectionName });
    res.status(200).json({
      collection,
    });
  } catch (error) {
    console.error("Error retrieving specific ChromaDB collection:", error);
    res.status(500).json({
      error: "Failed to retrieve specific ChromaDB collection",
    });
  }
});

app.post("/collections/:name/embeddings", async (req, res) => {
  try {
    const { name: collectionName } = req.params;
    const { id, document, embedding, metadata = {} } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "id must be a non-empty string" });
    }

    if (!document || typeof document !== "string") {
      return res
        .status(400)
        .json({ error: "document must be a non-empty string" });
    }

    if (
      !Array.isArray(embedding) ||
      embedding.length === 0 ||
      !embedding.every((value) => typeof value === "number")
    ) {
      return res.status(400).json({
        error: "embedding must be a non-empty array of numbers",
      });
    }

    await upsertEmbedding({
      collectionName,
      id,
      document,
      embedding,
      metadata,
    });

    res.status(200).json({
      ok: true,
      collectionName,
      id,
    });
  } catch (error) {
    console.error("Error inserting into ChromaDB collection:", error);
    res.status(500).json({
      error: "Failed to insert into ChromaDB collection",
    });
  }
});

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Chapter & Verse backend is running.",
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
