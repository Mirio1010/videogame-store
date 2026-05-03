const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function getErrorMessage(payload, fallbackMessage) {
  if (!payload) return fallbackMessage;
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.message === "string") return payload.message;
  return fallbackMessage;
}

async function request(path, accessToken, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers ?? {}),
    },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(getErrorMessage(payload, "Cart request failed"));
  }

  return payload;
}

export async function fetchCart(accessToken) {
  return request("/api/cart", accessToken, { method: "GET" });
}

export async function addCartItem(accessToken, steamId, quantity = 1) {
  return request("/api/cart/items", accessToken, {
    method: "POST",
    body: JSON.stringify({ steamId, quantity }),
  });
}

export async function updateCartItemQuantity(accessToken, steamId, quantity) {
  return request(`/api/cart/items/${steamId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(accessToken, steamId) {
  return request(`/api/cart/items/${steamId}`, accessToken, {
    method: "DELETE",
  });
}

export async function clearCart(accessToken) {
  return request("/api/cart", accessToken, {
    method: "DELETE",
  });
}
