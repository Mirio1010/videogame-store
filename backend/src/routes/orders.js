"use strict";

const express = require("express");
const { authenticateRequest } = require("../middleware/auth");
const { getCart, clearCart } = require("../services/cartService");
const {
  createOrder,
  getOrdersByUser,
  getOrderWithItems,
  updateOrderStatus,
  cancelOrder,
} = require("../services/orderService");

const router = express.Router();

// All order routes require authentication
router.use(authenticateRequest);

/**
 * POST /api/orders
 * Create a new order from user's cart
 */
router.post("/", async (req, res, next) => {
  try {
    const accessToken = req.auth.accessToken;

    // Get raw cart items (steam_id, quantity) — price comes from cart rows
    const { items: hydratedItems } = await getCart(accessToken);

    if (!hydratedItems || hydratedItems.length === 0) {
      return res.status(400).json({ message: "Cannot create order from empty cart" });
    }

    // Map hydrated items to the shape orderService expects
    const rawCartItems = hydratedItems.map((item) => ({
      steam_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const order = await createOrder(accessToken, rawCartItems);

    // Clear the cart after order is created
    await clearCart(accessToken);

    res.status(201).json({
      message: "Order created successfully",
      ...order,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders
 * Get all orders for the authenticated user
 */
router.get("/", async (req, res, next) => {
  try {
    const orders = await getOrdersByUser(req.auth.accessToken);

    res.json({
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/:orderId
 * Get a specific order with all items
 */
router.get("/:orderId", async (req, res, next) => {
  try {
    const order = await getOrderWithItems(req.params.orderId, req.auth.accessToken);

    res.json({
      message: "Order retrieved successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/orders/:orderId/cancel
 * Cancel an order (only pending/confirmed orders can be cancelled)
 */
router.post("/:orderId/cancel", async (req, res, next) => {
  try {
    const cancelledOrder = await cancelOrder(req.params.orderId, req.auth.accessToken);

    res.json({
      message: "Order cancelled successfully",
      order: cancelledOrder,
    });
  } catch (error) {
    next(error);
  }
});

// Admin-only routes below this line
// In a real app, you'd add authorization middleware here
// router.use(authorizeRoles("admin"));

/**
 * PATCH /api/orders/:orderId/status
 * Update order status (admin only)
 * Body: { status: "confirmed" | "shipped" | "delivered" | "cancelled" }
 */
router.patch("/:orderId/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.orderId;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedOrder = await updateOrderStatus(orderId, status, req.auth.accessToken);

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;