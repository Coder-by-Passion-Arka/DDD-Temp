import { Router } from "express";
import {
  getDailyActivities,
  getDailyActivity,
  createOrUpdateDailyActivity,
  addActivity,
  updateActivity,
  deleteDailyActivity,
  deleteActivity,
  getActivityStats,
  getActivityLeaderboard,
  getStudentActivities,
  reviewStudentActivity,
  getActivitiesForReview,
} from "../controllers/dailyActivity.controller.js";
import {
  verifyJWT,
  authorizeRoles,
  isTeacherOrAdmin,
  validateRequiredFields,
} from "../middlewares/auth.middleware.js";
import DailyActivity from "../models/dailyActivities.models.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// ============================================
// Public Routes (All Authenticated Users)
// ============================================

// Get current user's daily activities
router.route("/").get(getDailyActivities);

// Get specific daily activity (with role-based access control)
router.route("/:activityId").get(getDailyActivity);

// Create or update daily activity (students can only manage their own)
router
  .route("/")
  .post(validateRequiredFields(["date"]), createOrUpdateDailyActivity);

// Update specific daily activity
router
  .route("/:activityId")
  .put(validateRequiredFields(["date"]), createOrUpdateDailyActivity);

// Delete daily activity
router.route("/:activityId").delete(deleteDailyActivity);

// ============================================
// Activity Management Routes
// ============================================

// Add single activity to existing daily record
router
  .route("/activity")
  .post(
    validateRequiredFields(["date", "type", "title", "startTime", "endTime"]),
    addActivity
  );

// Update specific activity within a daily record
router.route("/:activityId/activity/:subActivityId").patch(updateActivity);

// Delete specific activity from daily record
router.route("/:activityId/activity/:subActivityId").delete(deleteActivity);

// ============================================
// Analytics and Statistics Routes
// ============================================

// Get activity statistics for current user
router.route("/stats/personal").get(getActivityStats);

// Get activity leaderboard (public activities only)
router.route("/stats/leaderboard").get(getActivityLeaderboard);

// ============================================
// Student-Specific Routes
// ============================================

// Get activities by date for current user
router
  .route("/date/:date")
  .get(
    authorizeRoles("student", "teacher", "admin"),
    async (request, response, next) => {
      // Add date to query parameters
      request.query.date = request.params.date;
      request.query.limit = 1; // Only get one day's activities
      return getDailyActivities(request, response, next);
    }
  );

// Get current user's activity statistics
router
  .route("/my-stats")
  .get(authorizeRoles("student", "teacher", "admin"), getActivityStats);

// ============================================
// Teacher and Admin Routes
// ============================================

// Get activities requiring review
router.route("/admin/review").get(isTeacherOrAdmin, getActivitiesForReview);

// Review specific activity
router
  .route("/admin/review/:activityId")
  .patch(
    isTeacherOrAdmin,
    validateRequiredFields(["reviewStatus"]),
    reviewStudentActivity
  );

