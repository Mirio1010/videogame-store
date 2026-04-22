const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const gamesRouter = require("./routes/games");
const categoriesRouter = require("./routes/categories");

const app = express();

//!<-- Middleware -->
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/games", gamesRouter);
app.use("/api/categories", categoriesRouter);

// Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

module.exports = app;
