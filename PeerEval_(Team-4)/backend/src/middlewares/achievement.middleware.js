import asyncHandler from "express-async-handler";
import User from "../models/user.models.js";
import Achievement from "../models/achievement.models.js";
import { checkAndAwardAchievements } from "../controllers/achievement.controller.js";

/**
 * Middleware to automatically check and award achievements based on user activity
 * This runs after successful operations that might trigger achievements
 */
export const achievementTracker = (
  activityType,
  getActivityData = () => ({})
) => {
  return asyncHandler(async (request, response, next) => {
    // Store the original json method
    const originalJson = response.json;

    // Override the json method to track successful operations
    response.json = function (data) {
      // Only track achievements on successful responses (2xx status codes)
      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Run achievement tracking asynchronously to not block the response
        setImmediate(async () => {
          try {
            if (request.user && request.user._id) {
              const activityData =
                typeof getActivityData === "function"
                  ? getActivityData(request, response, data)
                  : getActivityData;

              await trackUserActivity(
                request.user._id,
                activityType,
                activityData
              );
            }
          } catch (error) {
            console.error(
              `Achievement tracking error for ${activityType}:`,
              error
            );
          }
        });
      }

      // Call the original json method
      return originalJson.call(this, data);
    };

    next();
  });
};

/**
 * Core function to track user activity and award achievements
 */
const trackUserActivity = async (userId, activityType, activityData = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Update user activity stats
    await updateUserActivityStats(user, activityType, activityData);

    // Check and award achievements
    await checkAndAwardAchievements(userId, activityType, {
      ...activityData,
      userStats: user.activityStats,
      userRole: user.userRole,
    });
  } catch (error) {
    console.error("Error tracking user activity:", error);
  }
};

/**
 * Update user activity statistics
 */
const updateUserActivityStats = async (user, activityType, activityData) => {
  const updates = {
    "activityStats.lastActiveDate": new Date(),
  };

  // Update consecutive days active
  const today = new Date();
  const lastActive = new Date(user.activityStats.lastActiveDate);
  const diffTime = Math.abs(today.getTime() - lastActive.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    updates["activityStats.consecutiveDaysActive"] =
      user.activityStats.consecutiveDaysActive + 1;
  } else if (diffDays > 1) {
    updates["activityStats.consecutiveDaysActive"] = 1;
  }

  // Update specific activity stats based on activity type
  switch (activityType) {
    case "assignment_submitted":
      updates["$inc"] = { "activityStats.assignmentsSubmitted": 1 };
      break;

    case "assignment_completed":
      updates["$inc"] = { "activityStats.assignmentsCompleted": 1 };
      break;

    case "perfect_score_achieved":
      updates["$inc"] = { "activityStats.perfectScores": 1 };
      break;

    case "evaluation_given":
      updates["$inc"] = { "activityStats.evaluationsGiven": 1 };
      break;

    case "evaluation_received":
      updates["$inc"] = { "activityStats.evaluationsReceived": 1 };
      break;

    case "helpful_evaluation_given":
      updates["$inc"] = { "activityStats.helpfulEvaluations": 1 };
      break;

    // Teacher-specific activities
    case "assignment_created":
      if (user.userRole === "teacher") {
        updates["$inc"] = { "activityStats.assignmentsCreated": 1 };
      }
      break;

    case "course_created":
      if (user.userRole === "teacher") {
        updates["$inc"] = { "activityStats.coursesCreated": 1 };
      }
      break;

    case "student_helped":
      if (user.userRole === "teacher") {
        updates["$inc"] = { "activityStats.studentsHelped": 1 };
      }
      break;

    // Admin-specific activities
    case "user_managed":
      if (user.userRole === "admin") {
        updates["$inc"] = { "activityStats.usersManaged": 1 };
      }
      break;

    case "issue_resolved":
      if (user.userRole === "admin") {
        updates["$inc"] = { "activityStats.issuesResolved": 1 };
      }
      break;

    case "system_improvement":
      if (user.userRole === "admin") {
        updates["$inc"] = { "activityStats.systemImprovements": 1 };
      }
      break;
  }

  // Apply updates to user
  await User.findByIdAndUpdate(user._id, updates);
};

/**
 * Middleware to check daily achievements and streaks
 */
export const dailyAchievementCheck = asyncHandler(
  async (request, response, next) => {
    if (request.user && request.user._id) {
      // Run daily check asynchronously
      setImmediate(async () => {
        try {
          const user = await User.findById(request.user._id);
          if (!user) return;

          const today = new Date().toDateString();
          const lastActive = new Date(
            user.activityStats.lastActiveDate
          ).toDateString();

          // If this is the first activity of the day, check for streak achievements
          if (today !== lastActive) {
            await trackUserActivity(user._id, "daily_activity", {
              consecutiveDays: user.activityStats.consecutiveDaysActive,
            });
          }
        } catch (error) {
          console.error("Daily achievement check error:", error);
        }
      });
    }

    next();
  }
);

/**
 * Middleware to validate achievement creation
 */
