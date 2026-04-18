"use strict";

const express = require("express");
const router = express.Router();
const { getAllGames } = require("../services/steamService");

// GET /api/categories
// Returns unique genres derived from the curated game catalog.
router.get("/", async (req, res, next) => {
  try {
    const games = await getAllGames();

    // Collect unique genre names across all games
    const seen = new Set();
    const categories = [];

    for (const game of games) {
      for (const genre of game.genres ?? []) {
        if (!seen.has(genre)) {
          seen.add(genre);
          categories.push({
            id: categories.length + 1,
            name: genre,
            slug: genre.toLowerCase().replace(/\s+/g, "-"),
          });
        }
      }
    }

    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
