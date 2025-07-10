import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import DailyActivity from "../models/dailyActivities.models.js";
import User from "../models/user.models.js";
import mongoose from "mongoose";

// Get daily activities for current user or specific date
export const getDailyActivities = asyncHandler(async (request, response) => {
  try {
    const userId = request.user._id;
    const {
      date,
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "desc",
      activityType,
      dateRange = 7,
    } = request.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { userId };

    // Date filtering
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Default to recent activities within dateRange
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Activity type filtering
    if (activityType) {
      query["activities.type"] = activityType;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const activities = await DailyActivity.find(query)
      .populate("userId", "userName userProfileImage userRole")
      .populate("activities.relatedAssignment", "title dueDate")
      .populate("activities.relatedCourse", "title code")
      .populate("achievementsEarned.achievementId", "title description icon")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await DailyActivity.countDocuments(query);

    // Get activity statistics
    const stats = await DailyActivity.getUserActivityStats(userId, dateRange);

    return response.status(200).json(
      new ApiResponse(
        200,
        {
          activities,
          stats: stats[0] || null,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalActivities / parseInt(limit)),
            totalActivities,
            activitiesPerPage: parseInt(limit),
          },
        },
        "Daily activities fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      `Error fetching daily activities: ${error?.message || error}`
    );
  }
});

// Get single daily activity by ID
export const getDailyActivity = asyncHandler(async (request, response) => {
  try {
    const { activityId } = request.params;
    const userId = request.user._id;
    const userRole = request.user.userRole;

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      throw new ApiError(400, "Invalid activity ID format");
    }

    const query = { _id: activityId };

    // Students can only view their own activities
    if (userRole === "student") {
      query.userId = userId;
    }

    const activity = await DailyActivity.findOne(query)
      .populate("userId", "userName userProfileImage userRole")
      .populate("activities.relatedAssignment", "title dueDate description")
      .populate("activities.relatedCourse", "title code description")
      .populate("achievementsEarned.achievementId", "title description icon")
      .populate("reviewedBy", "userName userRole");

    if (!activity) {
      throw new ApiError(404, "Daily activity not found");
    }

    // Check if user has permission to view this activity
    if (userRole === "student" && !activity.userId._id.equals(userId)) {
      throw new ApiError(403, "You can only view your own activities");
    }

    return response
      .status(200)
      .json(
        new ApiResponse(200, activity, "Daily activity fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Error fetching daily activity: ${error?.message || error}`
    );
  }
});

// Create or update daily activity
export const createOrUpdateDailyActivity = asyncHandler(
  async (request, response) => {
    try {
      const userId = request.user._id;
      const {
        date,
        activities = [],
        dailyGoals = [],
        dayRating,
        mood,
        energyLevel,
        isPrivate = false,
      } = request.body;

      // Validate required fields
      if (!date) {
        throw new ApiError(400, "Date is required");
      }

      // Validate date format and ensure it's not in the future
      const activityDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (activityDate > today) {
        throw new ApiError(400, "Cannot create activities for future dates");
      }

      // Validate activities
      if (activities.length > 0) {
        for (const activity of activities) {
          if (
            !activity.type ||
            !activity.title ||
            !activity.startTime ||
            !activity.endTime
          ) {
            throw new ApiError(
              400,
              "Activity must have type, title, startTime, and endTime"
            );
          }

          const startTime = new Date(activity.startTime);
          const endTime = new Date(activity.endTime);

          if (endTime <= startTime) {
            throw new ApiError(
              400,
              "Activity end time must be after start time"
            );
          }

          // Calculate duration if not provided
          if (!activity.duration) {
            activity.duration = Math.round((endTime - startTime) / (1000 * 60));
          }
        }
      }

      // Find existing activity for this date or create new one
      const existingActivity = await DailyActivity.findOne({
        userId,
        date: {
          $gte: new Date(activityDate.setHours(0, 0, 0, 0)),
          $lte: new Date(activityDate.setHours(23, 59, 59, 999)),
        },
      });

      let dailyActivity;

      if (existingActivity) {
        // Update existing activity
        existingActivity.activities = activities;
        existingActivity.dailyGoals = dailyGoals;
        if (dayRating) existingActivity.dayRating = dayRating;
        if (mood) existingActivity.mood = mood;
        if (energyLevel) existingActivity.energyLevel = energyLevel;
        existingActivity.isPrivate = isPrivate;

        dailyActivity = await existingActivity.save();
      } else {
        // Create new daily activity
        dailyActivity = await DailyActivity.create({
          userId,
          date: activityDate,
          activities,
          dailyGoals,
          dayRating,
          mood,
          energyLevel,
          isPrivate,
        });
      }

      // Populate the response
      await dailyActivity.populate(
        "activities.relatedAssignment",
        "title dueDate"
      );
      await dailyActivity.populate("activities.relatedCourse", "title code");

      // Update user activity stats
      if (request.user.updateActivityStats) {
        await request.user.updateActivityStats(
          "assignmentsSubmitted",
          activities.length
        );
      }

      const action = existingActivity ? "updated" : "created";
      return response
        .status(existingActivity ? 200 : 201)
        .json(
          new ApiResponse(
            existingActivity ? 200 : 201,
            dailyActivity,
            `Daily activity ${action} successfully`
          )
        );
    } catch (error) {
      throw new ApiError(
        500,
        `Error creating/updating daily activity: ${error?.message || error}`
      );
    }
  }
);

