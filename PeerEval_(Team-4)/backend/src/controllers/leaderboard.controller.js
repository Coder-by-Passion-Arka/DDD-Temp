import LeaderBoard from "../models/leaderBoard.model.js";
import User from "../models/user.models.js";
import Evaluation from "../models/evaluation.models.js";
import Submission from "../models/submissions.models.js";

// Get all leaderboard data
export const getLeaderboard = async (request, response) => {
  try {
    const leaderboardData = await LeaderBoard.find()
      .populate("userId", "userName userEmail userProfileImage")
      // TODO: Do we need to sort here or later down the code with score logic?
      // .sort({ rank: 1 }) // Sort by Ascending order
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

      // TODO: Calculate scores (this is where you'd integrate with your actual scoring logic)
      // const evaluationsCompleted = await calculateEvaluationsCompleted(
      //   user._id
      // );
      // const assignmentsSubmitted = await calculateAssignmentsSubmitted(
      //   user._id
      // );

      // Calculate total score ()
      const score = calculateScore(user?._id);

      // Update the Leaderboard object
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

// TODO:Helper function to implement score calculation logic
async function calculateScore(userId) {
  //  Implement based on your evaluation/assessment models

  // 1. Evaluations Metrics
  const evaluationsCompleted = await Evaluation.find({ userId, status: 'completed' }).countDocuments();
  const totalEvaluationScore = await Evaluation.find({ userId, status: 'completed' }).sum('score');
  const evaluationInProgress = await Evaluation.find({ userId, status: 'in-progress' }).countDocuments();
  const evaluationSubmitted = await Evaluation.find({ userId, status: 'submitted' }).countDocuments();

  // 2. Submission Metrics
  const submissionsCompleted = await Submission.find(userId).countDocuments();
  const totalSubmissionScore = await Submission.find(userId).sum('score');
  const submissionInProgress = await Submission.find(userId).countDocuments({ status: 'under_evaluation' });
  const submissionSubmitted = await Submission.find(userId).countDocuments({ status: 'submitted' });

  // TODO: Improve logic to calculate score for leaderboard
  const scoreForLeaderboard =
    (evaluationsCompleted + submissionsCompleted) + (totalEvaluationScore + totalSubmissionScore) + (submissionInProgress + evaluationInProgress) + (submissionSubmitted + evaluationSubmitted);

  // Normalise the score to a percentage
  return Math.floor(scoreForLeaderboard / 100);

}

async function calculateEvaluationsCompleted(userId){
  const totalEvaluationsCompleted = await Evaluation.find({ userId, status: 'completed' }).countDocuments();
  return totalEvaluationsCompleted;
}
async function calculateAssignmentsSubmitted(userId) {
  //TODO: Improve logic
  const totalAssignmentsSubmitted = await Assignment.find({ userId }).countDocuments();
  return totalAssignmentsSubmitted;
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
