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
    },
    date: {
      type: Date,
      required: true,
    },
    activities: {
      assignmentsSubmitted: {
        type: Number,
        default: 0,
      },
      evaluationsCompleted: {
        type: Number,
        default: 0,
      },
      loginCount: {
        type: Number,
        default: 0,
      },
      timeSpentMinutes: {
        type: Number,
        default: 0,
      },
      skillsAdded: [
        {
          skill: String,
          addedAt: Date,
        },
      ],
      achievementsEarned: [
        {
          achievementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Achievement",
          },
          earnedAt: Date,
        },
      ],
    },
    streakData: {
      isActiveDay: {
        type: Boolean,
        default: false,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
dailyActivitySchema.index({ userId: 1, date: -1 });
dailyActivitySchema.index({ date: 1 });

// Ensure one record per user per day
dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyActivity = mongoose.model("DailyActivity", dailyActivitySchema);

export default DailyActivity;
