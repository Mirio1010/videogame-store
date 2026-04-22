"use strict";

const { getUserFromAccessToken } = require("../services/authService");

function getBearerToken(req) {
  const authHeader = req.get("authorization") || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

async function authenticateRequest(req, res, next) {
  try {
    const accessToken = getBearerToken(req);
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: "Missing Bearer access token",
      });
    }

    const user = await getUserFromAccessToken(accessToken);
    req.auth = {
      accessToken,
      user,
      role: user.role,
    };

    next();
  } catch (error) {
    const statusCode = error.statusCode || 401;
    res.status(statusCode).json({
      success: false,
      error: error.message || "Authentication failed",
    });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth?.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication is required",
      });
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to access this resource",
      });
    }

    next();
  };
}

module.exports = {
  authenticateRequest,
  authorizeRoles,
  getBearerToken,
};