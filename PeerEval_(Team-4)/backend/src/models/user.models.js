import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [2, "Username must be at least 2 characters long"],
      maxlength: [50, "Username must not exceed 50 characters"],
    },
    userEmail: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    userPassword: {
      type: String,
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Don't include password in queries by default
    },
    userPhoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    countryCode: {
      type: String,
      trim: true,
      default: "+1",
    },
    userRole: {
      type: String,
      enum: {
        values: ["student", "teacher", "admin"],
        message: "Role must be either student, teacher, or admin",
      },
      default: "student",
      lowercase: true,
    },
    userBio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio must not exceed 500 characters"],
      default: "",
    },
    userProfileImage: {
      type: String,
      default: "",
    },
    userCoverImage: {
      type: String,
      default: "",
    },
    userLocation: {
      homeAddress: {
        type: String,
        trim: true,
        default: "",
      },
      currentAddress: {
        type: String,
        trim: true,
        default: "",
      },
      city: {
        type: String,
        trim: true,
        default: "",
      },
      state: {
        type: String,
        trim: true,
        default: "",
      },
      country: {
        type: String,
        trim: true,
        default: "",
      },
      zipCode: {
        type: String,
        trim: true,
        default: "",
      },
    },
    userAcademicInformation: {
      institution: {
        type: String,
        trim: true,
        default: "",
      },
      degree: {
        type: String,
        trim: true,
        default: "",
      },
      major: {
        type: String,
        trim: true,
        default: "",
      },
      graduationYear: {
        type: Number,
        min: 1950,
        max: 2050,
      },
      gpa: {
        type: Number,
        min: 0,
        max: 4.0,
      },
      academicLevel: {
        type: String,
        enum: ["undergraduate", "graduate", "postgraduate", "phd", "other"],
        default: "undergraduate",
      },
    },
    userSkills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        level: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
          default: "beginner",
        },
        category: {
          type: String,
          trim: true,
          default: "general",
        },
        verified: {
          type: Boolean,
          default: false,
        },
        _id: false,
      },
    ],
    userSocialMediaProfiles: [
      {
        platform: {
          type: String,
          required: true,
          trim: true,
        },
        username: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
        verified: {
          type: Boolean,
          default: false,
        },
        _id: false,
      },
    ],
    // Firebase Integration
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when present
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    // Authentication
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    // Login Tracking
    userLastLogin: {
      type: Date,
      default: Date.now,
    },
    userJoiningDate: {
      type: Date,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    // Preferences
    preferences: {
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
        default: "UTC",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },
    },
    // Statistics
    statistics: {
      totalAssignments: {
        type: Number,
        default: 0,
      },
      completedAssignments: {
        type: Number,
        default: 0,
      },
      totalEvaluations: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      achievements: {
        type: Number,
        default: 0,
      },
    },
    // Additional Metadata
    metadata: {
      lastPasswordChange: {
        type: Date,
        default: Date.now,
      },
      accountSource: {
        type: String,
        enum: ["direct", "google", "github", "facebook"],
        default: "direct",
      },
      ipAddress: {
        type: String,
        default: "",
      },
      userAgent: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
// userSchema.index({ userEmail: 1 }, { unique: true });
// userSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });
userSchema.index({ userRole: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ userLastLogin: -1 });
userSchema.index({ "userSkills.name": 1 });

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full name (if you want to add firstName/lastName later)
userSchema.virtual("displayName").get(function () {
  return this.userName || this.userEmail.split("@")[0];
});

// Pre-save middleware for password hashing
userSchema.pre("save", async function (next) {
  // Only hash password if it's modified and exists
  if (!this.isModified("userPassword") || !this.userPassword) {
    return next();
  }

  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.userPassword = await bcrypt.hash(this.userPassword, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware for email verification reset
userSchema.pre("save", function (next) {
  if (this.isModified("userEmail") && !this.isNew) {
    this.isEmailVerified = false;
    this.emailVerified = false;
  }
  next();
});

// Instance method to check password
userSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.userPassword || !password) {
    return false;
  }
  return await bcrypt.compare(password, this.userPassword);
};

// Instance method to generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userEmail: this.userEmail,
      userName: this.userName,
      userRole: this.userRole,
    },
    process.env.accessToken_SECRET,
    {
      expiresIn: process.env.accessToken_EXPIRY || "1d",
    }
  );
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.refreshToken_SECRET,
    {
      expiresIn: process.env.refreshToken_EXPIRY || "7d",
    }
  );
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;

  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = jwt.sign(
    { _id: this._id, purpose: "password-reset" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  this.passwordResetToken = resetToken;
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken;
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ 
    userEmail: email.toLowerCase() 
  }).select("+userPassword");

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.isLocked) {
    throw new Error("Account temporarily locked due to too many failed login attempts");
  }

  const isMatch = await user.isPasswordCorrect(password);

  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error("Invalid credentials");
  }

  // Reset login attempts on successful login
  if (user.loginAttempts || user.lockUntil) {
    await user.resetLoginAttempts();
  }

  return user;
};

