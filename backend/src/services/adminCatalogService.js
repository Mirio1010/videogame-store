"use strict";

const { createSupabaseAdminClient } = require("./supabaseClient");

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toAdminGame(row) {
  return {
    steamId: Number(row.steam_id),
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    discount: Number(row.discount),
    featured: Boolean(row.featured),
    active: row.active !== false,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

function normalizeAdminGame(input, existing = {}) {
  const steamId = Number(input.steamId ?? existing.steamId);
  if (!Number.isInteger(steamId) || steamId <= 0) {
    throw createHttpError("Steam App ID must be a positive whole number.", 400);
  }

  const price = Number(input.price ?? existing.price ?? 0);
  if (!Number.isFinite(price) || price < 0) {
    throw createHttpError("Price must be a non-negative number.", 400);
  }

  const originalPriceInput = input.originalPrice ?? existing.originalPrice ?? price;
  const originalPrice = Number(originalPriceInput);
  if (!Number.isFinite(originalPrice) || originalPrice < 0) {
    throw createHttpError("Original price must be a non-negative number.", 400);
  }

  const discountInput = input.discount ?? existing.discount ?? 0;
  const discount = Number(discountInput);
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    throw createHttpError("Discount must be between 0 and 100.", 400);
  }

  return {
    steam_id: steamId,
    price: Number(price.toFixed(2)),
    original_price: Number(originalPrice.toFixed(2)),
    discount: Math.round(discount),
    featured: Boolean(input.featured ?? existing.featured ?? false),
    active: input.active ?? existing.active ?? true,
    updated_at: new Date().toISOString(),
  };
}

function handleSupabaseError(error, fallbackMessage = "Admin catalog request failed") {
  if (!error) return;

  if (error.code === "23505") {
    throw createHttpError("This Steam App ID is already managed by admin.", 409);
  }

  throw createHttpError(error.message || fallbackMessage, 500);
}

async function listAdminGames() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_games")
    .select("*")
    .order("updated_at", { ascending: false });

  handleSupabaseError(error, "Failed to list admin games");
  return (data || []).map(toAdminGame);
}

async function getActiveAdminGames() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_games")
    .select("*")
    .eq("active", true)
    .order("updated_at", { ascending: false });

  handleSupabaseError(error, "Failed to list active admin games");
  return (data || []).map(toAdminGame);
}

async function addAdminGame(input) {
  const supabase = createSupabaseAdminClient();
  const payload = normalizeAdminGame(input);
  const { data, error } = await supabase
    .from("admin_games")
    .insert(payload)
    .select("*")
    .single();

  handleSupabaseError(error, "Failed to add admin game");
  return toAdminGame(data);
}

async function updateAdminGame(steamId, input) {
  const existingGames = await listAdminGames();
  const existing = existingGames.find((game) => game.steamId === Number(steamId));
  if (!existing) {
    throw createHttpError("Admin game not found.", 404);
  }

  const supabase = createSupabaseAdminClient();
  const payload = normalizeAdminGame(input, existing);
  delete payload.steam_id;
  const { data, error } = await supabase
    .from("admin_games")
    .update(payload)
    .eq("steam_id", Number(steamId))
    .select("*")
    .single();

  handleSupabaseError(error, "Failed to update admin game");
  return toAdminGame(data);
}

async function deleteAdminGame(steamId) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_games")
    .delete()
    .eq("steam_id", Number(steamId))
    .select("steam_id")
    .single();

  if (error?.code === "PGRST116") {
    throw createHttpError("Admin game not found.", 404);
  }

  handleSupabaseError(error, "Failed to delete admin game");
  return data;
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
