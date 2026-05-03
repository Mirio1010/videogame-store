"use strict";

const {
  createSupabaseAdminClient,
  createSupabaseClient,
  getSupabaseConfig,
} = require("./supabaseClient");
const { sanitizeUser } = require("./authService");

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET || "avatars";

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

async function updateUserViaAccessToken(accessToken, attributes, fallbackMessage) {
  const { url, anonKey } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(attributes),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.msg || payload?.message || payload?.error_description || payload?.error;
    throw createHttpError(message || fallbackMessage, response.status || 400);
  }

  return payload;
}

async function getRawUser(accessToken) {
  const client = createSupabaseClient(accessToken);
  const { data, error } = await client.auth.getUser(accessToken);
  handleSupabaseError(error, "Failed to load current user");

  if (!data?.user) {
    throw createHttpError("Authenticated user was not found", 401);
  }

  return { client, user: data.user };
}

async function getProfileRow(client, userId) {
  const { data, error } = await client
    .from("profiles")
    .select("nickname, avatar_path, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  handleSupabaseError(error, "Failed to load profile row");
  return data;
}

async function upsertProfileRow(client, userId, changes) {
  const payload = {
    id: userId,
    ...changes,
  };

  const { error } = await client.from("profiles").upsert(payload, {
    onConflict: "id",
  });

  handleSupabaseError(error, "Failed to update profile row");
}

function getDisplayName(user) {
  const metadata = user?.user_metadata || user?.userMetadata || {};
  return metadata.nickname || metadata.name || user?.email?.split("@")[0] || "user";
}

async function getCurrentProfile(accessToken) {
  const { client, user } = await getRawUser(accessToken);
  const profileRow = await getProfileRow(client, user.id);
  const sanitized = sanitizeUser(user);

  if (!profileRow) {
    return sanitized;
  }

  return {
    ...sanitized,
    displayName: profileRow.nickname || sanitized.displayName,
    avatarUrl: profileRow.avatar_url || sanitized.avatarUrl,
    userMetadata: {
      ...sanitized.userMetadata,
      nickname: profileRow.nickname || sanitized.userMetadata?.nickname,
      avatar_path: profileRow.avatar_path || sanitized.userMetadata?.avatar_path,
      avatar_url: profileRow.avatar_url || sanitized.userMetadata?.avatar_url,
    },
  };
}

async function updateNickname(accessToken, nickname) {
  const trimmed = String(nickname || "").trim();
  if (!trimmed) {
    throw createHttpError("Nickname is required", 400);
  }
  if (trimmed.length > 50) {
    throw createHttpError("Nickname must be at most 50 characters", 400);
  }

  const { client, user } = await getRawUser(accessToken);
  const existingMetadata = user.user_metadata || {};

  await updateUserViaAccessToken(
    accessToken,
    {
      data: {
        ...existingMetadata,
        nickname: trimmed,
        name: trimmed,
      },
    },
    "Failed to update nickname"
  );

  const { data, error } = await client.auth.getUser(accessToken);
  handleSupabaseError(error, "Failed to load updated user profile");

  await upsertProfileRow(client, user.id, {
    nickname: trimmed,
  });

  return sanitizeUser(data.user);
}

function decodeAvatarDataUrl(avatarDataUrl) {
  const raw = String(avatarDataUrl || "").trim();
  const match = raw.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw createHttpError(
      "Avatar must be a valid base64 data URL (data:<mime>;base64,...)",
      400
    );
  }

  const contentType = match[1].toLowerCase();
  const base64Payload = match[2];
  const ext = ALLOWED_AVATAR_TYPES[contentType];

  if (!ext) {
    throw createHttpError("Unsupported avatar image type", 400);
  }

  const buffer = Buffer.from(base64Payload, "base64");
  if (!buffer.length) {
    throw createHttpError("Avatar image is empty", 400);
  }
  if (buffer.length > MAX_AVATAR_SIZE_BYTES) {
    throw createHttpError("Avatar image must be 2MB or smaller", 400);
  }

  return { buffer, contentType, ext };
}

async function removeOldAvatarIfPresent(client, avatarPath) {
  if (!avatarPath) {
    return;
  }

  const { error } = await client.storage.from(AVATAR_BUCKET).remove([avatarPath]);
  if (error) {
    // Ignore removal failures so users can still save new profile data.
    console.warn("Failed to delete previous avatar:", error.message);
  }
}

function isBucketNotFoundError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("bucket") && message.includes("not found");
}

