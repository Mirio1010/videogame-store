"use strict";

const { createSupabaseClient } = require("./supabaseClient");

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getUserRole(user) {
  return user?.app_metadata?.role ?? user?.user_metadata?.role ?? "authenticated";
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const userMetadata = user.user_metadata ?? {};
  const displayName =
    userMetadata.nickname || userMetadata.name || user.email?.split("@")[0] || "user";

  return {
    id: user.id,
    email: user.email,
    role: getUserRole(user),
    displayName,
    avatarUrl: userMetadata.avatar_url ?? null,
    emailConfirmedAt: user.email_confirmed_at,
    lastSignInAt: user.last_sign_in_at,
    createdAt: user.created_at,
    userMetadata,
    appMetadata: user.app_metadata ?? {},
  };
}

function handleSupabaseAuthError(error, fallbackMessage = "Authentication request failed") {
  if (!error) {
    return;
  }

  const statusCode = Number.isInteger(error.status) ? error.status : 400;
  throw createHttpError(error.message || fallbackMessage, statusCode);
}

async function registerUser({ email, password, name }) {
  const client = createSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined,
    },
  });

  handleSupabaseAuthError(error, "Registration failed");

  return {
    user: sanitizeUser(data.user),
    session: data.session,
    needsEmailConfirmation: !data.session,
  };
}

async function loginUser({ email, password }) {
  const client = createSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  handleSupabaseAuthError(error, "Login failed");

  return {
    user: sanitizeUser(data.user),
    session: data.session,
  };
}

async function logoutUser({ accessToken, refreshToken }) {
  const client = createSupabaseClient(accessToken);

  // Some clients may only have the access token (e.g. older local sessions).
  // If refresh token is present, restore the session first for full logout.
  if (refreshToken) {
    const { error: setSessionError } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    handleSupabaseAuthError(setSessionError, "Could not restore session for logout");
  }

  const { error } = await client.auth.signOut();
  handleSupabaseAuthError(error, "Logout failed");
}

async function getUserFromAccessToken(accessToken) {
  const client = createSupabaseClient(accessToken);
  const { data, error } = await client.auth.getUser(accessToken);

  handleSupabaseAuthError(error, "Invalid or expired access token");

  if (!data.user) {
    throw createHttpError("Authenticated user not found", 401);
  }

  return sanitizeUser(data.user);
}

module.exports = {
  getUserFromAccessToken,
  getUserRole,
  loginUser,
  logoutUser,
  registerUser,
  sanitizeUser,
};