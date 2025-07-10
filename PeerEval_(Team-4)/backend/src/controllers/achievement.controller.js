import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Achievement from "../models/achievement.models.js";
import User from "../models/user.models.js";

// Helper function to check achievement criteria
const checkAchievementCriteria = async (userId, achievementType) => {
  // This would contain logic to check if user meets criteria for specific achievements
  // For now, returning true as placeholder
  return true;
};

// Helper function to award points to user (if you have a points system)
const awardPointsToUser = async (userId, points) => {
  try {
    await User.findByIdAndUpdate(
      userId,
      { $inc: { totalPoints: points } },
      { new: true }
    );
  } catch (error) {
    console.error("Error awarding points:", error);
  }
};

// Common Controllers (used by all roles)

// Get all achievements for current user
const getUserAchievements = asyncHandler(async (request, response) => {
  const userId = request.user._id;
  const { page = 1, limit = 10, category, type } = request.query;

  // Build query filters
  const query = { userId };
  if (category) query.category = category;
  if (type) query.type = type;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const achievements = await Achievement.find(query)
      .sort({ earnedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("context.assignmentId", "title")
      .lean();

    const totalAchievements = await Achievement.countDocuments(query);
    const totalPoints = await Achievement.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);

    return response.status(200).json(
      new ApiResponse(
        200,
        {
          achievements,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalAchievements / parseInt(limit)),
            totalAchievements,
            achievementsPerPage: parseInt(limit),
          },
          totalPoints: totalPoints[0]?.total || 0,
        },
        "Achievements fetched successfully."
      )
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching achievements");
  }
});