async function ensureAvatarBucketExists() {
  let adminClient;
  try {
    adminClient = createSupabaseAdminClient();
  } catch (error) {
    if (error?.statusCode === 501) {
      throw createHttpError(
        `Avatar storage bucket '${AVATAR_BUCKET}' is missing. Create it in Supabase Storage or set SUPABASE_SERVICE_ROLE_KEY for automatic creation.`,
        500
      );
    }
    throw error;
  }

  const { data: existingBucket, error: getBucketError } = await adminClient.storage
    .getBucket(AVATAR_BUCKET);

  if (existingBucket && !getBucketError) {
    return;
  }

  if (getBucketError && !isBucketNotFoundError(getBucketError)) {
    handleSupabaseError(getBucketError, "Failed to verify avatar storage bucket");
  }

  const { error: createBucketError } = await adminClient.storage.createBucket(
    AVATAR_BUCKET,
    {
      public: true,
      allowedMimeTypes: Object.keys(ALLOWED_AVATAR_TYPES),
      fileSizeLimit: MAX_AVATAR_SIZE_BYTES,
    }
  );

  if (createBucketError && !String(createBucketError.message || "").toLowerCase().includes("already exists")) {
    handleSupabaseError(createBucketError, "Failed to create avatar storage bucket");
  }
}

async function uploadAvatar(accessToken, avatarDataUrl) {
  const { buffer, contentType, ext } = decodeAvatarDataUrl(avatarDataUrl);
  const { client, user } = await getRawUser(accessToken);

  const avatarPath = `${user.id}/${Date.now()}.${ext}`;
  let { error: uploadError } = await client.storage
    .from(AVATAR_BUCKET)
    .upload(avatarPath, buffer, {
      contentType,
      upsert: false,
    });

  if (uploadError && isBucketNotFoundError(uploadError)) {
    await ensureAvatarBucketExists();

    const retry = await client.storage.from(AVATAR_BUCKET).upload(avatarPath, buffer, {
      contentType,
      upsert: false,
    });
    uploadError = retry.error;
  }

  handleSupabaseError(
    uploadError,
    `Avatar upload failed. Ensure the '${AVATAR_BUCKET}' storage bucket exists and allows uploads.`
  );

  const existingMetadata = user.user_metadata || {};
  await removeOldAvatarIfPresent(client, existingMetadata.avatar_path);

  const { data } = client.storage.from(AVATAR_BUCKET).getPublicUrl(avatarPath);

  await updateUserViaAccessToken(
    accessToken,
    {
      data: {
        ...existingMetadata,
        avatar_url: data.publicUrl,
        avatar_path: avatarPath,
      },
    },
    "Avatar uploaded but profile update failed"
  );

  const { data: updatedUserData, error: updatedUserError } = await client.auth.getUser(accessToken);
  handleSupabaseError(updatedUserError, "Failed to load updated user profile");

  await upsertProfileRow(client, user.id, {
    avatar_path: avatarPath,
    avatar_url: data.publicUrl,
  });

  return {
    user: sanitizeUser(updatedUserData.user),
    avatarUrl: data.publicUrl,
  };
}

async function updateEmail(accessToken, email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    throw createHttpError("Email is required", 400);
  }

  const { client, user } = await getRawUser(accessToken);

  await updateUserViaAccessToken(
    accessToken,
    { email: normalizedEmail },
    "Failed to request email change"
  );

  const { data, error } = await client.auth.getUser(accessToken);
  handleSupabaseError(error, "Failed to load updated user profile");

  return {
    user: sanitizeUser(data.user),
    message:
      normalizedEmail === user.email
        ? "This email is already set on the account"
        : "Email update requested. Supabase may require confirmation for this change.",
  };
}

async function updatePassword(accessToken, password) {
  const trimmed = String(password || "").trim();
  if (!trimmed) {
    throw createHttpError("Password is required", 400);
  }
  if (trimmed.length < 6) {
    throw createHttpError("Password must be at least 6 characters", 400);
  }

  await updateUserViaAccessToken(
    accessToken,
    { password: trimmed },
    "Failed to update password"
  );

  return {
    success: true,
    message: "Password updated successfully",
  };
}

async function deleteAccount(accessToken, confirmationText) {
  const { client, user } = await getRawUser(accessToken);
  const accountName = getDisplayName(user);
  const requiredPhrase = `I confirm to delete ${accountName}`;

  if (confirmationText !== requiredPhrase) {
    throw createHttpError(
      `Confirmation text mismatch. Please type exactly: ${requiredPhrase}`,
      400
    );
  }

  const adminClient = createSupabaseAdminClient();
  const avatarPath = user.user_metadata?.avatar_path;
  await removeOldAvatarIfPresent(client, avatarPath);

  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  handleSupabaseError(error, "Failed to delete account");

  return {
    success: true,
    message: "Account deleted",
  };
}

module.exports = {
  deleteAccount,
  getCurrentProfile,
  getDisplayName,
  updateEmail,
  updateNickname,
  updatePassword,
  uploadAvatar,
};
