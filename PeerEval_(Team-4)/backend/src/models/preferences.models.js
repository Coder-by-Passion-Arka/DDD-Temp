// // import mongoose from "mongoose";

// // const preferenceSchema = new mongoose.Schema(
// //   {
// //     preferenceHolder: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User",
// //       required: true,
// //       unique: true, // Each user has one preference document
// //     },
// //     defaultTheme: {
// //       type: String,
// //       enum: ["dark", "light", "system"],
// //       default: "system",
// //     },
// //     workingHours: {
// //       startTime: {
// //         type: String, // Use String (e.g., "09:00") instead of Date for time of day
// //         required: true,
// //         default: "09:00",
// //         validate: {
// //           validator: function (v) {
// //             return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
// //           },
// //           message: "Start time must be in HH:MM format",
// //         },
// //       },
// //       endTime: {
// //         type: String,
// //         required: true,
// //         default: "17:00",
// //         validate: {
// //           // Regex to validate time in HH:MM format
// //           validator: function (v) {
// //             return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
// //           },
// //           message: "End time must be in HH:MM format",
// //         },
// //       },
// //       daysOfWeek: {
// //         type: [
// //           {
// //             type: String,
// //             enum: [
// //               "Monday",
// //               "Tuesday",
// //               "Wednesday",
// //               "Thursday",
// //               "Friday",
// //               "Saturday",
// //               "Sunday",
// //             ],
// //           },
// //         ],
// //         default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
// //         validate: {
// //           validator: function (v) {
// //             return v.length > 0;
// //           },
// //           message: "At least one working day must be selected",
// //         },
// //       },
// //       isFlexible: {
// //         type: Boolean,
// //         default: false,
// //       },
// //       timezone: {
// //         type: String,
// //         default: "UTC",
// //       },
// //     },
// //     notifications: {
// //       emailNotifications: {
// //         type: Boolean,
// //         default: true,
// //       },
// //       pushNotifications: {
// //         type: Boolean,
// //         default: true,
// //       },
// //       soundNotifications: {
// //         type: Boolean,
// //         default: true,
// //       },
// //       messageNotifications: {
// //         type: Boolean,
// //         default: true,
// //       },
// //       messageNotifications: {
// //         type: Boolean,
// //         default: true,
// //       },
// //       reminderNotifications: {
// //         type: Boolean,
// //         default: true,
// //       },
// //       notificationFrequency: {
// //         type: String,
// //         enum: ["immediate", "daily", "weekly"],
// //         default: "immediate",
// //       },
// //     },
// //     language: {
// //       type: String,
// //       default: "en",
// //       minlength: 2,
// //       maxlength: 5,
// //     },
// //     privacy: {
// //       profileVisibility: {
// //         type: String,
// //         enum: ["public", "friends", "private"],
// //         default: "public",
// //       },
// //       showEmail: {
// //         type: Boolean,
// //         default: false,
// //       },
// //       showPhone: {
// //         type: Boolean,
// //         default: false,
// //       },
// //     },
// //   },
// //   {
// //     timestamps: true,
// //   }
// // );

// // // Index for better performance (To be done cautiously)
// // preferenceSchema.index({ preferenceHolder: 1 });

// // export default mongoose.model("Preference", preferenceSchema);

// // ============================================================= //

// import mongoose from "mongoose";

