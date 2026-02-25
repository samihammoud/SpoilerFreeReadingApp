import express from "express";
import { getCollection } from "../db/chromaDB.js";

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
