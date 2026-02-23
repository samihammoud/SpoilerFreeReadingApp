# Chapter & Verse

A spoiler-free book discussion app. Discussions are gated to your current reading chapter — you only ever see threads up to where you are in the book.

---

## Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** (custom design tokens in `tailwind.config.js`)
- **Google Fonts** — Playfair Display + Crimson Text (loaded via `index.html`)
- No router (screen state managed in `App.jsx`) — add React Router when ready
- No global state library — useState/props throughout

---

## Getting started

```bash
npm install
npm run dev
```

---

## Project structure

```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Top-level routing + shared state
│
├── pages/                    # One file per full screen
│   ├── SplashScreen.jsx
│   ├── OnboardingScreen.jsx
│   ├── AuthScreen.jsx
│   ├── HomeScreen.jsx
│   └── ForumScreen.jsx
│
├── components/               # Reusable UI pieces
│   ├── BookCard.jsx          # Card on the home grid
│   ├── BookCover.jsx         # ISBN cover image with fallback
│   ├── PostCard.jsx          # Individual discussion post
│   ├── ProgressModal.jsx     # Chapter-setting slider modal
│   └── SettingsDrawer.jsx    # Slide-in settings panel
│
├── data/                     # Static mock data (replace with API calls)
│   ├── books.js              # BOOKS array + GENRE_COLORS
│   ├── posts.js              # POSTS array
│   └── onboarding.js         # ONBOARDING_SLIDES array
│
└── styles/
    └── globals.css           # Tailwind directives + custom component classes
```

---

## Tailwind design tokens

All custom tokens are defined in `tailwind.config.js`:

| Token group | Purpose |
|-------------|---------|
| `brand.*`   | Gold accent colours |
| `surface.*` | Background layers (base, card, inset, border) |
| `ink.*`     | Text hierarchy (DEFAULT → muted → subtle → faint → ghost) |
| `font-playfair` / `font-crimson` | Custom font families |

Custom reusable classes (buttons, cards, inputs, etc.) are defined as Tailwind `@layer components` in `globals.css` so they can be used anywhere without repeating long utility strings.

---

## Replacing mock data with real API

| File | What to replace |
|------|----------------|
| `src/data/books.js` | `BOOKS` array → fetch from your books API |
| `src/data/posts.js` | `POSTS` array → fetch by `bookId` + filter by `chapter <= progress` server-side |
| `App.jsx` `handleAuthSubmit` | Simulated timeout → real auth API (JWT, Supabase, Firebase, etc.) |
| `ForumScreen.jsx` `handlePost` | `setNewPost('')` → POST to your discussions endpoint |

---

## Adding React Router

When you're ready to move from screen-state routing to URL-based routing:

```bash
npm install react-router-dom
```

Map screens to routes:
- `/`           → `HomeScreen`
- `/book/:id`   → `ForumScreen`
- `/login`      → `AuthScreen`