// const preferencesSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true,
//     },
//     notifications: {
//       email: {
//         assignments: {
//           type: Boolean,
//           default: true,
//         },
//         evaluations: {
//           type: Boolean,
//           default: true,
//         },
//         deadlines: {
//           type: Boolean,
//           default: true,
//         },
//         achievements: {
//           type: Boolean,
//           default: true,
//         },
//         weeklyReports: {
//           type: Boolean,
//           default: false,
//         },
//       },
//       push: {
//         enabled: {
//           type: Boolean,
//           default: true,
//         },
//         assignments: {
//           type: Boolean,
//           default: true,
//         },
//         evaluations: {
//           type: Boolean,
//           default: true,
//         },
//         reminders: {
//           type: Boolean,
//           default: true,
//         },
//       },
//     },
//     privacy: {
//       profileVisibility: {
//         type: String,
//         enum: ["public", "peers", "private"],
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
//       allowPeerContact: {
//         type: Boolean,
//         default: true,
//       },
//       showOnlineStatus: {
//         type: Boolean,
//         default: true,
//       },
//     },
//     appearance: {
//       theme: {
//         type: String,
//         enum: ["light", "dark", "system"],
//         default: "system",
//       },
//       language: {
//         type: String,
//         default: "en",
//       },
//       timezone: {
//         type: String,
//         default: "America/New_York",
//       },
//       dateFormat: {
//         type: String,
//         enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
//         default: "MM/DD/YYYY",
//       },
//     },
//     security: {
//       twoFactorEnabled: {
//         type: Boolean,
//         default: false,
//       },
//       sessionTimeout: {
//         type: Number,
//         default: 30, // minutes
//       },
//       loginNotifications: {
//         type: Boolean,
//         default: true,
//       },
//     },
//     dashboard: {
//       defaultView: {
//         type: String,
//         enum: ["overview", "assignments", "evaluations"],
//         default: "overview",
//       },
//       showStats: {
//         type: Boolean,
//         default: true,
//       },
//       showRecentActivity: {
//         type: Boolean,
//         default: true,
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Preferences = mongoose.model("Preferences", preferencesSchema);

// export default Preferences;

// ======================================================================================= //

import mongoose from "mongoose";
const preferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Appearance Settings
    appearance: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: {
        type: String,
        default: "en",
        trim: true,
      },
      timezone: {
        type: String,
        default: "Allahabad/India",
        trim: true,
      },
      dateFormat: {
        type: String,
        enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
        default: "MM/DD/YYYY",
      },
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      compactMode: {
        type: Boolean,
        default: false,
      },
    },
    // Notification Settings
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
        weeklyReports: {
          type: Boolean,
          default: false,
        },
        achievements: {
          type: Boolean,
          default: true,
        },
        courseUpdates: {
          type: Boolean,
          default: true,
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
        deadlines: {
          type: Boolean,
          default: true,
        },
        achievements: {
          type: Boolean,
          default: true,
        },
      },
      inApp: {
        assignments: {
          type: Boolean,
          default: true,
        },
        evaluations: {
          type: Boolean,
          default: true,
        },
        achievements: {
          type: Boolean,
          default: true,
        },
        messages: {
          type: Boolean,
          default: true,
        },
      },
    },
    // Privacy Settings
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
      showLocation: {
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
      showActivityStatus: {
        type: Boolean,
        default: true,
      },
      dataSharing: {
        type: Boolean,
        default: false,
      },
    },
    // Security Settings
    security: {
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
      sessionTimeout: {
        type: Number, // in minutes
        default: 30,
        min: 0,
        max: 480, // 8 hours max
      },
      loginNotifications: {
        type: Boolean,
        default: true,
      },
      passwordChangeNotifications: {
        type: Boolean,
        default: true,
      },
      suspiciousActivityAlerts: {
        type: Boolean,
        default: true,
      },
      deviceManagement: {
        type: Boolean,
        default: true,
      },
    },
    // Dashboard Settings
    dashboard: {
      defaultView: {
        type: String,
        enum: [
          "overview",
          "assignments",
          "evaluations",
          "achievements",
          "analytics",
        ],
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
      showUpcomingDeadlines: {
        type: Boolean,
        default: true,
      },
      showLeaderboard: {
        type: Boolean,
        default: true,
      },
      showAchievements: {
        type: Boolean,
        default: true,
      },
      showQuickActions: {
        type: Boolean,
        default: true,
      },
      layoutStyle: {
        type: String,
        enum: ["grid", "list", "compact"],
        default: "grid",
      },
    },
    // Academic Settings
    academic: {
      defaultSortOrder: {
        type: String,
        enum: ["newest", "oldest", "alphabetical", "priority"],
        default: "newest",
      },
      showGrades: {
        type: Boolean,
        default: true,
      },
      showProgress: {
        type: Boolean,
        default: true,
      },
      autoSaveInterval: {
        type: Number, // in minutes
        default: 2,
        min: 1,
        max: 30,
      },
      reminderSettings: {
        assignments: {
          type: Number, // hours before deadline
          default: 24,
          min: 1,
          max: 168, // 1 week
        },
        evaluations: {
          type: Number, // hours before deadline
          default: 12,
          min: 1,
          max: 168,
        },
      },
    },
    // Accessibility Settings
    accessibility: {
      highContrast: {
        type: Boolean,
        default: false,
      },
      reduceMotion: {
        type: Boolean,
        default: false,
      },
      screenReader: {
        type: Boolean,
        default: false,
      },
      keyboardNavigation: {
        type: Boolean,
        default: false,
      },
      fontSize: {
        type: String,
        enum: ["small", "medium", "large", "extra-large"],
        default: "medium",
      },
    },
    // Integration Settings
    integrations: {
      calendar: {
        sync: {
          type: Boolean,
          default: false,
        },
        service: {
          type: String,
          enum: ["google", "outlook", "apple", "none"],
          default: "none",
        },
      },
      email: {
        service: {
          type: String,
          enum: ["gmail", "outlook", "yahoo", "other", "none"],
          default: "none",
        },
        sync: {
          type: Boolean,
          default: false,
        },
      },
    },
    // Data Management
    dataManagement: {
      exportFormat: {
        type: String,
        enum: ["json", "csv", "pdf"],
        default: "json",
      },
      retentionPeriod: {
        type: Number, // in days
        default: 365,
        min: 30,
        max: 2555, // ~7 years
      },
      autoBackup: {
        type: Boolean,
        default: true,
      },
      backupFrequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "weekly",
      },
    },
    // Custom Settings (for extensibility)
    customSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Metadata
    lastModified: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);