// Add single activity to existing daily record
export const addActivity = asyncHandler(async (request, response) => {
  try {
    const userId = request.user._id;
    const {
      date,
      type,
      title,
      description,
      startTime,
      endTime,
      productivity = 3,
      tags = [],
      relatedAssignment,
      relatedCourse,
      notes,
    } = request.body;

    // Validate required fields
    if (!date || !type || !title || !startTime || !endTime) {
      throw new ApiError(
        400,
        "Date, type, title, startTime, and endTime are required"
      );
    }

    const activityDate = new Date(date);
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      throw new ApiError(400, "End time must be after start time");
    }

    const duration = Math.round((end - start) / (1000 * 60));

    // Find or create daily activity record
    let dailyActivity = await DailyActivity.findOne({
      userId,
      date: {
        $gte: new Date(activityDate.setHours(0, 0, 0, 0)),
        $lte: new Date(activityDate.setHours(23, 59, 59, 999)),
      },
    });

    const newActivity = {
      type,
      title,
      description,
      startTime: start,
      endTime: end,
      duration,
      productivity,
      tags,
      relatedAssignment,
      relatedCourse,
      notes,
    };

    if (dailyActivity) {
      dailyActivity.activities.push(newActivity);
      await dailyActivity.save();
    } else {
      dailyActivity = await DailyActivity.create({
        userId,
        date: activityDate,
        activities: [newActivity],
      });
    }

    await dailyActivity.populate(
      "activities.relatedAssignment",
      "title dueDate"
    );
    await dailyActivity.populate("activities.relatedCourse", "title code");

    return response
      .status(201)
      .json(new ApiResponse(201, dailyActivity, "Activity added successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      `Error adding activity: ${error?.message || error}`
    );
  }
});

// Update specific activity within a daily record
export const updateActivity = asyncHandler(async (request, response) => {
  try {
    const { activityId, subActivityId } = request.params;
    const userId = request.user._id;
    const updates = request.body;

    if (
      !mongoose.Types.ObjectId.isValid(activityId) ||
      !mongoose.Types.ObjectId.isValid(subActivityId)
    ) {
      throw new ApiError(400, "Invalid activity ID format");
    }

    const dailyActivity = await DailyActivity.findOne({
      _id: activityId,
      userId,
    });

    if (!dailyActivity) {
      throw new ApiError(404, "Daily activity not found");
    }

    const activityIndex = dailyActivity.activities.findIndex(
      (activity) => activity._id.toString() === subActivityId
    );

    if (activityIndex === -1) {
      throw new ApiError(404, "Activity not found");
    }

    // Update the specific activity
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        dailyActivity.activities[activityIndex][key] = updates[key];
      }
    });

    // Recalculate duration if start/end time changed
    if (updates.startTime || updates.endTime) {
      const activity = dailyActivity.activities[activityIndex];
      const duration = Math.round(
        (activity.endTime - activity.startTime) / (1000 * 60)
      );
      dailyActivity.activities[activityIndex].duration = duration;
    }

    await dailyActivity.save();

    return response
      .status(200)
      .json(
        new ApiResponse(200, dailyActivity, "Activity updated successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Error updating activity: ${error?.message || error}`
    );
  }
});