// Award/Create achievement
const createAchievement = asyncHandler(async (request, response) => {
  const {
    userId, // User ID to award to (optional for teachers)
    title, // Title of the achievement
    description, // Description of the achievement
    type, // Type of the achievement
    category, // Category of the achievement
    icon, // Icon to use for the achievement
    points = 10, // Points to award for the achievement
    criteria, // Criteria for the achievement
    context, // Context for the achievement
  } = request.body;

  // Check if user has permission (teachers can award to students, admins to anyone)
  const requestingUser = request.user; // User who is trying to award the achievement
  if (requestingUser.userRole === "student") {
    throw new ApiError(403, "Students cannot create achievements");
  }

  if (requestingUser.userRole === "teacher" && !userId) {
    throw new ApiError(400, "Teachers must specify a user ID");
  }

  const targetUserId = userId || requestingUser._id;

  try {
    // Check if user already has this achievement
    const existingAchievement = await Achievement.findOne({
      userId: targetUserId,
      type: type,
    });

    if (existingAchievement) {
      throw new ApiError(409, "User already has this achievement");
    }

    // Verify the user exists
    const user = await User.findById(targetUserId);
    if (!user) {
      throw new ApiError(404, "User not found, Please try again witch correct User ID");
    }

    // Create new achievement
    const achievement = await Achievement.create({
      userId: targetUserId,
      title,
      description,
      type,
      category,
      icon: icon || "Medal",
      points,
      criteria,
      context,
      earnedAt: new Date(),
    });

    // Award points to user
    await awardPointsToUser(targetUserId, points);

    const populatedAchievement = await Achievement.findById(achievement._id)
      .populate("userId", "userName userEmail")
      .populate("context.assignmentId", "title");

    return response
      .status(201)
      .json(
        new ApiResponse(
          201,
          populatedAchievement,
          "Achievement created successfully."
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error creating achievement");
  }
});

// Get single achievement
const getAchievement = asyncHandler(async (request, response) => {
  const { achievementId } = request.params;
  const userId = request.user._id;

  try {
    const achievement = await Achievement.findOne({
      _id: achievementId,
      userId: userId,
    }).populate("context.assignmentId", "title");

    if (!achievement) {
      throw new ApiError(404, "Achievement not found");
    }

    return response
      .status(200)
      .json(
        new ApiResponse(200, achievement, "Achievement fetched successfully.")
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching achievement");
  }
});

// Update achievement (only admin/teacher can update, and only certain fields)
const updateAchievement = asyncHandler(async (request, response) => {
  const { achievementId } = request.params;
  const { 
    title, 
    description, 
    icon, 
    isVisible, 
    context 
  } = request.body;
  const requestingUser = request.user;

  try {
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      throw new ApiError(404, "Achievement not found");
    }

    // Check permissions
    if (requestingUser.userRole === "student") {
      throw new ApiError(403, "Students cannot update achievements");
    }

    // Teachers can only update achievements they awarded
    if (requestingUser.userRole === "teacher") {
      // TODO: May be updated for automatic awarding of achievements
      // For now, allowing teachers to update any achievement
    }

    // Update only allowed fields
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (icon) updateFields.icon = icon;
    if (typeof isVisible === "boolean") updateFields.isVisible = isVisible;
    if (context) updateFields.context = { ...achievement.context, ...context };

    const updatedAchievement = await Achievement.findByIdAndUpdate(
      achievementId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate("userId", "userName userEmail");

    return response
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedAchievement,
          "Achievement updated successfully."
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error updating achievement");
  }
});

// Delete achievement (admin only, or teacher for achievements they awarded)
const deleteAchievement = asyncHandler(async (request, response) => {
  const { achievementId } = request.params;
  const requestingUser = request.user;

  try {
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      throw new ApiError(404, "Achievement not found");
    }

    // Check permissions
    if (requestingUser.userRole === "student") {
      throw new ApiError(403, "Students cannot delete achievements");
    }

    // Remove points from user
    await User.findByIdAndUpdate(
      achievement.userId,
      { $inc: { totalPoints: -achievement.points } },
      { new: true }
    );

    await Achievement.findByIdAndDelete(achievementId);

    return response
      .status(200)
      .json(new ApiResponse(200, {}, "Achievement deleted successfully."));
  } catch (error) {
    throw new ApiError(500, "Error deleting achievement");
  }
});

// Get achievement statistics
const getAchievementStats = asyncHandler(async (request, response) => {
  const userId = request.user._id;

  try {
    const stats = await Achievement.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalAchievements: { $sum: 1 },
          totalPoints: { $sum: "$points" },
          categories: { $addToSet: "$category" },
          latestAchievement: { $max: "$earnedAt" },
        },
      },
    ]);

    const categoryStats = await Achievement.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          points: { $sum: "$points" },
        },
      },
    ]);

    const result = {
      overview: stats[0] || {
        totalAchievements: 0,
        totalPoints: 0,
        categories: [],
        latestAchievement: null,
      },
      byCategory: categoryStats,
    };

    return response
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Achievement statistics fetched successfully."
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching achievement statistics");
  }
});

// Auto-award achievement based on user actions
const checkAndAwardAchievements = asyncHandler(
  async (userId, actionType, actionData) => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const achievementsToAward = [];

      // Define achievement criteria and check them
      switch (actionType) {
        case "assignment_submitted":
          // Check for first assignment achievement
          const firstAssignment = await Achievement.findOne({
            userId: userId,
            type: "first_assignment",
          });

          if (!firstAssignment) {
            achievementsToAward.push({
              userId: userId,
              title: "First Steps",
              description: "Submitted your first assignment",
              type: "first_assignment",
              category: "milestones",
              icon: "ScrollText",
              points: 10,
            });
          }
          break;

        case "perfect_score":
          achievementsToAward.push({
            userId: userId,
            title: "Perfect Score",
            description: "Achieved a perfect score on an assignment",
            type: "perfect_score",
            category: "academic",
            icon: "Star",
            points: 25,
            context: {
              assignmentId: actionData.assignmentId,
              score: actionData.score,
            },
          });
          break;

        case "helpful_peer":
          // Check number of helpful evaluations
          const helpfulCount = actionData.helpfulEvaluations || 0;
          if (helpfulCount >= 10) {
            const existingHelpful = await Achievement.findOne({
              userId: userId,
              type: "helpful_peer",
            });

            if (!existingHelpful) {
              achievementsToAward.push({
                userId: userId,
                title: "Helpful Peer",
                description: "Provided 10 helpful peer evaluations",
                type: "helpful_peer",
                category: "collaboration",
                icon: "Users",
                points: 20,
              });
            }
          }
          break;

        // TODO: Add more achievement types as needed or make some other mechanism
      }

      // Award achievements
      for (const achievementData of achievementsToAward) {
        await Achievement.create(achievementData);
        await awardPointsToUser(userId, achievementData.points);
      }

      return achievementsToAward;
    } catch (error) {
      console.error("Error checking and awarding achievements:", error);
      return [];
    }
  }
);

