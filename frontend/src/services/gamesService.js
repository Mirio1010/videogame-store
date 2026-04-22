// Base URL for the backend API.
// Set VITE_API_URL in a .env file to override (e.g. for production).
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

/**
 * Fetch all games from the curated catalog.
 *
 * @param {{ featured?: boolean, onSale?: boolean }} [filters]
 * @returns {Promise<Array>}
 */
export async function fetchAllGames({ featured, onSale } = {}) {
  const params = new URLSearchParams();
  if (featured) params.set("featured", "true");
  if (onSale) params.set("onSale", "true");

  const qs = params.toString();
  const res = await fetch(`${API_BASE}/api/games${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch games (${res.status})`);
  }
  const data = await res.json();
  return data.games;
}

/**
 * Fetch all categories (genres) derived from the curated game catalog.
 *
 * @returns {Promise<Array>}
 */
export async function fetchAllCategories() {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories (${res.status})`);
  }
  const data = await res.json();
  return data.categories;
}

/**
 * Fetch a single game by its Steam App ID.
 *
 * @param {number} steamId
 * @returns {Promise<object>}
 */
export async function fetchGameById(steamId) {
  const res = await fetch(`${API_BASE}/api/games/${steamId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch game (${res.status})`);
  }
  const data = await res.json();
  return data.game;
}
