const express = require("express");
const router = express.Router();

const { 
  saveSession,
  updateSession,
  getUserSessions,
  searchSessions,
  getSessionStats,
  getSessionById, 
  deleteSession 
} = require("../controllers/session.controller");

router.post("/save", saveSession);
router.put("/:sessionId", updateSession);
router.get("/user/:userId", getUserSessions);
router.get("/search/:userId", searchSessions);
router.get("/stats/:userId", getSessionStats);
router.get("/:sessionId", getSessionById);
router.delete("/:sessionId", deleteSession);

module.exports = router;