// Make Achievement Leaderboard
const handleAchievementLeaderboard = asyncHandler(async (request, response) => {
  try {
    const { category, limit = 10, userRole } = request.query;

    const matchStage = { isActive: true };
    if (userRole) matchStage.userRole = userRole;

    // Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "achievements",
          localField: "_id",
          foreignField: "userId",
          as: "achievements",
        },
      },
      {
        $addFields: {
          filteredAchievements: category
            ? {
                $filter: {
                  input: "$achievements",
                  cond: { $eq: ["$$this.category", category] },
                },
              }
            : "$achievements",
        },
      },
      {
        $addFields: {
          totalPoints: { $sum: "$filteredAchievements.points" },
          totalAchievements: { $size: "$filteredAchievements" },
          categories: { $setUnion: ["$filteredAchievements.category"] },
          latestAchievement: { $max: "$filteredAchievements.earnedAt" },
        },
      },
      { $match: { ...matchStage, totalAchievements: { $gt: 0 } } },
      {
        $project: {
          userName: 1,
          userRole: 1,
          userProfileImage: 1,
          totalPoints: 1,
          totalAchievements: 1,
          categories: 1,
          latestAchievement: 1,
          achievementLevel: 1,
        },
      },
      { $sort: { totalPoints: -1, totalAchievements: -1 } },
      { $limit: parseInt(limit) },
    ];

    const leaderboard = await User.aggregate(pipeline);

    return response
      .status(200)
      .json(
        new ApiResponse(200, leaderboard, "Leaderboard fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching leaderboard");
  }
});