// Delete daily activity
export const deleteDailyActivity = asyncHandler(async (request, response) => {
  try {
    const { activityId } = request.params;
    const userId = request.user._id;
    const userRole = request.user.userRole;

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      throw new ApiError(400, "Invalid activity ID format");
    }

    const query = { _id: activityId };

    // Students can only delete their own activities
    if (userRole === "student") {
      query.userId = userId;
    }

    const dailyActivity = await DailyActivity.findOneAndDelete(query);

    if (!dailyActivity) {
      throw new ApiError(404, "Daily activity not found");
    }

    return response
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            deletedActivity: {
              id: dailyActivity._id,
              date: dailyActivity.date,
            },
          },
          "Daily activity deleted successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Error deleting daily activity: ${error?.message || error}`
    );
  }
});

// Delete specific activity from daily record
export const deleteActivity = asyncHandler(async (request, response) => {
  try {
    const { activityId, subActivityId } = request.params;
    const userId = request.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(activityId) ||
      !mongoose.Types.ObjectId.isValid(subActivityId)
    ) {
      throw new ApiError(400, "Invalid activity ID format");
    }

    const dailyActivity = await DailyActivity.findOne({
      _id: activityId,
      userId,
    });

    if (!dailyActivity) {
      throw new ApiError(404, "Daily activity not found");
    }

    const activityIndex = dailyActivity.activities.findIndex(
      (activity) => activity._id.toString() === subActivityId
    );

    if (activityIndex === -1) {
      throw new ApiError(404, "Activity not found");
    }

    const deletedActivity = dailyActivity.activities[activityIndex];
    dailyActivity.activities.splice(activityIndex, 1);

    await dailyActivity.save();

    return response.status(200).json(
      new ApiResponse(
        200,
        {
          dailyActivity,
          deletedActivity: {
            id: deletedActivity._id,
            title: deletedActivity.title,
          },
        },
        "Activity deleted successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      `Error deleting activity: ${error?.message || error}`
    );
  }
});

// Get activity statistics and analytics
export const getActivityStats = asyncHandler(async (request, response) => {
  try {
    const userId = request.user._id;
    const { period = "week", startDate, endDate } = request.query;

    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      start = new Date();

      switch (period) {
        case "week":
          start.setDate(end.getDate() - 7);
          break;
        case "month":
          start.setMonth(end.getMonth() - 1);
          break;
        case "year":
          start.setFullYear(end.getFullYear() - 1);
          break;
        default:
          start.setDate(end.getDate() - 7);
      }
    }

    // Get basic statistics
    const stats = await DailyActivity.getUserActivityStats(
      userId,
      Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    );

    // Get activity type breakdown
    const activityBreakdown = await DailyActivity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end },
        },
      },
      { $unwind: "$activities" },
      {
        $group: {
          _id: "$activities.type",
          totalDuration: { $sum: "$activities.duration" },
          count: { $sum: 1 },
          avgProductivity: { $avg: "$activities.productivity" },
        },
      },
      { $sort: { totalDuration: -1 } },
    ]);

    // Get daily trends
    const dailyTrends = await DailyActivity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end },
        },
      },
      {
        $project: {
          date: 1,
          totalStudyTime: "$summary.totalStudyTime",
          totalActivities: "$summary.totalActivities",
          averageProductivity: "$summary.averageProductivity",
          dayRating: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return response.status(200).json(
      new ApiResponse(
        200,
        {
          period,
          dateRange: { start, end },
          stats: stats[0] || null,
          activityBreakdown,
          dailyTrends,
        },
        "Activity statistics fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      `Error fetching activity statistics: ${error?.message || error}`
    );
  }
});

