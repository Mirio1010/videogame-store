"use strict";

const express = require("express");
const {
  loginUser,
  logoutUser,
  registerUser,
} = require("../services/authService");
const {
  authenticateRequest,
  authorizeRoles,
} = require("../middleware/auth");

const router = express.Router();

function requireFields(payload, fields) {
  const missingFields = fields.filter((field) => !payload?.[field]);

  if (missingFields.length > 0) {
    const error = new Error(`Missing required fields: ${missingFields.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
}

router.post("/register", async (req, res, next) => {
  try {
    requireFields(req.body, ["email", "password"]);

    const result = await registerUser({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
    });

    res.status(201).json({
      success: true,
      message: result.needsEmailConfirmation
        ? "Registration created. Confirm the email before logging in."
        : "Registration successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    requireFields(req.body, ["email", "password"]);

    const result = await loginUser({
      email: req.body.email,
      password: req.body.password,
    });

    res.json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", authenticateRequest, async (req, res, next) => {
  try {
    await logoutUser({
      accessToken: req.auth.accessToken,
      refreshToken: req.body.refreshToken,
    });

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticateRequest, async (req, res) => {
  res.json({
    success: true,
    user: req.auth.user,
  });
});

router.get(
  "/admin/check",
  authenticateRequest,
  authorizeRoles("admin"),
  async (req, res) => {
    res.json({
      success: true,
      message: "Admin authorization confirmed",
      user: req.auth.user,
    });
  }
);

module.exports = router;