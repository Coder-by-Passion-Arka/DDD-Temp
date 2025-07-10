// import mongoose from "mongoose";

// const courseSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//     minlength: 5,
//     maxlength: 100,
//     trim: true,
//   },
//   description: {
//     type: String,
//     required: true,
//     minlength: 10,
//     maxlength: 2000,
//     trim: true,
//   },
//   instructor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
//   status:{
//     enum: ["Starting Soon...","Active", "Completed"],
//     default: "Starting Soon...",
//     required: true,
//   },
//   courseCode: {
//     type: String,
//     required: true,
//     unique: true,
//     uppercase: true,
//   },
//   enrolledStudents: [{
//     student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     enrolledAt: { type: Date, default: Date.now },
//     status: { type: String, enum: ["active", "dropped", "completed"], default: "active" }
//   }],
//   assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assignment" }],
//   schedule: {
//     startDate: Date,
//     endDate: Date,
//     meetingDays: [String],
//     meetingTime: { start: String, end: String }
//   }
// });

// export default mongoose.model("Course", courseSchema);

// ======================================================================================= //

import mongoose from "mongoose";
const courseSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      enum: ["draft", "starting_soon", "active", "completed", "archived"],
      default: "starting_soon",
      required: true,
    },
    courseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    enrolledStudents: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["active", "dropped", "completed"],
          default: "active",
        },
      },
    ],
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    schedule: {
      startDate: Date,
      endDate: Date,
      meetingDays: [String],
      meetingTime: {
        start: String,
        end: String,
      },
    },
    // Additional settings for assignment management
    settings: {
      maxStudents: {
        type: Number,
        default: 50,
        min: 1,
        max: 500,
      },
      allowSelfEnrollment: {
        type: Boolean,
        default: false,
      },
      isPublic: {
        type: Boolean,
        default: false,
      },
      enablePeerEvaluation: {
        type: Boolean,
        default: true,
      },
      gradingScale: {
        type: String,
        enum: ["letter", "percentage", "points"],
        default: "letter",
      },
    },
    // Course statistics
    statistics: {
      totalAssignments: {
        type: Number,
        default: 0,
      },
      completedAssignments: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      studentEngagement: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);
// Indexes for better performance
// courseSchema.index({ courseCode: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ "enrolledStudents.student": 1 });
// courseSchema.index({ status: 1 });
// Virtual properties
courseSchema.virtual("enrollmentCount").get(function () {
  return this.enrolledStudents.filter((e) => e.status === "active").length;
});
courseSchema.virtual("assignmentCount").get(function () {
  return this.assignments.length;
});
// Instance methods
courseSchema.methods.canUserAccess = function (userId, userRole) {
  // Admin can access everything
  if (userRole === "admin") return true;
  // Instructor can access their courses
  if (this.instructor.toString() === userId.toString()) return true;
  // Creator can access courses they created
  if (this.createdBy.toString() === userId.toString()) return true;
  // Students can access if enrolled
  if (userRole === "student") {
    const enrollment = this.enrolledStudents.find(
      (e) => e.student.toString() === userId.toString() && e.status === "active"
    );
    return !!enrollment;
  }
  return false;
};
courseSchema.methods.enrollStudent = async function (studentId) {
  // Check if student is already enrolled
  const existingEnrollment = this.enrolledStudents.find(
    (e) => e.student.toString() === studentId.toString()
  );
  if (existingEnrollment) {
    if (existingEnrollment.status === "active") {
      throw new Error("Student is already enrolled in this course");
    } else {
      // Reactivate enrollment
      existingEnrollment.status = "active";
      existingEnrollment.enrolledAt = new Date();
    }
  } else {
    // Check enrollment limit
    const activeEnrollments = this.enrolledStudents.filter(
      (e) => e.status === "active"
    ).length;
    if (activeEnrollments >= this.settings.maxStudents) {
      throw new Error("Course has reached maximum enrollment capacity");
    }

    // Add new enrollment
    this.enrolledStudents.push({
      student: studentId,
      enrolledAt: new Date(),
      status: "active",
    });
  }
  await this.save();
  return this;
};
courseSchema.methods.unenrollStudent = async function (
  studentId,
  reason = "dropped"
) {
  const enrollment = this.enrolledStudents.find(
    (e) => e.student.toString() === studentId.toString()
  );
  if (!enrollment) {
    throw new Error("Student is not enrolled in this course");
  }
  enrollment.status = reason;
  await this.save();
  return this;
};
courseSchema.methods.updateStatistics = async function () {
  try {
    const Assignment = mongoose.model("Assignment");
    const Submission = mongoose.model("Submission");
    // Get all assignments for this course
    const assignments = await Assignment.find({ courseId: this._id });
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(
      (a) => a.status === "completed"
    ).length;

    // Calculate average score from all finalized submissions
    const allSubmissions = await Submission.find({
      assignmentId: { $in: assignments.map((a) => a._id) },
      status: "finalized",
    });

    const averageScore =
      allSubmissions.length > 0
        ? allSubmissions.reduce(
            (sum, s) => sum + (s.finalEvaluation?.averageScore || 0),
            0
          ) / allSubmissions.length
        : 0;

    // Calculate student engagement (submission rate)
    const activeStudents = this.enrolledStudents.filter(
      (e) => e.status === "active"
    ).length;
    const totalPossibleSubmissions = totalAssignments * activeStudents;
    const actualSubmissions = allSubmissions.length;
    const studentEngagement =
      totalPossibleSubmissions > 0
        ? (actualSubmissions / totalPossibleSubmissions) * 100
        : 0;

    this.statistics = {
      totalAssignments,
      completedAssignments,
      averageScore: Math.round(averageScore * 100) / 100,
      studentEngagement: Math.round(studentEngagement * 100) / 100,
      lastUpdated: new Date(),
    };

    await this.save();
    return this.statistics;
  } catch (error) {
    console.error("Error updating course statistics:", error);
    throw error;
  }
};
// Static methods
courseSchema.statics.getCoursesForUser = async function (
  userId,
  userRole,
  filters = {}
) {
  let query = {};
  switch (userRole) {
    case "admin":
      // Admins can see all courses
      break;
    case "teacher":
      query = {
        $or: [{ instructor: userId }, { createdBy: userId }],
      };
      break;
    case "student":
      query = {
        "enrolledStudents.student": userId,
        "enrolledStudents.status": "active",
      };
      break;
    default:
      return [];
  }
  // Apply additional filters
  if (filters.status) query.status = filters.status;
  return this.find(query)
    .populate("instructor", "userName userEmail")
    .populate("createdBy", "userName userEmail")
    .populate("assignments")
    .sort({ createdAt: -1 });
};
courseSchema.statics.updateCourseStatistics = async function (courseId) {
  const course = await this.findById(courseId);
  if (course) {
    return await course.updateStatistics();
  }
  return null;
};
// Pre-save middleware
courseSchema.pre("save", function (next) {
  // Auto-generate course code if not provided
  if (this.isNew && !this.courseCode) {
    const titleParts = this.title.split(" ");
    const prefix = titleParts
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
    this.courseCode = `${prefix}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});
export default mongoose.model("Course", courseSchema);
