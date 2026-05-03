"use strict";

const express = require("express");
const { authenticateRequest } = require("../middleware/auth");
const {
  deleteAccount,
  getCurrentProfile,
  getDisplayName,
  updateEmail,
  updateNickname,
  updatePassword,
  uploadAvatar,
} = require("../services/profileService");

const router = express.Router();

router.use(authenticateRequest);

router.get("/", async (req, res, next) => {
  try {
    const user = await getCurrentProfile(req.auth.accessToken);
    res.json({
      success: true,
      user,
      accountName: getDisplayName(user),
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/nickname", async (req, res, next) => {
  try {
    const user = await updateNickname(req.auth.accessToken, req.body?.nickname);
    res.json({
      success: true,
      message: "Nickname updated",
      user,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/avatar", async (req, res, next) => {
  try {
    const result = await uploadAvatar(req.auth.accessToken, req.body?.avatarDataUrl);
    res.json({
      success: true,
      message: "Avatar updated",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/email", async (req, res, next) => {
  try {
    const result = await updateEmail(req.auth.accessToken, req.body?.email);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/password", async (req, res, next) => {
  try {
    const result = await updatePassword(req.auth.accessToken, req.body?.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/delete-account", async (req, res, next) => {
  try {
    const result = await deleteAccount(
      req.auth.accessToken,
      req.body?.confirmationText
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