// Indexes for better performance
preferencesSchema.index({ userId: 1 });
preferencesSchema.index({ lastModified: -1 });
// Pre-save middleware to update lastModified
preferencesSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});
// Instance methods
preferencesSchema.methods.getThemePreference = function () {
  const theme = this.appearance.theme;
  if (theme === "system") {
    // Return system preference logic (could be enhanced)
    return "light"; // Default fallback
  }
  return theme;
};
preferencesSchema.methods.getNotificationPreferences = function (type = "all") {
  switch (type) {
    case "email":
      return this.notifications.email;
    case "push":
      return this.notifications.push;
    case "inApp":
      return this.notifications.inApp;
    default:
      return this.notifications;
  }
};
preferencesSchema.methods.updatePreferences = function (updates) {
  // Deep merge updates while preserving existing structure
  const mergeDeep = (target, source) => {
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) target[key] = {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  };
  mergeDeep(this.toObject(), updates);
  this.version += 1;
  return this.save();
};
// Static methods
preferencesSchema.statics.createDefaultPreferences = async function (userId) {
  const defaultPrefs = new this({ userId });
  return await defaultPrefs.save();
};
preferencesSchema.statics.getUserPreferences = async function (userId) {
  let preferences = await this.findOne({ userId });
  if (!preferences) {
    preferences = await this.createDefaultPreferences(userId);
  }
  return preferences;
};
preferencesSchema.statics.updateUserPreferences = async function (
  userId,
  updates
) {
  const preferences = await this.getUserPreferences(userId);
  return await preferences.updatePreferences(updates);
};
preferencesSchema.statics.resetUserPreferences = async function (userId) {
  await this.deleteOne({ userId });
  return await this.createDefaultPreferences(userId);
};
// Virtual for getting flattened preferences (useful for API responses)
preferencesSchema.virtual("flattened").get(function () {
  const flatten = (obj, prefix = "") => {
    let result = {};
    for (const key in obj) {
      if (
        obj[key] &&
        typeof obj[key] === "object" &&
        !Array.isArray(obj[key])
      ) {
        result = { ...result, ...flatten(obj[key], `${prefix}${key}`) };
      } else {
        result[`${prefix}${key}`] = obj[key];
      }
    }
    return result;
  };
  return flatten(this.toObject());
});
const Preferences = mongoose.model("Preferences", preferencesSchema);

export default Preferences;
