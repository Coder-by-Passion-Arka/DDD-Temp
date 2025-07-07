import express from "express";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalsByStatus,
  getTodayGoals,
} from "../controllers/goals.controller.js";

const router = express.Router();

// Get all goals
router.get("/", getGoals);

// Get goals by status
router.get("/status/:status", getGoalsByStatus);

// Get today's goals
router.get("/today", getTodayGoals);

// Create a new goal
router.post("/", createGoal);

// Update a goal
router.put("/:id", updateGoal);

// Delete a goal
router.delete("/:id", deleteGoal);

export default router;
