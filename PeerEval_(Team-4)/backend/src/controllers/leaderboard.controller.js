import LeaderBoard from "../models/leaderBoard.model.js";
import User from "../models/user.models.js";

// Get all leaderboard data
export const getLeaderboard = async (request, response) => {
  try {
    const leaderboardData = await LeaderBoard.find()
      .populate("userId", "userName userEmail userProfileImage")
      .sort({ rank: 1 }) // Sort by rank ascending (1, 2, 3...)
      .lean();

    // Transform data to match frontend interface
    const transformedData = leaderboardData.map((entry) => ({
      id: entry._id.toString(),
      name: entry.userName,
      avatar:
        entry.avatar ||
        entry.userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
      score: entry.score,
      rank: entry.rank,
      change: entry.change,
      evaluationsCompleted: entry.evaluationsCompleted,
      assignmentsSubmitted: entry.assignmentsSubmitted,
    }));

    response.status(200).json(transformedData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    response.status(500).json({
      error: "Failed to fetch leaderboard data",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update/Recalculate the leaderboard data
export const updateLeaderboard = async (request, response) => {
  try {
    // Get all users and calculate their scores
    const users = await User.find({ userRole: "student", isActive: true })
      .select("userName userEmail")
      .lean();

    const leaderboardUpdates = [];

    for (const user of users) {
      // Get existing leaderboard entry
      const existingEntry = await LeaderBoard.findOne({ userId: user._id });

      // Calculate scores (this is where you'd integrate with your actual scoring logic)
      const evaluationsCompleted = await calculateEvaluationsCompleted(
        user._id
      );
      const assignmentsSubmitted = await calculateAssignmentsSubmitted(
        user._id
      );

      // Calculate total score
      const score = evaluationsCompleted * 25 + assignmentsSubmitted * 15;

      const updateData = {
        userId: user._id,
        userName: user.userName,
        score,
        evaluationsCompleted,
        assignmentsSubmitted,
        change: existingEntry ? score - existingEntry.score : 0,
        lastUpdated: new Date(),
      };

      leaderboardUpdates.push(updateData);
    }

    // Sort by score and assign ranks
    leaderboardUpdates.sort((a, b) => b.score - a.score);
    leaderboardUpdates.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Update database
    for (const update of leaderboardUpdates) {
      await LeaderBoard.findOneAndUpdate({ userId: update.userId }, update, {
        upsert: true,
        new: true,
      });
    }

    // Return updated leaderboard
    const updatedLeaderboard = await LeaderBoard.find()
      .sort({ rank: 1 })
      .lean();

    const transformedData = updatedLeaderboard.map((entry) => ({
      id: entry._id.toString(),
      name: entry.userName,
      avatar:
        entry.avatar ||
        entry.userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
      score: entry.score,
      rank: entry.rank,
      change: entry.change,
      evaluationsCompleted: entry.evaluationsCompleted,
      assignmentsSubmitted: entry.assignmentsSubmitted,
    }));

    response.status(200).json(transformedData);
  } catch (error) {
    console.error("Error updating leaderboard data:", error);
    response.status(500).json({
      error: "Failed to update leaderboard data",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Helper functions (you'll need to implement these based on your actual data models)
async function calculateEvaluationsCompleted(userId) {
  // TODO: Implement based on your evaluation/assessment models
  // Example: return await Evaluation.countDocuments({ userId, status: 'completed' });
  return Math.floor(Math.random() * 100); // Placeholder
}

async function calculateAssignmentsSubmitted(userId) {
  // TODO: Implement based on your assignment models
  // Example: return await Assignment.countDocuments({ userId, status: 'submitted' });
  return Math.floor(Math.random() * 50); // Placeholder
}

// Get leaderboard for specific students (alias for getLeaderboard)
export const getStudentsLeaderboard = getLeaderboard;

// Update user score (for real-time updates)
export const updateUserScore = async (request, response) => {
  try {
    const { userId, scoreChange, type } = request.body;

    if (!userId || !scoreChange || !type) {
      return response.status(400).json({
        error: "Missing required fields: userId, scoreChange, type",
      });
    }

    const leaderboardEntry = await LeaderBoard.findOne({ userId });

    if (!leaderboardEntry) {
      return response.status(404).json({
        error: "User not found in leaderboard",
      });
    }

    // Update score and relevant counters
    leaderboardEntry.score += scoreChange;

    if (type === "evaluation") {
      leaderboardEntry.evaluationsCompleted += 1;
    } else if (type === "assignment") {
      leaderboardEntry.assignmentsSubmitted += 1;
    }

    await leaderboardEntry.save();

    // Recalculate ranks for all users
    await recalculateRanks();

    response.status(200).json({
      message: "Score updated successfully",
      newScore: leaderboardEntry.score,
    });
  } catch (error) {
    console.error("Error updating user score:", error);
    response.status(500).json({
      error: "Failed to update user score",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Helper function to recalculate ranks
async function recalculateRanks() {
  const entries = await LeaderBoard.find().sort({ score: -1 });

  for (let i = 0; i < entries.length; i++) {
    const oldRank = entries[i].rank;
    const newRank = i + 1;
    const change = oldRank - newRank; // Positive means moved up

    await LeaderBoard.findByIdAndUpdate(entries[i]._id, {
      rank: newRank,
      change: change,
    });
  }
}

export default {
  getLeaderboard,
  getStudentsLeaderboard,
  updateUserScore,
};
