"use strict";

const { createClient } = require("@supabase/supabase-js");

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const error = new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in the backend environment."
    );
    error.statusCode = 500;
    throw error;
  }

  return { url, anonKey };
}

function createSupabaseClient(accessToken) {
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

function createSupabaseAdminClient() {
  const { url } = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    const error = new Error(
      "Supabase admin operations are not configured. Set SUPABASE_SERVICE_ROLE_KEY in the backend environment."
    );
    error.statusCode = 501;
    throw error;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

module.exports = {
  createSupabaseAdminClient,
  createSupabaseClient,
  getSupabaseConfig,
};