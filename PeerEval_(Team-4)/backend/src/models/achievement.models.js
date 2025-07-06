import mongoose from "mongoose";

const achievementsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 500,
    },
    date: {
      type: Date,
      required: true,
    },
    achievementHolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Achievement", achievementsSchema);

// =============================== // 

import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "first_assignment",
        "perfect_score",
        "helpful_peer",
        "assignment_streak",
        "skill_master",
        "collaboration_champion",
        "feedback_hero",
        "academic_excellence",
        "consistent_performer",
        "mentor"
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ["academic", "collaboration", "milestones", "skills"],
      required: true,
    },
    icon: {
      type: String,
      enum: ["Medal", "Trophy", "Star", "Award", "ScrollText", "Globe"],
      default: "Medal",
    },
    points: {
      type: Number,
      default: 10,
      min: 0,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    criteria: {
      // Conditions that must be met to earn this achievement
      assignmentCount: Number,
      minScore: Number,
      streakDays: Number,
      evaluationCount: Number,
      skillCount: Number,
    },
    context: {
      // Additional context about how this achievement was earned
      assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
      score: Number,
      relatedData: mongoose.Schema.Types.Mixed,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
achievementSchema.index({ userId: 1, earnedAt: -1 });
achievementSchema.index({ type: 1 });
achievementSchema.index({ category: 1 });

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;