// Get leaderboard (public activities only)
export const getActivityLeaderboard = asyncHandler(
  async (request, response) => {
    try {
      const { period = "week", limit = 10 } = request.query;

      const leaderboard = await DailyActivity.getActivityLeaderboard(period);

      return response.status(200).json(
        new ApiResponse(
          200,
          {
            period,
            leaderboard: leaderboard.slice(0, parseInt(limit)),
          },
          "Activity leaderboard fetched successfully"
        )
      );
    } catch (error) {
      throw new ApiError(
        500,
        `Error fetching activity leaderboard: ${error?.message || error}`
      );
    }
  }
);

// Teacher/Admin: Get student activities
export const getStudentActivities = asyncHandler(async (request, response) => {
  try {
    const { studentId } = request.params;
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      reviewStatus = "all",
    } = request.query;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw new ApiError(400, "Invalid student ID format");
    }

    // Verify student exists and is actually a student
    const student = await User.findOne({
      _id: studentId,
      userRole: "student",
      isActive: true,
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { userId: studentId };

    // Date range filtering
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Review status filtering
    if (reviewStatus !== "all") {
      query.reviewStatus = reviewStatus;
    }

    const activities = await DailyActivity.find(query)
      .populate("userId", "userName userProfileImage userEmail")
      .populate("reviewedBy", "userName userRole")
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await DailyActivity.countDocuments(query);

    // Get student statistics
    const stats = await DailyActivity.getUserActivityStats(studentId, 30); // Last 30 days

    return response.status(200).json(
      new ApiResponse(
        200,
        {
          student: {
            _id: student._id,
            userName: student.userName,
            userEmail: student.userEmail,
            userProfileImage: student.userProfileImage,
          },
          activities,
          stats: stats[0] || null,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalActivities / parseInt(limit)),
            totalActivities,
            activitiesPerPage: parseInt(limit),
          },
        },
        "Student activities fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      `Error fetching student activities: ${error?.message || error}`
    );
  }
});

// Teacher/Admin: Review student activity
export const reviewStudentActivity = asyncHandler(async (request, response) => {
  try {
    const { activityId } = request.params;
    const { reviewStatus, reviewNotes } = request.body;
    const reviewerId = request.user._id;

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      throw new ApiError(400, "Invalid activity ID format");
    }

    if (
      !["pending", "reviewed", "flagged", "approved"].includes(reviewStatus)
    ) {
      throw new ApiError(400, "Invalid review status");
    }

    const activity = await DailyActivity.findById(activityId);

    if (!activity) {
      throw new ApiError(404, "Activity not found");
    }

    activity.reviewStatus = reviewStatus;
    activity.reviewNotes = reviewNotes || "";
    activity.reviewedBy = reviewerId;
    activity.reviewedAt = new Date();

    await activity.save();

    await activity.populate("reviewedBy", "userName userRole");

    return response
      .status(200)
      .json(new ApiResponse(200, activity, "Activity reviewed successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      `Error reviewing activity: ${error?.message || error}`
    );
  }
});

// Get activities requiring review (Teacher/Admin only)
export const getActivitiesForReview = asyncHandler(
  async (request, response) => {
    try {
      const {
        page = 1,
        limit = 20,
        reviewStatus = "pending",
        studentId,
      } = request.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const query = { reviewStatus };

      if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
        query.userId = studentId;
      }

      const activities = await DailyActivity.find(query)
        .populate("userId", "userName userProfileImage userEmail userRole")
        .populate("reviewedBy", "userName userRole")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalActivities = await DailyActivity.countDocuments(query);

      return response.status(200).json(
        new ApiResponse(
          200,
          {
            activities,
            pagination: {
              currentPage: parseInt(page),
              totalPages: Math.ceil(totalActivities / parseInt(limit)),
              totalActivities,
              activitiesPerPage: parseInt(limit),
            },
          },
          "Activities for review fetched successfully"
        )
      );
    } catch (error) {
      throw new ApiError(
        500,
        `Error fetching activities for review: ${error?.message || error}`
      );
    }
  }
);
