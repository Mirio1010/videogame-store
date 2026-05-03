"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const ADMIN_GAMES_FILE = path.join(DATA_DIR, "admin-games.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(ADMIN_GAMES_FILE)) {
    fs.writeFileSync(ADMIN_GAMES_FILE, "[]\n", "utf8");
  }
}

function readAdminGames() {
  ensureStore();

  try {
    const raw = fs.readFileSync(ADMIN_GAMES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read admin catalog:", error);
    return [];
  }
}

function writeAdminGames(games) {
  ensureStore();
  fs.writeFileSync(ADMIN_GAMES_FILE, `${JSON.stringify(games, null, 2)}\n`, "utf8");
}

function normalizeAdminGame(input, existing = {}) {
  const steamId = Number(input.steamId ?? existing.steamId);
  if (!Number.isInteger(steamId) || steamId <= 0) {
    const error = new Error("Steam App ID must be a positive whole number.");
    error.statusCode = 400;
    throw error;
  }

  const price = Number(input.price ?? existing.price ?? 0);
  if (!Number.isFinite(price) || price < 0) {
    const error = new Error("Price must be a non-negative number.");
    error.statusCode = 400;
    throw error;
  }

  const originalPriceInput = input.originalPrice ?? existing.originalPrice ?? price;
  const originalPrice = Number(originalPriceInput);
  if (!Number.isFinite(originalPrice) || originalPrice < 0) {
    const error = new Error("Original price must be a non-negative number.");
    error.statusCode = 400;
    throw error;
  }

  const discountInput = input.discount ?? existing.discount ?? 0;
  const discount = Number(discountInput);
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    const error = new Error("Discount must be between 0 and 100.");
    error.statusCode = 400;
    throw error;
  }

  return {
    steamId,
    price: Number(price.toFixed(2)),
    originalPrice: Number(originalPrice.toFixed(2)),
    discount: Math.round(discount),
    featured: Boolean(input.featured ?? existing.featured ?? false),
    active: input.active ?? existing.active ?? true,
    updatedAt: new Date().toISOString(),
    createdAt: existing.createdAt ?? new Date().toISOString(),
  };
}

function listAdminGames() {
  return readAdminGames().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function getActiveAdminGames() {
  return readAdminGames().filter((game) => game.active !== false);
}

function addAdminGame(input) {
  const games = readAdminGames();
  const next = normalizeAdminGame(input);

  if (games.some((game) => game.steamId === next.steamId)) {
    const error = new Error("This Steam App ID is already managed by admin.");
    error.statusCode = 409;
    throw error;
  }

  games.push(next);
  writeAdminGames(games);
  return next;
}

function updateAdminGame(steamId, input) {
  const games = readAdminGames();
  const numericSteamId = Number(steamId);
  const index = games.findIndex((game) => game.steamId === numericSteamId);

  if (index === -1) {
    const error = new Error("Admin game not found.");
    error.statusCode = 404;
    throw error;
  }

  const updated = normalizeAdminGame({ ...input, steamId: numericSteamId }, games[index]);
  games[index] = updated;
  writeAdminGames(games);
  return updated;
}

function deleteAdminGame(steamId) {
  const games = readAdminGames();
  const numericSteamId = Number(steamId);
  const next = games.filter((game) => game.steamId !== numericSteamId);

  if (next.length === games.length) {
    const error = new Error("Admin game not found.");
    error.statusCode = 404;
    throw error;
  }

  writeAdminGames(next);
}

function applyAdminOverrides(game, adminEntry) {
  if (!adminEntry) return game;

  return {
    ...game,
    price: adminEntry.price,
    originalPrice: adminEntry.originalPrice,
    discount: adminEntry.discount,
    onSale: adminEntry.discount > 0 || adminEntry.originalPrice > adminEntry.price,
    featured: adminEntry.featured,
    adminManaged: true,
    active: adminEntry.active !== false,
  };
}

module.exports = {
  addAdminGame,
  applyAdminOverrides,
  deleteAdminGame,
  getActiveAdminGames,
  listAdminGames,
  updateAdminGame,
};
