/**
 * Order Service (Frontend)
 * API client for order operations
 */

const API_BASE = `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/orders`;

function getErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.message === "string") return payload.message;
  return fallback;
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

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Order request failed"));
  }

  return payload;
}

export function createOrder(accessToken) {
  return request("", accessToken, { method: "POST" });
}

export function getOrders(accessToken) {
  return request("", accessToken, { method: "GET" });
}

export function getOrderDetails(orderId, accessToken) {
  return request(`/${orderId}`, accessToken, { method: "GET" });
}

export function cancelOrder(orderId, accessToken) {
  return request(`/${orderId}/cancel`, accessToken, { method: "POST" });
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date and time for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time
 */
export function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get status badge color
 * @param {string} status - Order status
 * @returns {string} CSS class for badge color
 */
export function getStatusBadgeClass(status) {
  const statusMap = {
    pending: "badge-pending",
    confirmed: "badge-confirmed",
    shipped: "badge-shipped",
    delivered: "badge-delivered",
    cancelled: "badge-cancelled",
  };
  return statusMap[status] || "badge-pending";
}

/**
 * Get status display label
 * @param {string} status - Order status
 * @returns {string} Display label
 */
export function getStatusLabel(status) {
  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}
