import express from "express";
import {
  getLeaderboard,
  updateLeaderboard,
  getStudentsLeaderboard,
  updateUserScore,
} from "../controllers/leaderboard.controller.js";

const router = express.Router();

// Get the leaderboard data
router.get("/", getLeaderboard);

// Get students leaderboard (specific endpoint for frontend)
router.get("/students", getStudentsLeaderboard);

// Update the leaderboard data
router.post("/update", updateLeaderboard);

// Update individual user score
router.post("/user/score", updateUserScore);

export default router;
