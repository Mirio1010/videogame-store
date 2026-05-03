"use strict";

const { createSupabaseClient } = require("./supabaseClient");
const { fetchAppDetails } = require("./steamService");

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function handleSupabaseError(error, fallbackMessage) {
  if (!error) {
    return;
  }

  const statusCode = Number.isInteger(error.status) ? error.status : 400;
  throw createHttpError(error.message || fallbackMessage, statusCode);
}

function parseSteamId(rawSteamId) {
  const steamId = Number(rawSteamId);
  if (!Number.isInteger(steamId) || steamId <= 0) {
    throw createHttpError("Invalid steamId", 400);
  }
  return steamId;
}

function parseQuantity(rawQuantity) {
  const quantity = Number(rawQuantity);
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw createHttpError("Quantity must be a non-negative integer", 400);
  }
  return quantity;
}

async function getCartContext(accessToken) {
  const client = createSupabaseClient(accessToken);
  const { data, error } = await client.auth.getUser(accessToken);
  handleSupabaseError(error, "Failed to resolve authenticated user for cart");

  const userId = data?.user?.id;
  if (!userId) {
    throw createHttpError("Authenticated user not found", 401);
  }

  return { client, userId };
}

async function listRawCartItems(accessToken) {
  const client = createSupabaseClient(accessToken);
  const { data, error } = await client
    .from("cart_items")
    .select("steam_id, quantity")
    .order("created_at", { ascending: true });

  handleSupabaseError(error, "Failed to load cart");
  return data || [];
}

async function hydrateCartItems(rows) {
  const details = await Promise.allSettled(
    rows.map(async (row) => {
      const game = await fetchAppDetails(row.steam_id);
      if (!game) {
        return null;
      }

      return {
        id: game.id,
        title: game.title,
        price: game.price,
        image: game.image,
        quantity: row.quantity,
      };
    })
  );

  return details
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);
}

async function getCart(accessToken) {
  const rows = await listRawCartItems(accessToken);
  const items = await hydrateCartItems(rows);
  return { items };
}

async function addCartItem(accessToken, steamId, quantity = 1) {
  const normalizedSteamId = parseSteamId(steamId);
  const normalizedQuantity = parseQuantity(quantity);

  if (normalizedQuantity === 0) {
    return getCart(accessToken);
  }

  const { client, userId } = await getCartContext(accessToken);
  const { data: existing, error: existingError } = await client
    .from("cart_items")
    .select("quantity")
    .eq("user_id", userId)
    .eq("steam_id", normalizedSteamId)
    .maybeSingle();

  handleSupabaseError(existingError, "Failed to read cart item");

  if (existing) {
    const { error: updateError } = await client
      .from("cart_items")
      .update({ quantity: existing.quantity + normalizedQuantity })
      .eq("user_id", userId)
      .eq("steam_id", normalizedSteamId);

    handleSupabaseError(updateError, "Failed to update cart item");
    return getCart(accessToken);
  }

  const { error: insertError } = await client.from("cart_items").insert({
    user_id: userId,
    steam_id: normalizedSteamId,
    quantity: normalizedQuantity,
  });

  handleSupabaseError(insertError, "Failed to add game to cart");
  return getCart(accessToken);
}

async function setCartItemQuantity(accessToken, steamId, quantity) {
  const normalizedSteamId = parseSteamId(steamId);
  const normalizedQuantity = parseQuantity(quantity);

  const { client, userId } = await getCartContext(accessToken);

  if (normalizedQuantity === 0) {
    const { error: deleteError } = await client
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("steam_id", normalizedSteamId);

    handleSupabaseError(deleteError, "Failed to remove cart item");
    return getCart(accessToken);
  }

  const { error: updateError } = await client
    .from("cart_items")
    .update({ quantity: normalizedQuantity })
    .eq("user_id", userId)
    .eq("steam_id", normalizedSteamId);

  handleSupabaseError(updateError, "Failed to update cart item quantity");
  return getCart(accessToken);
}

async function removeCartItem(accessToken, steamId) {
  return setCartItemQuantity(accessToken, steamId, 0);
}

async function clearCart(accessToken) {
  const { client, userId } = await getCartContext(accessToken);
  const { error } = await client.from("cart_items").delete().eq("user_id", userId);
  handleSupabaseError(error, "Failed to clear cart");

  return { items: [] };
}

module.exports = {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  setCartItemQuantity,
};
