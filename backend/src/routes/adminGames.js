"use strict";

const express = require("express");
const router = express.Router();
const {
  authenticateRequest,
  authorizeRoles,
} = require("../middleware/auth");
const { fetchAppDetails } = require("../services/steamService");
const {
  addAdminGame,
  applyAdminOverrides,
  deleteAdminGame,
  listAdminGames,
  updateAdminGame,
} = require("../services/adminCatalogService");

router.use(authenticateRequest, authorizeRoles("admin"));

async function withSteamDetails(adminEntry) {
  const game = await fetchAppDetails(adminEntry.steamId);
  return {
    ...adminEntry,
    game: game ? applyAdminOverrides(game, adminEntry) : null,
  };
}

router.get("/games", async (req, res, next) => {
  try {
    const adminGames = await listAdminGames();
    const games = await Promise.all(adminGames.map(withSteamDetails));
    res.json({ success: true, games });
  } catch (err) {
    next(err);
  }
});

router.post("/games", async (req, res, next) => {
  try {
    const steamId = Number(req.body.steamId);
    const game = await fetchAppDetails(steamId);

    if (!game) {
      return res
        .status(404)
        .json({ success: false, error: "Game not found on Steam." });
    }

    const adminGame = await addAdminGame(req.body);
    const response = await withSteamDetails(adminGame);
    res.status(201).json({ success: true, game: response });
  } catch (err) {
    next(err);
  }
});

router.put("/games/:steamId", async (req, res, next) => {
  try {
    const adminGame = await updateAdminGame(req.params.steamId, req.body);
    const response = await withSteamDetails(adminGame);
    res.json({ success: true, game: response });
  } catch (err) {
    next(err);
  }
});

router.delete("/games/:steamId", async (req, res, next) => {
  try {
    await deleteAdminGame(req.params.steamId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