export const validateAchievementCreation = asyncHandler(
  async (request, response, next) => {
    const { type, category, points } = request.body;

    // Validate achievement type uniqueness for user
    if (request.body.userId || request.user._id) {
      const targetUserId = request.body.userId || request.user._id;

      const existingAchievement = await Achievement.findOne({
        userId: targetUserId,
        type: type,
      });

      if (existingAchievement) {
        return response.status(409).json({
          success: false,
          message: "User already has this achievement type",
          error: "DUPLICATE_ACHIEVEMENT",
        });
      }
    }

    // Validate category
    const validCategories = [
      "academic",
      "collaboration",
      "milestones",
      "skills",
      "teaching",
      "mentorship",
      "management",
      "leadership",
    ];
    if (!validCategories.includes(category)) {
      return response.status(400).json({
        success: false,
        message: "Invalid achievement category",
        validCategories,
      });
    }

    // Validate points range
    if (points && (points < 1 || points > 200)) {
      return response.status(400).json({
        success: false,
        message: "Achievement points must be between 1 and 200",
      });
    }

    next();
  }
);

/**
 * Middleware to log achievement activities for analytics
 */
export const achievementAnalytics = asyncHandler(
  async (request, response, next) => {
    // Store the original json method
    const originalJson = response.json;

    response.json = function (data) {
      // Log achievement-related activities
      if (response.statusCode >= 200 && response.statusCode < 300) {
        setImmediate(async () => {
          try {
            const logData = {
              timestamp: new Date(),
              userId: request.user?._id,
              userRole: request.user?.userRole,
              action: request.method,
              endpoint: request.originalUrl,
              statusCode: response.statusCode,
              userAgent: request.get("User-Agent"),
              ip: request.ip,
            };

            // You can store this in a separate analytics collection
            console.log(
              "Achievement Analytics:",
              JSON.stringify(logData, null, 2)
            );
          } catch (error) {
            console.error("Achievement analytics error:", error);
          }
        });
      }

      return originalJson.call(this, data);
    };

    next();
  }
);

/**
 * Enhanced achievement tracking with specific activity handlers
 */
export const createActivityTracker = (activityType, customHandler) => {
  return achievementTracker(activityType, (request, response, data) => {
    if (customHandler) {
      return customHandler(request, response, data);
    }

    // Default activity data extraction based on activity type
    switch (activityType) {
      case "assignment_submitted":
        return {
          assignmentId:
            request.params.assignmentId || request.body.assignmentId,
          submissionData: data?.data || {},
        };

      case "evaluation_given":
        return {
          submissionId:
            request.params.submissionId || request.body.submissionId,
          evaluationData: data?.data || {},
        };

      case "assignment_created":
        return {
          assignmentId: data?.data?._id,
          courseId: data?.data?.courseId,
          assignmentData: data?.data || {},
        };

      case "perfect_score_achieved":
        return {
          assignmentId: request.params.assignmentId,
          score: data?.data?.score || 100,
          maxScore: data?.data?.maxScore || 100,
        };

      default:
        return {
          requestData: request.body,
          responseData: data?.data || {},
        };
    }
  });
};

/**
 * Bulk achievement operations middleware
 */
export const bulkAchievementProcessor = asyncHandler(
  async (request, response, next) => {
    if (request.body.userIds && Array.isArray(request.body.userIds)) {
      // Validate user IDs exist
      const validUserIds = await User.find({
        _id: { $in: request.body.userIds },
        isActive: true,
      }).select("_id");

      request.body.validUserIds = validUserIds.map((user) =>
        user._id.toString()
      );

      const invalidCount = request.body.userIds.length - validUserIds.length;
      if (invalidCount > 0) {
        console.warn(
          `${invalidCount} invalid user IDs filtered out from bulk operation`
        );
      }
    }

    next();
  }
);

/**
 * Achievement notification middleware (for future WebSocket integration)
 */
export const achievementNotifier = (
  notificationType = "achievement_earned"
) => {
  return asyncHandler(async (request, response, next) => {
    const originalJson = response.json;

    response.json = function (data) {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        setImmediate(async () => {
          try {
            // Here you would integrate with your notification system
            // For example, WebSocket, push notifications, or email

            const notificationData = {
              userId: request.user?._id,
              type: notificationType,
              data: data?.data,
              timestamp: new Date(),
            };

            // Example: WebSocket notification (implement based on your setup)
            // await sendWebSocketNotification(notificationData);

            // Example: In-app notification
            // await createInAppNotification(notificationData);

            console.log(
              "Achievement Notification:",
              JSON.stringify(notificationData, null, 2)
            );
          } catch (error) {
            console.error("Achievement notification error:", error);
          }
        });
      }

      return originalJson.call(this, data);
    };

    next();
  });
};

// Export all middleware functions
export default {
  achievementTracker,
  dailyAchievementCheck,
  validateAchievementCreation,
  achievementAnalytics,
  createActivityTracker,
  bulkAchievementProcessor,
  achievementNotifier,
  trackUserActivity,
};
