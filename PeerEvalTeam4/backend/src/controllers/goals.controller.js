import Goal from "../models/goals.models.js";

// Get all goals
export const getGoals = async (request, response) => {
  try {
    const goals = await Goal.find().sort({ priority: -1, dueDate: 1 }).lean(); // Use lean() for better performance when not modifying documents

    response.status(200).json(goals);
  } catch (err) {
    console.error("Error fetching goals:", err);
    response.status(500).json({
      error: "Failed to fetch goals",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Create a new goal
export const createGoal = async (request, response) => {
  try {
    const { task, dueTime, dueDate, progress = 0 } = request.body;

    // Validation
    if (!task || !dueTime || !dueDate) {
      return response.status(400).json({
        error: "Missing requestuired fields: task, dueTime, dueDate",
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!dateRegex.test(dueDate)) {
      return response.status(400).json({
        error: "Invalid dueDate format. Use YYYY-MM-DD",
      });
    }

    if (!timeRegex.test(dueTime)) {
      return response.status(400).json({
        error: "Invalid dueTime format. Use HH:MM",
      });
    }

    // Check if the due date is not in the past
    const goalDateTime = new Date(`${dueDate}T${dueTime}`);
    const now = new Date();

    if (goalDateTime < now) {
      return response.status(400).json({
        error: "Due date and time cannot be in the past",
      });
    }

    const goal = new Goal({
      task: task.trim(),
      dueTime,
      dueDate,
      progress: Math.max(0, Math.min(100, progress)),
    });

    await goal.save();
    response.status(201).json(goal);
  } catch (err) {
    console.error("Error creating goal:", err);

    if (err.name === "ValidationError") {
      return response.status(400).json({
        error: "Validation error",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    response.status(500).json({
      error: "Failed to create goal",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Update a goal
export const updateGoal = async (request, response) => {
  try {
    const { id } = request.params;
    const updates = request.body;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return response.status(400).json({ error: "Invalid goal ID format" });
    }

    // Remove fields that shouldn't be updated directly
    delete updates._id; // ObjectId field
    delete updates.__v; // Version field
    delete updates.createdAt; // CreatedAt field
    delete updates.updatedAt; // UpdatedAt field

    // Validate progress if provided
    if (updates.progress !== undefined) {
      updates.progress = Math.max(0, Math.min(100, updates.progress));
    }

    // Validate date and time formats if provided
    if (updates.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(updates.dueDate)) {
      return response.status(400).json({
        error: "Invalid dueDate format. Use YYYY-MM-DD",
      });
    }

    if (
      updates.dueTime &&
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updates.dueTime)
    ) {
      return response.status(400).json({
        error: "Invalid dueTime format. Use HH:MM",
      });
    }

    const goal = await Goal.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!goal) {
      return response.status(404).json({ error: "Goal not found" });
    }

    response.status(200).json(goal);
  } catch (err) {
    console.error("Error updating goal:", err);

    if (err.name === "ValidationError") {
      return response.status(400).json({
        error: "Validation error",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    if (err.name === "CastError") {
      return response.status(400).json({ error: "Invalid goal ID" });
    }

    response.status(500).json({
      error: "Failed to update goal",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Delete a goal
export const deleteGoal = async (request, response) => {
  try {
    const { id } = request.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return response.status(400).json({ error: "Invalid goal ID format" });
    }

    const goal = await Goal.findByIdAndDelete(id);

    if (!goal) {
      return response.status(404).json({ error: "Goal not found" });
    }

    response.status(200).json({
      message: "Goal deleted successfully",
      deletedGoal: {
        id: goal._id,
        task: goal.task,
      },
    });
  } catch (err) {
    console.error("Error deleting goal:", err);

    if (err.name === "CastError") {
      return response.status(400).json({ error: "Invalid goal ID" });
    }

    response.status(500).json({
      error: "Failed to delete goal",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Get goals by status
export const getGoalsByStatus = async (request, response) => {
  try {
    const { status } = request.params;
    const validStatuses = [
      "in-progress",
      "completed",
      "missed",
      "deadline-approaching",
    ];

    if (!validStatuses.includes(status)) {
      return response.status(400).json({
        error: "Invalid status",
        validStatuses,
      });
    }

    const goals = await Goal.find({ status })
      .sort({ priority: -1, dueDate: 1 })
      .lean();

    response.status(200).json(goals);
  } catch (err) {
    console.error("Error fetching goals by status:", err);
    response.status(500).json({
      error: "Failed to fetch goals by status",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Get goals due today
export const getTodayGoals = async (request, response) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    const goals = await Goal.find({ dueDate: today })
      .sort({ priority: -1, dueTime: 1 })
      .lean();

    response.status(200).json(goals);
  } catch (err) {
    console.error("Error fetching today's goals:", err);
    response.status(500).json({
      error: "Failed to fetch today's goals",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
