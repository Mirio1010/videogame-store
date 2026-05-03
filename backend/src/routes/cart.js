"use strict";

const express = require("express");
const { authenticateRequest } = require("../middleware/auth");
const {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  setCartItemQuantity,
} = require("../services/cartService");

const router = express.Router();

router.use(authenticateRequest);

router.get("/", async (req, res, next) => {
  try {
    const result = await getCart(req.auth.accessToken);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const result = await addCartItem(
      req.auth.accessToken,
      req.body?.steamId,
      req.body?.quantity ?? 1
    );
    res.json({
      success: true,
      message: "Cart updated",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/items/:steamId", async (req, res, next) => {
  try {
    const result = await setCartItemQuantity(
      req.auth.accessToken,
      req.params.steamId,
      req.body?.quantity
    );
    res.json({
      success: true,
      message: "Cart updated",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/items/:steamId", async (req, res, next) => {
  try {
    const result = await removeCartItem(req.auth.accessToken, req.params.steamId);
    res.json({
      success: true,
      message: "Item removed",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const result = await clearCart(req.auth.accessToken);
    res.json({
      success: true,
      message: "Cart cleared",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
