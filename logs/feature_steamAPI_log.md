# Changelog — feature/steamAPI

---

## TL;DR

- **Replaced all static JSON game data** (`featuredGames.json`, `onSaleGames.json`, `categories.json`) with live data from the free public Steam Store API — no API key needed.
- **Backend** gained two new routes (`/api/games`, `/api/categories`) backed by a `steamService` that fetches, normalizes, and caches Steam data for 1 hour.
- **Frontend** gained a `gamesService` module and a full **game detail page** (`/game/:steamId`) showing the hero banner, live price, discount badge, Add to Cart, Metacritic score, review count, description, feature tags, and a screenshot gallery.
- **`Home.jsx`** and **`Store.jsx`** now fetch from the backend instead of importing local JSON; loading and error states were added.
- **Port changed from 5000 → 3001** to avoid a macOS AirPlay Receiver conflict that caused misleading CORS 403 errors.

---

## Summary

Replaced all static local JSON game data with live data fetched from the
public Steam Store API (`store.steampowered.com/api/appdetails`).
Added a full game detail page. Fixed a macOS AirPlay port conflict that was
causing CORS 403 errors.

---

## Backend

### New files

**`backend/src/services/steamService.js`**
- Fetches game data from the Steam Store API (`/api/appdetails?appids=…&cc=us`)
- Normalizes the raw response into a consistent shape:
  - `id`, `title`, `image` (portrait 600×900), `headerImage` (landscape banner)
  - `price`, `originalPrice`, `discount`, `onSale`
  - `description`, `developers`, `publishers`, `releaseDate`
  - `genres` (e.g. RPG, Action), `categories` (Steam feature tags)
  - `metacritic` score, `reviews` (total recommendation count)
  - `screenshots` (up to 8, each with `thumbnail` + `full` URL)
  - `featured` flag (controlled by the curated `GAME_CATALOG` list)
- 1-hour in-memory cache per App ID to avoid hammering Steam
- Curated catalog of 11 games (App IDs); easy to extend by adding entries to `GAME_CATALOG`

**`backend/src/routes/games.js`**
- `GET /api/games` — returns all catalog games; supports `?featured=true` and `?onSale=true` filters
- `GET /api/games/:steamId` — returns full details for one game by Steam App ID

**`backend/src/routes/categories.js`**
- `GET /api/categories` — aggregates unique genres across the catalog and returns them as `{ id, name, slug }` objects; reuses the games cache so no extra Steam requests are made

### Modified files

**`backend/src/app.js`**
- Imported and mounted `/api/games` and `/api/categories` routers
- Added global error-handling middleware

**`backend/src/server.js`**
- Added `require("dotenv").config()` so the server reads `PORT` from `.env`
- Changed hard-coded `5000` to `process.env.PORT || 3001`

**`backend/.env`**
- Changed `PORT` from `5000` to `3001` to avoid the macOS AirPlay Receiver
  service that occupies port 5000 and returns 403 responses

---

## Frontend

### New files

**`frontend/src/services/gamesService.js`**
- `fetchAllGames({ featured?, onSale? })` — calls `GET /api/games`
- `fetchAllCategories()` — calls `GET /api/categories`
- `fetchGameById(steamId)` — calls `GET /api/games/:steamId`
- Reads `VITE_API_URL` env var for the base URL (defaults to `http://localhost:3001`)

**`frontend/src/pages/GameDetailPage.jsx`**
- Full game detail page at `/game/:steamId`
- Hero banner (header image with gradient overlay)
- Left sidebar: portrait cover, live price with discount badge, Add to Cart button, developer / publisher / release date / genre metadata
- Right main area: title, Metacritic score card, total Steam review count, short description, Steam feature tag chips
- Screenshot gallery: large active image + row of clickable thumbnails
- Add to Cart writes to `localStorage` and dispatches `cart-updated` event

**`frontend/src/pages/GameDetailPage.css`** (or `frontend/src/styles/GameDetailPage.css`)
- Steam-inspired dark-theme layout for the detail page
- Responsive two-column grid (collapses to single column on mobile)

### Modified files

**`frontend/src/pages/Home.jsx`**
- Removed static imports of `featuredGames.json`, `onSaleGames.json`, `categories.json`
- Fetches games and categories from the backend API on mount via `Promise.all`
- Derives `featuredGames` and `onSaleGames` from the API response client-side

**`frontend/src/pages/Store.jsx`**
- Removed static JSON imports and `mergeCatalog()` helper
- Fetches all games from `GET /api/games` on mount
- Added loading and error states

**`frontend/src/routes/AppRoutes.jsx`**
- Registered `<Route path="/game/:steamId" element={<GameDetailPage />} />`

**`frontend/.env`**
- Changed `VITE_API_URL` from `http://localhost:5000` to `http://localhost:3001`

### Deleted / safe to remove

| File | Reason |
|---|---|
| `frontend/src/data/featuredGames.json` | No longer imported; data comes from API |
| `frontend/src/data/onSaleGames.json` | No longer imported; data comes from API |
| `frontend/src/data/categories.json` | No longer imported; categories come from `/api/categories` |

---

## Bug fixes

- **CORS 403 on macOS** — Port 5000 is occupied by macOS AirPlay Receiver
  (Monterey+), which returns HTTP 403 without CORS headers, causing the browser
  to block the fetch. Fixed by moving the backend to port 3001.
