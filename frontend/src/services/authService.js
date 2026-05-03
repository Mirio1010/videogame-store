const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function getErrorMessage(payload, fallbackMessage) {
  if (!payload) return fallbackMessage;
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.message === "string") return payload.message;
  return fallbackMessage;
}

async function request(path, options = {}) {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(getErrorMessage(payload, "Request failed"));
  }

  return payload;
}

export async function register({ name, email, password }) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login({ email, password }) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout({ accessToken, refreshToken } = {}) {
  if (!accessToken) {
    return { success: true };
  }

  return request("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function getCurrentUser(accessToken) {
  return request("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getProfile(accessToken) {
  return request("/api/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function updateNickname({ accessToken, nickname }) {
  return request("/api/profile/nickname", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ nickname }),
  });
}

export async function uploadAvatar({ accessToken, avatarDataUrl }) {
  return request("/api/profile/avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ avatarDataUrl }),
  });
}

export async function updateEmail({ accessToken, email }) {
  return request("/api/profile/email", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ email }),
  });
}

export async function updatePassword({ accessToken, password }) {
  return request("/api/profile/password", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password }),
  });
}

export async function deleteAccount({ accessToken, confirmationText }) {
  return request("/api/profile/delete-account", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ confirmationText }),
  });
}
