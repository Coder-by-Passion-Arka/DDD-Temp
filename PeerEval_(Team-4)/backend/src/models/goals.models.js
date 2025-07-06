import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    dueTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format validation
    },
    dueDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format validation
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "missed", "deadline-approaching"],
      default: "in-progress",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    priority: {
      type: Number,
      min: 0,
      max: 10,
      default: 1,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for better query performance
goalSchema.index({ priority: -1, dueDate: 1 });

// Pre-save middleware to calculate priority and status
goalSchema.pre("save", function (next) {
  if (
    this.isModified("progress") ||
    this.isModified("dueDate") ||
    this.isModified("dueTime")
  ) {
    const now = new Date();
    const goalDateTime = new Date(`${this.dueDate}T${this.dueTime}`);
    const timeDiff = goalDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (this.progress === 100) {
      this.status = "completed";
      this.priority = 0;
    } else if (timeDiff < 0) {
      this.status = "missed";
      this.priority = 0;
    } else if (hoursDiff <= 24) {
      this.status = "deadline-approaching";
      this.priority = Math.min(
        10,
        Math.max(1, Math.round(8 - (hoursDiff / 24) * 3))
      );
    } else {
      this.status = "in-progress";
      this.priority = Math.min(
        10,
        Math.max(1, Math.round((100 - this.progress) / 10))
      );
    }
  }
  next();
});

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
