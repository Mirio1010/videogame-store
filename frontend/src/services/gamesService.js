// Base URL for the backend API.
// Set VITE_API_URL in a .env file to override (e.g. for production).
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

/**
 * Fetch all games from the curated catalog.
 *
 * @param {{ featured?: boolean, onSale?: boolean, genre?: string[], minPrice?: number, maxPrice?: number }} [filters]
 * @returns {Promise<Array>}
 */
export async function fetchAllGames({
  featured,
  onSale,
  genre,
  minPrice,
  maxPrice,
} = {}) {
  const params = new URLSearchParams();
  if (featured) params.set("featured", "true");
  if (onSale) params.set("onSale", "true");
  if (genre && genre.length > 0) {
    params.set("genre", genre.join(","));
  }
  if (minPrice !== undefined && minPrice !== null) {
    params.set("minPrice", minPrice);
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    params.set("maxPrice", maxPrice);
  }

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

export async function fetchAdminGames() {
  const res = await fetch(`${API_BASE}/api/admin/games`);
  if (!res.ok) {
    throw new Error(`Failed to fetch admin games (${res.status})`);
  }
  const data = await res.json();
  return data.games;
}

export async function createAdminGame(game) {
  const res = await fetch(`${API_BASE}/api/admin/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to create game (${res.status})`);
  }
  return data.game;
}

export async function updateAdminGame(steamId, game) {
  const res = await fetch(`${API_BASE}/api/admin/games/${steamId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to update game (${res.status})`);
  }
  return data.game;
}

export async function deleteAdminGame(steamId) {
  const res = await fetch(`${API_BASE}/api/admin/games/${steamId}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to delete game (${res.status})`);
  }
  return data;
}
