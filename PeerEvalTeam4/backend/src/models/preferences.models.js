// import mongoose from "mongoose";

// const preferenceSchema = new mongoose.Schema(
//   {
//     preferenceHolder: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true, // Each user has one preference document
//     },
//     defaultTheme: {
//       type: String,
//       enum: ["dark", "light", "system"],
//       default: "system",
//     },
//     workingHours: {
//       startTime: {
//         type: String, // Use String (e.g., "09:00") instead of Date for time of day
//         required: true,
//         default: "09:00",
//         validate: {
//           validator: function (v) {
//             return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
//           },
//           message: "Start time must be in HH:MM format",
//         },
//       },
//       endTime: {
//         type: String,
//         required: true,
//         default: "17:00",
//         validate: {
//           // Regex to validate time in HH:MM format
//           validator: function (v) {
//             return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
//           },
//           message: "End time must be in HH:MM format",
//         },
//       },
//       daysOfWeek: {
//         type: [
//           {
//             type: String,
//             enum: [
//               "Monday",
//               "Tuesday",
//               "Wednesday",
//               "Thursday",
//               "Friday",
//               "Saturday",
//               "Sunday",
//             ],
//           },
//         ],
//         default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
//         validate: {
//           validator: function (v) {
//             return v.length > 0;
//           },
//           message: "At least one working day must be selected",
//         },
//       },
//       isFlexible: {
//         type: Boolean,
//         default: false,
//       },
//       timezone: {
//         type: String,
//         default: "UTC",
//       },
//     },
//     notifications: {
//       emailNotifications: {
//         type: Boolean,
//         default: true,
//       },
//       pushNotifications: {
//         type: Boolean,
//         default: true,
//       },
//       soundNotifications: {
//         type: Boolean,
//         default: true,
//       },
//       messageNotifications: {
//         type: Boolean,
//         default: true,
//       },
//       messageNotifications: {
//         type: Boolean,
//         default: true,
//       },
//       reminderNotifications: {
//         type: Boolean,
//         default: true,
//       },
//       notificationFrequency: {
//         type: String,
//         enum: ["immediate", "daily", "weekly"],
//         default: "immediate",
//       },
//     },
//     language: {
//       type: String,
//       default: "en",
//       minlength: 2,
//       maxlength: 5,
//     },
//     privacy: {
//       profileVisibility: {
//         type: String,
//         enum: ["public", "friends", "private"],
//         default: "public",
//       },
//       showEmail: {
//         type: Boolean,
//         default: false,
//       },
//       showPhone: {
//         type: Boolean,
//         default: false,
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Index for better performance (To be done cautiously)
// preferenceSchema.index({ preferenceHolder: 1 });

// export default mongoose.model("Preference", preferenceSchema);

// ================================== // 

import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    notifications: {
      email: {
        assignments: {
          type: Boolean,
          default: true,
        },
        evaluations: {
          type: Boolean,
          default: true,
        },
        deadlines: {
          type: Boolean,
          default: true,
        },
        achievements: {
          type: Boolean,
          default: true,
        },
        weeklyReports: {
          type: Boolean,
          default: false,
        },
      },
      push: {
        enabled: {
          type: Boolean,
          default: true,
        },
        assignments: {
          type: Boolean,
          default: true,
        },
        evaluations: {
          type: Boolean,
          default: true,
        },
        reminders: {
          type: Boolean,
          default: true,
        },
      },
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "peers", "private"],
        default: "public",
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showPhone: {
        type: Boolean,
        default: false,
      },
      allowPeerContact: {
        type: Boolean,
        default: true,
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
    },
    appearance: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: {
        type: String,
        default: "en",
      },
      timezone: {
        type: String,
        default: "America/New_York",
      },
      dateFormat: {
        type: String,
        enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
        default: "MM/DD/YYYY",
      },
    },
    security: {
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
      sessionTimeout: {
        type: Number,
        default: 30, // minutes
      },
      loginNotifications: {
        type: Boolean,
        default: true,
      },
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ["overview", "assignments", "evaluations"],
        default: "overview",
      },
      showStats: {
        type: Boolean,
        default: true,
      },
      showRecentActivity: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Preferences = mongoose.model("Preferences", preferencesSchema);

export default Preferences;
