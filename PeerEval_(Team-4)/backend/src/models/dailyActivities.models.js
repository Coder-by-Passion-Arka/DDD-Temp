// import mongoose from "mongoose";

// // This mongoose schema is used to keep track of the daily activities of the students

// const dailyActivitySchema = new mongoose.Schema(
//   {
//     studentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     activities: [
//       {
//         activityType: {
//           type: String,
//           required: true,
//           enum: [
//             "study",
//             "exercise",
//             "reading",
//             "project_work",
//             "assignment",
//             "exam_preparation",
//             "break",
//             "other",
//           ],
//           trim: true,
//         },
//         title: {
//           type: String,
//           required: true,
//           maxlength: 100,
//           trim: true,
//         },
//         duration: {
//           type: Number, // Duration in minutes
//           required: true,
//           min: 1,
//           max: 1440, // Max 24 hours
//         },
//         startTime: {
//           type: Date,
//           required: true,
//         },
//         endTime: {
//           type: Date,
//           required: true,
//         },
//         comment: {
//           type: String,
//           maxlength: 500,
//           trim: true,
//         },
//         productivity: {
//           type: Number,
//           min: 1,
//           max: 5, // 1-5 rating scale
//         },
//         tags: [
//           {
//             type: String,
//             maxlength: 20,
//             trim: true,
//           },
//         ],
//       },
//     ],
//     date: {
//       type: Date,
//       required: true,
//       default: Date.now,
//     },
//     totalProductiveTime: {
//       type: Number, // Total productive minutes for the day
//       default: 0,
//     },
//     totalBreakTime: {
//       type: Number, // Total break minutes for the day
//       default: 0,
//     },
//     dayRating: {
//       type: Number,
//       min: 1,
//       max: 5, // Overall day rating
//     },
//     goals: [
//       {
//         description: {
//           type: String,
//           required: true,
//           maxlength: 200,
//         },
//         completed: {
//           type: Boolean,
//           default: false,
//         },
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// // Index for better performance
// dailyActivitySchema.index({ studentId: 1, date: -1 });
// dailyActivitySchema.index({ studentId: 1 });

// // Virtual for calculating total activities
// dailyActivitySchema.virtual("totalActivities").get(function () {
//   return this.activities.length;
// });

// // Pre-save middleware to calculate totals
// dailyActivitySchema.pre("save", function (next) {
//   this.totalProductiveTime = this.activities
//     .filter((activity) => activity.activityType !== "break")
//     .reduce((total, activity) => total + activity.duration, 0);

//   // TODO: Doubt with the logic
//   this.totalBreakTime = this.activities
//     .filter((activity) => activity.activityType === "break")
//     .reduce((total, activity) => total + activity.duration, 0);

//   next();
// });

// export default mongoose.model("DailyActivity", dailyActivitySchema);

// ============================ // 

import mongoose from "mongoose";

const dailyActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    activities: [
      {
        type: {
          type: String,
          required: true,
          enum: [
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
          ],
        },
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100,
        },
        description: {
          type: String,
          trim: true,
          maxlength: 500,
        },
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
          required: true,
        },
        duration: {
          type: Number, // Duration in minutes
          required: true,
          min: 1,
          max: 1440, // Max 24 hours
        },
        productivity: {
          type: Number,
          min: 1,
          max: 5, // 1-5 rating scale
          default: 3,
        },
        tags: [
          {
            type: String,
            trim: true,
            maxlength: 20,
          },
        ],
        relatedAssignment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Assignment",
        },
        relatedCourse: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        notes: {
          type: String,
          trim: true,
          maxlength: 1000,
        },
        _id: true, // Enable _id for activities
      },
    ],

    // Daily summary statistics
    summary: {
      totalActivities: {
        type: Number,
        default: 0,
      },
      totalStudyTime: {
        type: Number, // Total study time in minutes
        default: 0,
      },
      totalBreakTime: {
        type: Number, // Total break time in minutes
        default: 0,
      },
      averageProductivity: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      topActivityType: {
        type: String,
        default: "",
      },
    },

    // Daily goals
    dailyGoals: [
      {
        description: {
          type: String,
          required: true,
          trim: true,
          maxlength: 200,
        },
        targetDuration: {
          type: Number, // Target duration in minutes
          default: 0,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
      },
    ],

    // Overall day assessment
    dayRating: {
      type: Number,
      min: 1,
      max: 5, // Overall day rating
    },

    // Mood and energy tracking
    mood: {
      type: String,
      enum: ["excellent", "good", "neutral", "poor", "terrible"],
    },

    energyLevel: {
      type: String,
      enum: ["very_high", "high", "moderate", "low", "very_low"],
    },

    // Achievement tracking for this day
    achievementsEarned: [
      {
        achievementId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Achievement",
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Streak information
    streakData: {
      isActiveDay: {
        type: Boolean,
        default: false,
      },
      studyStreak: {
        type: Number,
        default: 0,
      },
      goalCompletionStreak: {
        type: Number,
        default: 0,
      },
    },

    // Privacy settings
    isPrivate: {
      type: Boolean,
      default: false, // Teachers can view by default
    },

    // Status for teachers/admin review
    reviewStatus: {
      type: String,
      enum: ["pending", "reviewed", "flagged", "approved"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

    reviewNotes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
dailyActivitySchema.index({ userId: 1, date: -1 });
dailyActivitySchema.index({ date: 1, reviewStatus: 1 });
dailyActivitySchema.index({ userId: 1, "streakData.isActiveDay": 1 });
dailyActivitySchema.index({ "activities.type": 1, date: 1 });

// Ensure only one record per user per day
dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save middleware to calculate daily summary
dailyActivitySchema.pre("save", function (next) {
  if (this.activities && this.activities.length > 0) {
    // Calculate total activities
    this.summary.totalActivities = this.activities.length;

    // Calculate total study time (exclude breaks)
    this.summary.totalStudyTime = this.activities
      .filter((activity) => activity.type !== "break")
      .reduce((total, activity) => total + activity.duration, 0);

    // Calculate total break time
    this.summary.totalBreakTime = this.activities
      .filter((activity) => activity.type === "break")
      .reduce((total, activity) => total + activity.duration, 0);

    // Calculate average productivity
    const productivityActivities = this.activities.filter(
      (activity) => activity.productivity
    );
    if (productivityActivities.length > 0) {
      this.summary.averageProductivity =
        productivityActivities.reduce(
          (total, activity) => total + activity.productivity,
          0
        ) / productivityActivities.length;
    }

    // Find most common activity type
    const activityCounts = {};
    this.activities.forEach((activity) => {
      activityCounts[activity.type] = (activityCounts[activity.type] || 0) + 1;
    });

    this.summary.topActivityType = Object.keys(activityCounts).reduce(
      (a, b) => (activityCounts[a] > activityCounts[b] ? a : b),
      ""
    );

    // Mark as active day if has substantial study time (30+ minutes)
    this.streakData.isActiveDay = this.summary.totalStudyTime >= 30;
  }

  next();
});

// Validate that endTime is after startTime for activities
dailyActivitySchema.pre("save", function (next) {
  for (const activity of this.activities) {
    if (activity.endTime <= activity.startTime) {
      return next(new Error("Activity end time must be after start time"));
    }

    // Calculate duration if not provided
    if (!activity.duration) {
      activity.duration = Math.round(
        (activity.endTime - activity.startTime) / (1000 * 60)
      );
    }
  }
  next();
});

// Virtual for total time spent (study + break)
dailyActivitySchema.virtual("totalTimeSpent").get(function () {
  return this.summary.totalStudyTime + this.summary.totalBreakTime;
});

// Virtual for productivity percentage
dailyActivitySchema.virtual("productivityPercentage").get(function () {
  const totalTime = this.totalTimeSpent;
  if (totalTime === 0) return 0;
  return Math.round((this.summary.totalStudyTime / totalTime) * 100);
});

// Static method to get user's activity statistics
dailyActivitySchema.statics.getUserActivityStats = async function (
  userId,
  dateRange = 7
) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - dateRange);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        totalStudyTime: { $sum: "$summary.totalStudyTime" },
        totalActivities: { $sum: "$summary.totalActivities" },
        averageProductivity: { $avg: "$summary.averageProductivity" },
        activeDays: {
          $sum: { $cond: ["$streakData.isActiveDay", 1, 0] },
        },
        averageDayRating: { $avg: "$dayRating" },
      },
    },
  ]);
};

// Static method to get leaderboard
dailyActivitySchema.statics.getActivityLeaderboard = async function (
  period = "week"
) {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "week":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 7);
  }

  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        isPrivate: false,
      },
    },
    {
      $group: {
        _id: "$userId",
        totalStudyTime: { $sum: "$summary.totalStudyTime" },
        totalActivities: { $sum: "$summary.totalActivities" },
        averageProductivity: { $avg: "$summary.averageProductivity" },
        activeDays: { $sum: { $cond: ["$streakData.isActiveDay", 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        userName: "$user.userName",
        userProfileImage: "$user.userProfileImage",
        userRole: "$user.userRole",
        totalStudyTime: 1,
        totalActivities: 1,
        averageProductivity: 1,
        activeDays: 1,
      },
    },
    {
      $sort: { totalStudyTime: -1, averageProductivity: -1 },
    },
    {
      $limit: 10,
    },
  ]);
};

const DailyActivity = mongoose.model("DailyActivity", dailyActivitySchema);

export default DailyActivity;