# Chapter & Verse

A spoiler-free book discussion app. Discussions are gated to your current reading chapter, so users only see threads up to their current progress.

## Repository layout

```text
apps/
  frontend/                 # React + Vite app
    index.html
    src/
    vite.config.js
    tailwind.config.js
    postcss.config.js
    package.json

  backend/                  # Backend and ingestion code
    api/
    data-ingestion/
```

## Workspace setup

This repository uses npm workspaces.

```bash
npm install
```

## Run frontend

From repo root:

```bash
npm run dev:frontend
```

Build/preview:

```bash
npm run build:frontend
npm run preview:frontend
```

Or run directly in the frontend workspace:

```bash
npm run dev -w @chapter-and-verse/frontend
```

## Frontend stack

- React 18
- Vite 5
- Tailwind CSS 3
- Google Fonts (Playfair Display, Crimson Text)

## Replacing mock data with real APIs

- `apps/frontend/src/data/books.js`: replace `BOOKS` with books API data.
- `apps/frontend/src/data/posts.js`: fetch by `bookId`, filter by `chapter <= progress` server-side.
- `apps/frontend/src/App.jsx` `handleAuthSubmit`: replace timeout with real auth.
- `apps/frontend/src/pages/ForumScreen.jsx` `handlePost`: POST to backend discussions endpoint.
