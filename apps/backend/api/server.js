import express from "express";
import {
  createCollection,
  getCollection,
  listCollections,
} from "../db/chromaDB.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "chapter-and-verse-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/CollectionsTest", async (_req, res) => {
  try {
    const collection = await getCollection();
    res.status(200).json({
      collectionName: collection.name,
      message: "Successfully accessed ChromaDB collection.",
    });
  } catch (error) {
    console.error("Error accessing ChromaDB collection:", error);
    res.status(500).json({
      error: "Failed to access ChromaDB collection",
    });
  }
});

app.get("/getAllCollections", async (_req, res) => {
  try {
    const collections = await listCollections();
    res.status(200).json({
      collections: collections.map((col) => col.name),
      message: "Successfully retrieved all ChromaDB collections.",
    });
  } catch (error) {
    console.error("Error retrieving ChromaDB collections:", error);
    res.status(500).json({
      error: "Failed to retrieve ChromaDB collections",
    });
  }
});

app.post("/CreateCollectionTest", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Collection name is required" });
    }
  } catch (error) {
    console.error("Error creating ChromaDB collection:", error);
    res.status(500).json({
      error: "Failed to create ChromaDB collection",
    });
  }

  const collection = await createCollection({ name: req.body.name });
  res.status(200).json({
    collectionName: collection.name,
    message: "Successfully created ChromaDB collection.",
  });
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
