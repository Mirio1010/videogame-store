"use strict";

const express = require("express");
const router = express.Router();
const { fetchAppDetails, getAllGames } = require("../services/steamService");

// GET /api/games
// Optional query params:
//   ?featured=true  → only featured games
//   ?onSale=true    → only games currently discounted
//   ?genre=Action   → only games with specified genre (comma-separated for multiple)
//   ?minPrice=10    → only games >= minPrice
//   ?maxPrice=50    → only games <= maxPrice
router.get("/", async (req, res, next) => {
  try {
    let games = await getAllGames();

    if (req.query.featured === "true") {
      games = games.filter((g) => g.featured);
    }
    if (req.query.onSale === "true") {
      games = games.filter((g) => g.onSale);
    }
    if (req.query.genre) {
      const genres = req.query.genre
        .split(",")
        .map((g) => g.trim().toLowerCase());
      games = games.filter((g) =>
        genres.some((genre) =>
          (g.genres ?? []).map((gg) => gg.toLowerCase()).includes(genre),
        ),
      );
    }
    if (req.query.minPrice !== undefined) {
      const minPrice = parseFloat(req.query.minPrice);
      if (!isNaN(minPrice)) {
        games = games.filter((g) => g.price >= minPrice);
      }
    }
    if (req.query.maxPrice !== undefined) {
      const maxPrice = parseFloat(req.query.maxPrice);
      if (!isNaN(maxPrice)) {
        games = games.filter((g) => g.price <= maxPrice);
      }
    }

    res.json({ success: true, games });
  } catch (err) {
    next(err);
  }
});

// GET /api/games/:steamId
// Returns full details for a single game by its Steam App ID.
// Pass any valid Steam App ID — not limited to the curated catalog.
router.get("/:steamId", async (req, res, next) => {
  try {
    const steamId = parseInt(req.params.steamId, 10);
    if (isNaN(steamId) || steamId <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Steam App ID" });
    }

    const game = await fetchAppDetails(steamId);
    if (!game) {
      return res
        .status(404)
        .json({ success: false, error: "Game not found on Steam" });
    }

    res.json({ success: true, game });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
