import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      maxlength: [50, "Username cannot exceed 50 characters"],
    },
    userEmail: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    userPassword: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    userPhoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    countryCode: {
      type: String,
      required: [true, "Country code is required"],
      trim: true,
    },
    userRole: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    userLocation: {
      homeAddress: {
        type: String,
        required: [true, "Home address is required"],
        trim: true,
      },
      currentAddress: {
        type: String,
        required: [true, "Current address is required"],
        trim: true,
      },
    },
    userBio: {
      type: String,
      default: "",
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    userProfileImage: {
      type: String,
      default: "",
    },
    userCoverImage: {
      type: String,
      default: "",
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local"
    },
    userAcademicInformation: {
      universityName: {
        type: String,
        trim: true,
      },
      degree: {
        type: String,
        trim: true,
      },
      major: {
        type: String,
        trim: true,
      },
      grade: {
        type: Number,
        min: [0, "Grade cannot be negative"],
        max: [10, "Grade cannot exceed 10"],
      },
      graduationYear: {
        type: String,
        trim: true,
      },
      startDate: {
        type: String,
        trim: true,
      },
      endDate: {
        type: String,
        trim: true,
      },
    },
    userSkills: {
      type: [String],
      default: [],
      validate: {
        validator: function (skills) {
          return skills.length <= 20; // Maximum 20 skills
        },
        message: "Cannot have more than 20 skills",
      },
    },
    userSocialMediaProfiles: [
      {
        platform: {
          type: String,
          required: true,
          trim: true,
        },
        profileLink: {
          type: String,
          required: true,
          trim: true,
          match: [/^https?:\/\/.+/, "Profile link must be a valid URL"],
        },
      },
    ],
    userJoiningDate: {
      type: Date,
      default: Date.now,
    },
    userLastLogin: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for better query performance
// userSchema.index({ userEmail: 1 });
userSchema.index({ userName: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("userPassword") || this.authProvider !== "local") return next();

  try {
    // Hash password with cost of 12
    this.userPassword = await bcrypt.hash(this.userPassword, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.isPasswordCorrect = async function (password) {
  // For social login users, always return false for direct password comparison
  if (this.authProvider !== "local") {
    return false;
  }
  
  try {
    return await bcrypt.compare(password, this.userPassword);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Generate access token
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
      expiresIn: process.env.accessToken_EXPIRY || "1h",
    }
  );
};

// Generate refresh token
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

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.userPassword;
  delete user.refreshToken;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
