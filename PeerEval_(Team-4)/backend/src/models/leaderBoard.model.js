import mongoose from "mongoose";

const leaderBoardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: false,
      default: function () {
        // Generate initials from userName
        return this.userName
          ? this.userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : "NA";
      },
    },
    score: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
    change: {
      type: Number,
      required: true,
      default: 0,
    },
    evaluationsCompleted: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    assignmentsSubmitted: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
leaderBoardSchema.index({ score: -1, rank: 1 });
leaderBoardSchema.index({ userId: 1 });

// Pre-save middleware to generate avatar initials
leaderBoardSchema.pre("save", function (next) {
  if (this.isModified("userName") && !this.avatar) {
    this.avatar = this.userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }
  next();
});

const LeaderBoard = mongoose.model("LeaderBoard", leaderBoardSchema);

export default LeaderBoard;
