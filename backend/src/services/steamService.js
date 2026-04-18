"use strict";

const STEAM_STORE_API = "https://store.steampowered.com/api";

// Cache TTL: 1 hour — Steam prices / data rarely change faster than this
const CACHE_TTL_MS = 60 * 60 * 1000;

// In-memory cache: Map<steamId, { data, fetchedAt }>
const cache = new Map();

// ---------------------------------------------------------------------------
// Curated game catalog — add or remove Steam App IDs to change the store
// featured: true  → shown in the "Featured Games" section on the home page
// ---------------------------------------------------------------------------
const GAME_CATALOG = [
  { steamId: 1091500, featured: true  }, // Cyberpunk 2077
  { steamId: 1245620, featured: true  }, // Elden Ring
  { steamId: 1086940, featured: true  }, // Baldur's Gate 3
  { steamId: 1145350, featured: true  }, // Hades II
  { steamId: 526870,  featured: true  }, // Satisfactory
  { steamId: 1332010, featured: true  }, // Stray
  { steamId: 292030,  featured: false }, // The Witcher 3
  { steamId: 1174180, featured: false }, // Red Dead Redemption 2
  { steamId: 814380,  featured: false }, // Sekiro: Shadows Die Twice
  { steamId: 620,     featured: false }, // Portal 2
  { steamId: 105600,  featured: false }, // Terraria
];

const FEATURED_IDS = new Set(
  GAME_CATALOG.filter((g) => g.featured).map((g) => g.steamId)
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize raw Steam appdetails payload into a consistent shape used by
 * the rest of the app.
 *
 * Prices are stored as floats (USD). Steam returns prices in cents.
 * Portrait card images are constructed from the Steam CDN using the app ID
 * (matches the library_600x900 format already used in the static JSON files).
 */
function normalizeGame(steamId, data) {
  const price = data.price_overview ?? null;

  return {
    id: steamId,
    title: data.name,

    // Portrait card image (600×900) — best for game card display
    image: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${steamId}/library_600x900_2x.jpg`,

    // Landscape banner (460×215) — useful for detail / hero images
    headerImage: data.header_image ?? null,

    description: data.short_description ?? "",
    developers: data.developers ?? [],
    publishers: data.publishers ?? [],

    // Genres: e.g. ["RPG", "Action"]
    genres: (data.genres ?? []).map((g) => g.description),

    // Steam feature categories: e.g. ["Single-player", "Steam Achievements"]
    categories: (data.categories ?? []).map((c) => c.description),

    metacritic: data.metacritic?.score ?? null,
    reviews: data.recommendations?.total ?? null,

    // Up to 8 full-resolution screenshots for the detail page
    screenshots: (data.screenshots ?? [])
      .slice(0, 8)
      .map((s) => ({ thumbnail: s.path_thumbnail, full: s.path_full })),

    isFree: data.is_free ?? false,

    // Prices in USD dollars (not cents)
    price: price ? price.final / 100 : 0,
    originalPrice: price ? price.initial / 100 : 0,
    discount: price ? price.discount_percent : 0,
    onSale: price ? price.discount_percent > 0 : false,

    featured: FEATURED_IDS.has(steamId),

    releaseDate: data.release_date?.date ?? null,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch details for a single Steam app, with in-memory caching.
 * Returns null if Steam reports success:false (region-locked, removed, etc.)
 */
async function fetchAppDetails(steamId) {
  const now = Date.now();
  const hit = cache.get(steamId);
  if (hit && now - hit.fetchedAt < CACHE_TTL_MS) {
    return hit.data;
  }

  const url = `${STEAM_STORE_API}/appdetails?appids=${steamId}&cc=us`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Steam API responded ${response.status} for appid ${steamId}`);
  }

  const json = await response.json();
  const entry = json[String(steamId)];
  if (!entry?.success) {
    return null; // game unavailable in this region or delisted
  }

  const normalized = normalizeGame(steamId, entry.data);
  cache.set(steamId, { data: normalized, fetchedAt: now });
  return normalized;
}

/**
 * Fetch all catalog games concurrently.
 * Individual failures are silently excluded so one unavailable game never
 * breaks the whole page.
 */
async function getAllGames() {
  const results = await Promise.allSettled(
    GAME_CATALOG.map(({ steamId }) => fetchAppDetails(steamId))
  );
  return results
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value);
}

module.exports = { fetchAppDetails, getAllGames };
