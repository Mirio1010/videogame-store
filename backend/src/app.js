const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const cartRouter = require("./routes/cart");
const gamesRouter = require("./routes/games");
const categoriesRouter = require("./routes/categories");

const app = express();

//!<-- Middleware -->
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/cart", cartRouter);
app.use("/api/games", gamesRouter);
app.use("/api/categories", categoriesRouter);

// Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);

  if (err?.type === "entity.too.large") {
    const isAvatarUpload = req.path === "/api/profile/avatar";
    return res.status(413).json({
      success: false,
      error: isAvatarUpload
        ? "Avatar file is too large. Please upload an image under 2MB."
        : "Request payload is too large.",
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

module.exports = app;