// Static method for role-based user count
userSchema.statics.getUserCountByRole = async function () {
  return await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$userRole", count: { $sum: 1 } } },
  ]);
};

// Static method to find users by skill
userSchema.statics.findUsersBySkill = async function (skillName) {
  return await this.find({
    "userSkills.name": { $regex: skillName, $options: "i" },
    isActive: true,
  });
};

const User = mongoose.model("User", userSchema);

export default User;

// ================================================================================== //

// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const userSchema = new mongoose.Schema(
//   {
//     userName: {
//       type: String,
//       required: [true, "Username is required"],
//       trim: true,
//       maxlength: [50, "Username cannot exceed 50 characters"],
//     },
//     userEmail: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match: [
//         /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//         "Please enter a valid email",
//       ],
//     },
//     userPassword: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: [8, "Password must be at least 8 characters long"],
//     },
//     userPhoneNumber: {
//       type: String,
//       required: [true, "Phone number is required"],
//       trim: true,
//     },
//     countryCode: {
//       type: String,
//       required: [true, "Country code is required"],
//       trim: true,
//     },
//     userRole: {
//       type: String,
//       enum: ["student", "teacher", "admin"],
//       default: "student",
//     },
//     userLocation: {
//       homeAddress: {
//         type: String,
//         required: [true, "Home address is required"],
//         trim: true,
//       },
//       currentAddress: {
//         type: String,
//         required: [true, "Current address is required"],
//         trim: true,
//       },
//     },
//     userBio: {
//       type: String,
//       default: "",
//       maxlength: [500, "Bio cannot exceed 500 characters"],
//     },
//     userProfileImage: {
//       type: String,
//       default: "",
//     },
//     userCoverImage: {
//       type: String,
//       default: "",
//     },
//     authProvider: {
//       type: String,
//       enum: ["local", "google", "github", "firebase"],
//       default: "local",
//     },
//     userAcademicInformation: {
//       universityName: {
//         type: String,
//         trim: true,
//       },
//       degree: {
//         type: String,
//         trim: true,
//       },
//       major: {
//         type: String,
//         trim: true,
//       },
//       grade: {
//         type: Number,
//         min: [0, "Grade cannot be negative"],
//         max: [10, "Grade cannot exceed 10"],
//       },
//       graduationYear: {
//         type: String,
//         trim: true,
//       },
//       startDate: {
//         type: String,
//         trim: true,
//       },
//       endDate: {
//         type: String,
//         trim: true,
//       },
//     },
//     userSkills: {
//       type: [String],
//       default: [],
//       validate: {
//         validator: function (skills) {
//           return skills.length <= 20; // Maximum 20 skills
//         },
//         message: "Cannot have more than 20 skills",
//       },
//     },
//     userSocialMediaProfiles: [
//       {
//         platform: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//         profileLink: {
//           type: String,
//           required: true,
//           trim: true,
//           match: [/^https?:\/\/.+/, "Profile link must be a valid URL"],
//         },
//       },
//     ],
//     userJoiningDate: {
//       type: Date,
//       default: Date.now,
//     },
//     userLastLogin: {
//       type: Date,
//       default: Date.now,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     refreshToken: {
//       type: String,
//       default: "",
//     },
//     // Achievement-related fields
//     totalPoints: {
//       type: Number,
//       default: 0,
//       min: [0, "Total points cannot be negative"],
//     },
//     achievementLevel: {
//       type: Number,
//       default: 1,
//       min: [1, "Achievement level cannot be less than 1"],
//     },
//     achievementStats: {
//       totalAchievements: {
//         type: Number,
//         default: 0,
//       },
//       categoryCounts: {
//         academic: { type: Number, default: 0 },
//         collaboration: { type: Number, default: 0 },
//         milestones: { type: Number, default: 0 },
//         skills: { type: Number, default: 0 },
//         teaching: { type: Number, default: 0 },
//         mentorship: { type: Number, default: 0 },
//         management: { type: Number, default: 0 },
//         leadership: { type: Number, default: 0 },
//       },
//       lastAchievementDate: {
//         type: Date,
//         default: null,
//       },
//     },
//     // Activity tracking for automatic achievement awards
//     activityStats: {
//       assignmentsSubmitted: { type: Number, default: 0 },
//       assignmentsCompleted: { type: Number, default: 0 },
//       perfectScores: { type: Number, default: 0 },
//       helpfulEvaluations: { type: Number, default: 0 },
//       evaluationsGiven: { type: Number, default: 0 },
//       evaluationsReceived: { type: Number, default: 0 },
//       consecutiveDaysActive: { type: Number, default: 0 },
//       lastActiveDate: { type: Date, default: Date.now },
//       // Teacher-specific stats
//       studentsHelped: { type: Number, default: 0 },
//       coursesCreated: { type: Number, default: 0 },
//       assignmentsCreated: { type: Number, default: 0 },
//       // Admin-specific stats
//       usersManaged: { type: Number, default: 0 },
//       issuesResolved: { type: Number, default: 0 },
//       systemImprovements: { type: Number, default: 0 },
//     },
//   },
//   {
//     timestamps: true, // Adds createdAt and updatedAt automatically
//   }
// );