// Get all students' activities overview (for dashboard)
router
  .route("/admin/overview")
  .get(isTeacherOrAdmin, async (request, response, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = "date",
        sortOrder = "desc",
        reviewStatus,
        studentName,
        dateRange = 7,
      } = request.query;

      // Build aggregation pipeline for overview
      const pipeline = [
        {
          $match: {
            date: {
              $gte: new Date(
                Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000
              ),
              $lte: new Date(),
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $match: {
            "user.userRole": "student",
            "user.isActive": true,
          },
        },
      ];

      // Add review status filter
      if (reviewStatus && reviewStatus !== "all") {
        pipeline.push({
          $match: { reviewStatus },
        });
      }

      // Add student name filter
      if (studentName) {
        pipeline.push({
          $match: {
            "user.userName": { $regex: studentName, $options: "i" },
          },
        });
      }

      // Add sorting
      const sortObj = {};
      sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;
      pipeline.push({ $sort: sortObj });

      // Add pagination
      pipeline.push(
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      );

      // Project fields
      pipeline.push({
        $project: {
          date: 1,
          "summary.totalStudyTime": 1,
          "summary.totalActivities": 1,
          "summary.averageProductivity": 1,
          dayRating: 1,
          reviewStatus: 1,
          reviewedAt: 1,
          "streakData.isActiveDay": 1,
          user: {
            _id: 1,
            userName: 1,
            userEmail: 1,
            userProfileImage: 1,
          },
        },
      });

      const activities = await DailyActivity.aggregate(pipeline);

      // Get total count for pagination
      const countPipeline = pipeline.slice(0, -3); // Remove skip, limit, and project
      countPipeline.push({ $count: "total" });
      const countResult = await DailyActivity.aggregate(countPipeline);
      const totalActivities = countResult[0]?.total || 0;

      return response.status(200).json({
        success: true,
        data: {
          activities,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalActivities / parseInt(limit)),
            totalActivities,
            activitiesPerPage: parseInt(limit),
          },
        },
        message: "Activities overview fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  });

// Get specific student's activities
router
  .route("/admin/student/:studentId")
  .get(isTeacherOrAdmin, getStudentActivities);

// Get student activity statistics
router
  .route("/admin/student/:studentId/stats")
  .get(isTeacherOrAdmin, async (request, response, next) => {
    // Add studentId to request for reuse of getActivityStats
    const originalUserId = request.user._id;
    request.user._id = request.params.studentId;

    try {
      await getActivityStats(request, response, next);
    } finally {
      // Restore original user ID
      request.user._id = originalUserId;
    }
  });

// ============================================
// Admin-Only Routes
// ============================================

// Bulk operations for activities
router
  .route("/admin/bulk-actions")
  .post(
    authorizeRoles("admin"),
    validateRequiredFields(["action", "activityIds"]),
    async (request, response, next) => {
      try {
        const { action, activityIds, reviewStatus, reviewNotes } = request.body;
        const reviewerId = request.user._id;

        if (!Array.isArray(activityIds) || activityIds.length === 0) {
          throw new ApiError(400, "activityIds must be a non-empty array");
        }

        let result;

        switch (action) {
          case "review":
            if (!reviewStatus) {
              throw new ApiError(
                400,
                "reviewStatus is required for review action"
              );
            }

            result = await DailyActivity.updateMany(
              { _id: { $in: activityIds } },
              {
                $set: {
                  reviewStatus,
                  reviewNotes: reviewNotes || "",
                  reviewedBy: reviewerId,
                  reviewedAt: new Date(),
                },
              }
            );

            return response.status(200).json({
              success: true,
              data: {
                modifiedCount: result.modifiedCount,
                action: "review",
              },
              message: `${result.modifiedCount} activities reviewed successfully`,
            });

          case "delete":
            result = await DailyActivity.deleteMany({
              _id: { $in: activityIds },
            });

            return response.status(200).json({
              success: true,
              data: {
                deletedCount: result.deletedCount,
                action: "delete",
              },
              message: `${result.deletedCount} activities deleted successfully`,
            });

          default:
            throw new ApiError(
              400,
              "Invalid action. Supported actions: review, delete"
            );
        }
      } catch (error) {
        next(error);
      }
    }
  );

// System-wide activity statistics
router
  .route("/admin/system-stats")
  .get(authorizeRoles("admin"), async (request, response, next) => {
    try {
      const { period = "month" } = request.query;

      let dateRange;
      switch (period) {
        case "week":
          dateRange = 7;
          break;
        case "month":
          dateRange = 30;
          break;
        case "year":
          dateRange = 365;
          break;
        default:
          dateRange = 30;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - dateRange);

      // Get system-wide statistics
      const systemStats = await DailyActivity.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalActivities: { $sum: "$summary.totalActivities" },
            totalStudyTime: { $sum: "$summary.totalStudyTime" },
            totalUsers: { $addToSet: "$userId" },
            averageProductivity: { $avg: "$summary.averageProductivity" },
            activeDays: {
              $sum: { $cond: ["$streakData.isActiveDay", 1, 0] },
            },
          },
        },
        {
          $addFields: {
            totalUsers: { $size: "$totalUsers" },
          },
        },
      ]);

      // Get activity type distribution
      const activityDistribution = await DailyActivity.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        { $unwind: "$activities" },
        {
          $group: {
            _id: "$activities.type",
            count: { $sum: 1 },
            totalDuration: { $sum: "$activities.duration" },
            avgProductivity: { $avg: "$activities.productivity" },
          },
        },
        { $sort: { totalDuration: -1 } },
      ]);

      // Get daily trends
      const dailyTrends = await DailyActivity.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date",
              },
            },
            totalStudyTime: { $sum: "$summary.totalStudyTime" },
            totalActivities: { $sum: "$summary.totalActivities" },
            activeUsers: { $addToSet: "$userId" },
            averageProductivity: { $avg: "$summary.averageProductivity" },
          },
        },
        {
          $addFields: {
            activeUsers: { $size: "$activeUsers" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return response.status(200).json({
        success: true,
        data: {
          period,
          dateRange: { start: startDate, end: endDate },
          systemStats: systemStats[0] || {},
          activityDistribution,
          dailyTrends,
        },
        message: "System statistics fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  });

// ============================================
// Utility Routes
// ============================================

// Get available activity types and categories
router.route("/metadata").get(async (request, response) => {
  try {
    const activityTypes = [
      "study_session",
      "assignment_work",
      "reading",
      "research",
      "project_work",
      "exam_preparation",
      "peer_evaluation",
      "break",
      "exercise",
      "meeting",
      "other",
    ];

    const productivityLevels = [
      { value: 1, label: "Very Low" },
      { value: 2, label: "Low" },
      { value: 3, label: "Moderate" },
      { value: 4, label: "High" },
      { value: 5, label: "Very High" },
    ];

    const moodOptions = ["excellent", "good", "neutral", "poor", "terrible"];

    const energyLevels = ["very_high", "high", "moderate", "low", "very_low"];

    const reviewStatuses = ["pending", "reviewed", "flagged", "approved"];

    return response.status(200).json({
      success: true,
      data: {
        activityTypes,
        productivityLevels,
        moodOptions,
        energyLevels,
        reviewStatuses,
        permissions: {
          canCreate: true,
          canViewOwn: true,
          canViewOthers: ["teacher", "admin"].includes(request.user.userRole),
          canReview: ["teacher", "admin"].includes(request.user.userRole),
          canDelete: true,
          canBulkEdit: request.user.userRole === "admin",
        },
      },
      message: "Activity metadata fetched successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware for this router
router.use((error, request, response, next) => {
  console.error("Daily Activities route error:", error);

  if (error.name === "ValidationError") {
    return response.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(error.errors).map((err) => err.message),
    });
  }

  if (error.code === 11000) {
    return response.status(409).json({
      success: false,
      message:
        "Duplicate entry - You already have an activity record for this date",
    });
  }

  response.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

export default router;
