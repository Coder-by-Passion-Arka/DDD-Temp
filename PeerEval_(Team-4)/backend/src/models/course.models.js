import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000,
    trim: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status:{
    enum: ["Starting Soon...","Active", "Completed"],
    default: "Starting Soon...",
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  enrolledStudents: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "dropped", "completed"], default: "active" }
  }],
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assignment" }],
  schedule: {
    startDate: Date,
    endDate: Date,
    meetingDays: [String],
    meetingTime: { start: String, end: String }
  }
});

export default mongoose.model("Course", courseSchema);