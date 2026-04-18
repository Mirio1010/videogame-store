const express = require("express");
const cors = require("cors");
const gamesRouter = require("./routes/games");

const app = express();

//!<-- Middleware -->
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Routes
app.use("/api/games", gamesRouter);

// Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

module.exports = app;
