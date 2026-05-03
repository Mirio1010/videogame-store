"use strict";

const { createSupabaseClient } = require("./supabaseClient");

/**
 * Order Service
 * Handles all order operations: creation, retrieval, status updates
 */

/**
 * Calculate estimated delivery date based on order status
 * @param {string} status - Order status
 * @returns {Date} Estimated delivery date
 */
function calculateEstimatedDelivery(status) {
  const now = new Date();
  const daysFromNow = {
    pending: 5,
    confirmed: 4,
    shipped: 2,
  };

  const days = daysFromNow[status];
  if (days) {
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }
  return null; // delivered/cancelled don't have estimate
}

/**
 * Create a new order from raw cart items
 * @param {string} accessToken - User access token
 * @param {Array} rawCartItems - Raw cart rows with steam_id, quantity, price
 * @returns {Object} Created order with items
 */
async function createOrder(accessToken, rawCartItems) {
  if (!rawCartItems || rawCartItems.length === 0) {
    throw new Error("Cannot create order with empty cart");
  }

  const supabase = createSupabaseClient(accessToken);

  // Resolve the authenticated user's ID
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData?.user?.id) {
    throw new Error("Failed to resolve authenticated user");
  }
  const userId = userData.user.id;

  // Calculate total price
  const totalPrice = rawCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedDelivery = calculateEstimatedDelivery("pending");

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      total_price: totalPrice.toFixed(2),
      status: "pending",
      estimated_delivery_date: estimatedDelivery.toISOString(),
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  // Insert order items
  const orderItemsData = rawCartItems.map((item) => ({
    order_id: order.id,
    steam_id: item.steam_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsData);

  if (itemsError) {
    throw new Error(`Failed to add items to order: ${itemsError.message}`);
  }

  // Return order with items
  return { ...order, items: orderItemsData };
}

/**
 * Get all orders for a user
 * @param {string} accessToken - User access token
 * @returns {Array} Array of orders
 */
async function getOrdersByUser(accessToken) {
  const supabase = createSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  // Normalize items field
  return (data || []).map((order) => ({
    ...order,
    items: order.order_items || [],
    order_items: undefined,
  }));
}

/**
 * Get single order with all items
 * @param {string} orderId - Order ID
 * @param {string} accessToken - User access token (RLS enforces ownership)
 * @returns {Object} Order with items
 */
async function getOrderWithItems(orderId, accessToken) {
  const supabase = createSupabaseClient(accessToken);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (orderError) {
    const status = orderError.code === "PGRST116" ? 404 : 400;
    const err = new Error(orderError.message);
    err.statusCode = status;
    throw err;
  }

  return {
    ...order,
    items: order.order_items || [],
    order_items: undefined,
  };
}

/**
 * Update order status (admin only)
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New status
 * @param {string} accessToken - Admin access token
 * @returns {Object} Updated order
 */
async function updateOrderStatus(orderId, newStatus, accessToken) {
  const supabase = createSupabaseClient(accessToken);
  // Validate status
  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  // Recalculate estimated delivery date based on new status
  const estimatedDelivery = calculateEstimatedDelivery(newStatus);

  const updatePayload = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  // Only set estimated delivery for statuses that have one
  if (estimatedDelivery) {
    updatePayload.estimated_delivery_date = estimatedDelivery.toISOString();
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  return data;
}

/**
 * Cancel an order
 * @param {string} orderId - Order ID
 * @param {string} accessToken - User access token (RLS enforces ownership)
 * @returns {Object} Cancelled order
 */
async function cancelOrder(orderId, accessToken) {
  const supabase = createSupabaseClient(accessToken);

  // Fetch order (RLS ensures it belongs to the authenticated user)
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .single();

  if (fetchError) {
    const err = new Error("Order not found or access denied");
    err.statusCode = 404;
    throw err;
  }

  // Can only cancel pending or confirmed orders
  if (!["pending", "confirmed"].includes(order.status)) {
    const err = new Error(`Cannot cancel order with status: ${order.status}`);
    err.statusCode = 400;
    throw err;
  }

  // Update status to cancelled
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      estimated_delivery_date: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to cancel order: ${error.message}`);
  }

  return data;
}

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderWithItems,
  updateOrderStatus,
  cancelOrder,
};