// Achievement recommendations based on performance
const handleAchievementRecommendations = asyncHandler(async (request, response) => {
  try {
    const userId = request.user._id;
    const user = await User.findById(userId);
    const existingAchievements = await Achievement.find({ userId }).select(
      "type"
    );
    const existingTypes = existingAchievements.map((a) => a.type);

    const recommendations = [];

    // Analyze user's activity and suggest next achievements
    const { activityStats } = user;

    // Assignment-related recommendations
    if (
      !existingTypes.includes("assignment_veteran") &&
      activityStats.assignmentsSubmitted >= 3
    ) {
      recommendations.push({
        title: "Assignment Veteran",
        description: "Submit 5 assignments to unlock",
        progress: activityStats.assignmentsSubmitted,
        target: 5,
        category: "milestones",
        estimatedPoints: 25,
        progressPercentage: (activityStats.assignmentsSubmitted / 5) * 100,
      });
    }

    // Collaboration recommendations
    if (
      !existingTypes.includes("helpful_peer") &&
      activityStats.helpfulEvaluations >= 5
    ) {
      recommendations.push({
        title: "Helpful Peer",
        description: "Provide 10 helpful evaluations",
        progress: activityStats.helpfulEvaluations,
        target: 10,
        category: "collaboration",
        estimatedPoints: 30,
        progressPercentage: (activityStats.helpfulEvaluations / 10) * 100,
      });
    }

    // Streak recommendations
    if (
      !existingTypes.includes("weekly_warrior") &&
      activityStats.consecutiveDaysActive >= 4
    ) {
      recommendations.push({
        title: "Weekly Warrior",
        description: "Stay active for 7 consecutive days",
        progress: activityStats.consecutiveDaysActive,
        target: 7,
        category: "milestones",
        estimatedPoints: 20,
        progressPercentage: (activityStats.consecutiveDaysActive / 7) * 100,
      });
    }

    return response
      .status(200)
      .json(
        new ApiResponse(
          200,
          recommendations,
          "Achievement recommendations fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching achievement recommendations");
  }
});

const getSystemStats = asyncHandler(async (request, response) => {
  try {
    // Overall system achievement statistics
    const totalAchievements = await Achievement.countDocuments();
    const totalUsers = await User.countDocuments({ isActive: true });
    const usersWithAchievements = await Achievement.distinct("userId").then(
      (ids) => ids.length
    );

    // Achievement distribution by category
    const categoryStats = await Achievement.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalPoints: { $sum: "$points" },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $addFields: {
          uniqueUserCount: { $size: "$uniqueUsers" },
        },
      },
      {
        $project: {
          uniqueUsers: 0,
        },
      },
    ]);

    // Top achievement types
    const topAchievementTypes = await Achievement.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          category: { $first: "$category" },
          avgPoints: { $avg: "$points" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Recent achievements
    const recentAchievements = await Achievement.find()
      .populate("userId", "userName userRole")
      .sort({ earnedAt: -1 })
      .limit(20);

    // User engagement stats
    const userEngagementStats = await User.aggregate([
      {
        $group: {
          _id: null,
          avgTotalPoints: { $avg: "$totalPoints" },
          avgAchievements: { $avg: "$achievementStats.totalAchievements" },
          maxPoints: { $max: "$totalPoints" },
          maxLevel: { $max: "$achievementLevel" },
        },
      },
    ]);

    const systemStats = {
      overview: {
        totalAchievements,
        totalUsers,
        usersWithAchievements,
        engagementRate:
          totalUsers > 0
            ? ((usersWithAchievements / totalUsers) * 100).toFixed(2)
            : 0,
      },
      categoryDistribution: categoryStats,
      topAchievementTypes,
      recentAchievements,
      userEngagement: userEngagementStats[0] || {
        avgTotalPoints: 0,
        avgAchievements: 0,
        maxPoints: 0,
        maxLevel: 1,
      },
    };

    return response
      .status(200)
      .json(
        new ApiResponse(
          200,
          systemStats,
          "System achievement statistics fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching system achievement statistics");
  }
});

// Role-specific aliases for backwards compatibility
const getTeacherAchievements = getUserAchievements;
const getTeacherAchievement = getAchievement;
const addTeacherAchievement = createAchievement;
const updateTeacherAchievement = updateAchievement;
const deleteTeacherAchievement = deleteAchievement;

const getAdminAchievements = getUserAchievements;
const getAdminAchievement = getAchievement;
const addAdminAchievements = createAchievement;
const updateAdminAchievement = updateAchievement;
const deleteAdminAchievement = deleteAchievement;

const getStudentAchievements = getUserAchievements;
const getStudentAchievement = getAchievement;
const addStudentAchievements = createAchievement;
const updateStudentAchievement = updateAchievement;
const deleteStudentAchievement = deleteAchievement;

export {
  // Common functions
  getUserAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievementStats,
  checkAndAwardAchievements,
  handleAchievementLeaderboard,

  // Role-specific aliases (for backwards compatibility)
  getTeacherAchievements,
  getTeacherAchievement,
  addTeacherAchievement,
  updateTeacherAchievement,
  deleteTeacherAchievement,
  getAdminAchievements,
  getAdminAchievement,
  addAdminAchievements,
  updateAdminAchievement,
  deleteAdminAchievement,
  getStudentAchievements,
  getStudentAchievement,
  addStudentAchievements,
  updateStudentAchievement,
  deleteStudentAchievement,
  handleAchievementRecommendations,
  getSystemStats,
};