// // Index for better query performance
// userSchema.index({ userName: 1 });
// userSchema.index({ userEmail: 1 });
// userSchema.index({ totalPoints: -1 }); // For leaderboard queries
// userSchema.index({ achievementLevel: -1 });

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   // Only hash the password if it has been modified (or is new)
//   if (!this.isModified("userPassword") || this.authProvider !== "local")
//     return next();

//   try {
//     // Hash password with cost of 12
//     this.userPassword = await bcrypt.hash(this.userPassword, 12);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Update achievement level based on total points
// userSchema.pre("save", function (next) {
//   if (this.isModified("totalPoints")) {
//     // Calculate level based on points (every 100 points = 1 level)
//     this.achievementLevel = Math.floor(this.totalPoints / 100) + 1;
//   }
//   next();
// });

// // Compare password method
// userSchema.methods.isPasswordCorrect = async function (password) {
//   // For social login users, always return false for direct password comparison
//   if (this.authProvider !== "local") {
//     return false;
//   }

//   try {
//     return await bcrypt.compare(password, this.userPassword);
//   } catch (error) {
//     throw new Error("Password comparison failed");
//   }
// };

// // Generate access token
// userSchema.methods.generateAccessToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//       userEmail: this.userEmail,
//       userName: this.userName,
//       userRole: this.userRole,
//     },
//     process.env.accessToken_SECRET,
//     {
//       expiresIn: process.env.accessToken_EXPIRY || "1h",
//     }
//   );
// };

// // Generate refresh token
// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//     },
//     process.env.refreshToken_SECRET,
//     {
//       expiresIn: process.env.refreshToken_EXPIRY || "7d",
//     }
//   );
// };

// // Update activity stats and check for achievements
// userSchema.methods.updateActivityStats = async function (
//   activityType,
//   value = 1
// ) {
//   try {
//     const { checkAndAwardAchievements } = await import(
//       "../controllers/achievement.controller.js"
//     );

//     // Update the specific activity stat
//     if (this.activityStats[activityType] !== undefined) {
//       this.activityStats[activityType] += value;
//       this.activityStats.lastActiveDate = new Date();
//     }

//     // Update consecutive days active
//     const today = new Date();
//     const lastActive = new Date(this.activityStats.lastActiveDate);
//     const diffTime = Math.abs(today.getTime() - lastActive.getTime());
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//     if (diffDays === 1) {
//       this.activityStats.consecutiveDaysActive += 1;
//     } else if (diffDays > 1) {
//       this.activityStats.consecutiveDaysActive = 1;
//     }

//     await this.save();

//     // Check for achievements based on the activity
//     const actionData = {
//       [activityType]: this.activityStats[activityType],
//       consecutiveDays: this.activityStats.consecutiveDaysActive,
//     };

//     await checkAndAwardAchievements(this._id, activityType, actionData);
//   } catch (error) {
//     console.error("Error updating activity stats:", error);
//   }
// };

// // Get user's achievement progress
// userSchema.methods.getAchievementProgress = function () {
//   const pointsToNextLevel = this.achievementLevel * 100 - this.totalPoints;
//   const progressPercentage = ((this.totalPoints % 100) / 100) * 100;

//   return {
//     currentLevel: this.achievementLevel,
//     totalPoints: this.totalPoints,
//     pointsToNextLevel: pointsToNextLevel > 0 ? pointsToNextLevel : 0,
//     progressPercentage: Math.round(progressPercentage),
//   };
// };

// // Static method to get leaderboard
// userSchema.statics.getLeaderboard = async function (limit = 10, role = null) {
//   const match = { isActive: true };
//   if (role) match.userRole = role;

//   return this.aggregate([
//     { $match: match },
//     {
//       $project: {
//         userName: 1,
//         userRole: 1,
//         userProfileImage: 1,
//         totalPoints: 1,
//         achievementLevel: 1,
//         "achievementStats.totalAchievements": 1,
//         "achievementStats.lastAchievementDate": 1,
//       },
//     },
//     { $sort: { totalPoints: -1, achievementLevel: -1 } },
//     { $limit: limit },
//   ]);
// };

// // Virtual for user's rank
// userSchema.virtual("rank").get(async function () {
//   const usersWithHigherPoints = await this.constructor.countDocuments({
//     totalPoints: { $gt: this.totalPoints },
//     isActive: true,
//   });
//   return usersWithHigherPoints + 1;
// });

// // Remove sensitive data from JSON output
// userSchema.methods.toJSON = function () {
//   const user = this.toObject();
//   delete user.userPassword;
//   delete user.refreshToken;
//   return user;
// };

// const User = mongoose.model("User", userSchema);

// export default User;
