import mongoose from "mongoose";
const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Assignment description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
      index: true,
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [5000, "Instructions cannot exceed 5000 characters"],
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    gradingCriteria: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        maxPoints: {
          type: Number,
          required: true,
          min: 1,
        },
        _id: false,
      },
    ],
    totalPoints: {
      type: Number,
      required: [true, "Total points is required"],
      min: [1, "Total points must be at least 1"],
      max: [1000, "Total points cannot exceed 1000"],
    },
    passingScore: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          return !value || value <= this.totalPoints;
        },
        message: "Passing score cannot exceed total points",
      },
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      index: true,
    },
    lateSubmissionDeadline: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > this.dueDate;
        },
        message: "Late submission deadline must be after due date",
      },
    },
    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "active",
        "closed",
        "evaluation_phase",
        "completed",
        "archived",
      ],
      default: "draft",
      index: true,
    },
    // Submission settings
    submissionSettings: {
      allowLateSubmission: {
        type: Boolean,
        default: false,
      },
      latePenaltyPerDay: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      maxSubmissionAttempts: {
        type: Number,
        default: 1,
        min: 1,
        max: 5,
      },
      allowedFileTypes: [
        {
          type: String,
          enum: [
            "pdf",
            "doc",
            "docx",
            "txt",
            "jpg",
            "jpeg",
            "png",
            "zip",
            "ppt",
            "pptx",
          ],
        },
      ],
      maxFileSize: {
        type: Number,
        default: 50 * 1024 * 1024, // 50MB in bytes
        max: 100 * 1024 * 1024, // 100MB max
      },
      requireTextSubmission: {
        type: Boolean,
        default: true,
      },
      requireFileAttachment: {
        type: Boolean,
        default: false,
      },
      minWordCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      maxWordCount: {
        type: Number,
        default: 10000,
        min: 1,
      },
    },
    // Peer evaluation settings
    peerEvaluationSettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      evaluationsPerSubmission: {
        type: Number,
        default: 2,
        min: 1,
        max: 5,
      },
      maxEvaluationsPerStudent: {
        type: Number,
        default: 3,
        min: 1,
        max: 10,
      },
      evaluationDeadline: {
        type: Date,
      },
      anonymousEvaluation: {
        type: Boolean,
        default: true,
      },
      allowSelfEvaluation: {
        type: Boolean,
        default: false,
      },
      requireEvaluatorComments: {
        type: Boolean,
        default: true,
      },
      minCommentLength: {
        type: Number,
        default: 50,
        min: 0,
      },
    },
    // Assignment resources/attachments
    resources: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          enum: ["image", "video", "audio", "document", "other"],
          default: "document",
        },
        isRequired: {
          type: Boolean,
          default: false,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        _id: false,
      },
    ],
    // Assignment tags for categorization
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    // Assignment statistics (updated automatically)
    statistics: {
      totalSubmissions: {
        type: Number,
        default: 0,
      },
      submittedCount: {
        type: Number,
        default: 0,
      },
      pendingCount: {
        type: Number,
        default: 0,
      },
      lateCount: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    // Evaluation statistics
    evaluationStatistics: {
      totalEvaluations: {
        type: Number,
        default: 0,
      },
      completedEvaluations: {
        type: Number,
        default: 0,
      },
      pendingEvaluations: {
        type: Number,
        default: 0,
      },
      averageEvaluationScore: {
        type: Number,
        default: 0,
      },
      evaluationCompletionRate: {
        type: Number,
        default: 0,
      },
    },
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);
// Indexes for better query performance
assignmentSchema.index({ courseId: 1, status: 1 });
assignmentSchema.index({ createdBy: 1, createdAt: -1 });
assignmentSchema.index({ dueDate: 1, status: 1 });
// assignmentSchema.index({ status: 1 });
assignmentSchema.index({ tags: 1 });
// Virtual properties
assignmentSchema.virtual("isOverdue").get(function () {
  return new Date() > this.dueDate && this.status === "published";
});
assignmentSchema.virtual("daysRemaining").get(function () {
  const now = new Date();
  const timeDiff = this.dueDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});
assignmentSchema.virtual("submissionDeadlinePassed").get(function () {
  const deadline = this.lateSubmissionDeadline || this.dueDate;
  return new Date() > deadline;
});
// Instance methods
assignmentSchema.methods.canUserAccess = async function (userId, userRole) {
  // Admin can access everything
  if (userRole === "admin") return true;
  // Creator can always access
  if (this.createdBy.toString() === userId.toString()) return true;
  // Check if user is course instructor
  const Course = mongoose.model("Course");
  const course = await Course.findById(this.courseId);
  if (course && course.instructor.toString() === userId.toString()) return true;
  // For students, check if they're enrolled in the course
  if (userRole === "student") {
    if (course && course.enrolledStudents) {
      const isEnrolled = course.enrolledStudents.some(
        (enrollment) =>
          enrollment.student.toString() === userId.toString() &&
          enrollment.status === "active"
      );
      return isEnrolled;
    }
  }
  return false;
};
assignmentSchema.methods.canSubmit = function () {
  const now = new Date();
  // Check if assignment is published
  if (this.status !== "published" && this.status !== "active") {
    return {
      allowed: false,
      reason: "Assignment is not yet available for submission",
    };
  }
  // Check if deadline has passed
  if (now > this.dueDate) {
    if (this.submissionSettings.allowLateSubmission) {
      if (this.lateSubmissionDeadline && now > this.lateSubmissionDeadline) {
        return {
          allowed: false,
          reason: "Late submission deadline has passed",
        };
      }
      return { allowed: true, isLate: true, reason: "Late submission allowed" };
    } else {
      return { allowed: false, reason: "Submission deadline has passed" };
    }
  }
  return { allowed: true, isLate: false };
};
assignmentSchema.methods.updateStatistics = async function () {
  try {
    const Submission = mongoose.model("Submission");
    // Get all submissions for this assignment
    const submissions = await Submission.find({ assignmentId: this._id });

    const totalSubmissions = submissions.length;
    const submittedCount = submissions.filter((s) =>
      ["submitted", "under_evaluation", "evaluated", "finalized"].includes(
        s.status
      )
    ).length;
    const lateCount = submissions.filter((s) => s.isLate).length;

    // Calculate average score from finalized submissions
    const finalizedSubmissions = submissions.filter(
      (s) =>
        s.status === "finalized" &&
        s.finalEvaluation?.averageScore !== undefined
    );
    const averageScore =
      finalizedSubmissions.length > 0
        ? finalizedSubmissions.reduce(
            (sum, s) => sum + s.finalEvaluation.averageScore,
            0
          ) / finalizedSubmissions.length
        : 0;

    // Get course enrollment count for completion rate
    const Course = mongoose.model("Course");
    const course = await Course.findById(this.courseId);
    const enrolledCount =
      course?.enrolledStudents?.filter((e) => e.status === "active")?.length ||
      0;

    const completionRate =
      enrolledCount > 0 ? (submittedCount / enrolledCount) * 100 : 0;

    // Update statistics
    this.statistics = {
      totalSubmissions,
      submittedCount,
      pendingCount: enrolledCount - submittedCount,
      lateCount,
      averageScore: Math.round(averageScore * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      lastUpdated: new Date(),
    };

    await this.save();
    return this.statistics;
  } catch (error) {
    console.error("Error updating assignment statistics:", error);
    throw error;
  }
};
// Static methods
assignmentSchema.statics.updateAssignmentStatistics = async function (
  assignmentId
) {
  const assignment = await this.findById(assignmentId);
  if (assignment) {
    return await assignment.updateStatistics();
  }
  return null;
};
assignmentSchema.statics.getAssignmentsForUser = async function (
  userId,
  userRole,
  filters = {}
) {
  const Course = mongoose.model("Course");
  let query = {};
  switch (userRole) {
    case "admin":
      // Admins can see all assignments
      break;
    case "teacher":
      // Teachers can see assignments they created or for courses they instruct
      const teacherCourses = await Course.find({
        $or: [{ instructor: userId }, { createdBy: userId }],
      }).distinct("_id");
      query.courseId = { $in: teacherCourses };
      break;
    case "student":
      // Students can see assignments from courses they're enrolled in
      const studentCourses = await Course.find({
        "enrolledStudents.student": userId,
        "enrolledStudents.status": "active",
      }).distinct("_id");
      query.courseId = { $in: studentCourses };
      query.status = {
        $in: ["published", "active", "closed", "evaluation_phase", "completed"],
      };
      break;
    default:
      return [];
  }
  // Apply additional filters
  if (filters.courseId) query.courseId = filters.courseId;
  if (filters.status) query.status = filters.status;
  if (filters.tags) query.tags = { $in: filters.tags };
  return this.find(query)
    .populate("createdBy", "userName userEmail")
    .populate("courseId", "title courseCode")
    .sort({ createdAt: -1 });
};
assignmentSchema.statics.triggerPeerEvaluations = async function (
  assignmentId,
  settings = {}
) {
  try {
    const assignment = await this.findById(assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    if (!assignment.peerEvaluationSettings.enabled) {
      throw new Error("Peer evaluation is not enabled for this assignment");
    }

    // Get all submitted submissions
    const Submission = mongoose.model("Submission");
    const submissions = await Submission.find({
      assignmentId: assignmentId,
      status: "submitted",
    }).populate("userId", "_id userName");

    if (submissions.length < 2) {
      throw new Error("Need at least 2 submissions to start peer evaluation");
    }

    // Trigger evaluation assignment
    const result = await Submission.triggerEvaluationAssignment(assignmentId);

    // Update assignment status
    assignment.status = "evaluation_phase";
    await assignment.save();

    return result;
  } catch (error) {
    throw new Error(`Failed to trigger peer evaluations: ${error.message}`);
  }
};
// Pre-save middleware
assignmentSchema.pre("save", function (next) {
  // Validate due date is in the future for new assignments
  if (this.isNew && this.dueDate <= new Date() && this.status !== "draft") {
    return next(new Error("Due date must be in the future"));
  }
  // Auto-set evaluation deadline if peer evaluation is enabled
  if (
    this.peerEvaluationSettings.enabled &&
    !this.peerEvaluationSettings.evaluationDeadline
  ) {
    const evaluationDeadline = new Date(this.dueDate);
    evaluationDeadline.setDate(evaluationDeadline.getDate() + 7); // 7 days after due date
    this.peerEvaluationSettings.evaluationDeadline = evaluationDeadline;
  }
  // Set default allowed file types if none specified
  if (this.submissionSettings.allowedFileTypes.length === 0) {
    this.submissionSettings.allowedFileTypes = ["pdf", "doc", "docx"];
  }
  next();
});
// Pre-remove middleware to clean up related data
assignmentSchema.pre("remove", async function (next) {
  try {
    const Submission = mongoose.model("Submission");
    const Evaluation = mongoose.model("Evaluation");
    // Remove all submissions for this assignment
    await Submission.deleteMany({ assignmentId: this._id });

    // Remove all evaluations for this assignment
    await Evaluation.deleteMany({ assignmentId: this._id });

    next();
  } catch (error) {
    next(error);
  }
});
const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;

// ============================================================================================ //

// import mongoose from "mongoose";

// const assignmentSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: [true, "Assignment title is required"],
//       trim: true,
//       maxlength: [200, "Title cannot exceed 200 characters"],
//     },
//     description: {
//       type: String,
//       required: [true, "Assignment description is required"],
//       trim: true,
//       maxlength: [2000, "Description cannot exceed 2000 characters"],
//     },
//     courseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Course",
//       required: [true, "Course is required"],
//       index: true,
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "Creator is required"],
//       index: true,
//     },
//     instructions: {
//       type: String,
//       trim: true,
//       maxlength: [5000, "Instructions cannot exceed 5000 characters"],
//     },
//     requirements: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//     gradingCriteria: [
//       {
//         name: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//         description: {
//           type: String,
//           trim: true,
//         },
//         maxPoints: {
//           type: Number,
//           required: true,
//           min: 1,
//         },
//         _id: false,
//       },
//     ],
//     totalPoints: {
//       type: Number,
//       required: [true, "Total points is required"],
//       min: [1, "Total points must be at least 1"],
//       max: [1000, "Total points cannot exceed 1000"],
//     },
//     passingScore: {
//       type: Number,
//       min: 0,
//       validate: {
//         validator: function (value) {
//           return value <= this.totalPoints;
//         },
//         message: "Passing score cannot exceed total points",
//       },
//     },
//     dueDate: {
//       type: Date,
//       required: [true, "Due date is required"],
//       index: true,
//     },
//     lateSubmissionDeadline: {
//       type: Date,
//       validate: {
//         validator: function (value) {
//           return !value || value > this.dueDate;
//         },
//         message: "Late submission deadline must be after due date",
//       },
//     },
//     status: {
//       type: String,
//       enum: [
//         "draft",
//         "published",
//         "active",
//         "closed",
//         "evaluation_phase",
//         "completed",
//         "archived",
//       ],
//       default: "draft",
//       index: true,
//     },
//     // Submission settings
//     submissionSettings: {
//       allowLateSubmission: {
//         type: Boolean,
//         default: false,
//       },
//       latePenaltyPerDay: {
//         type: Number,
//         default: 0,
//         min: 0,
//         max: 100,
//       },
//       maxSubmissionAttempts: {
//         type: Number,
//         default: 1,
//         min: 1,
//         max: 5,
//       },
//       allowedFileTypes: [
//         {
//           type: String,
//           enum: [
//             "pdf",
//             "doc",
//             "docx",
//             "txt",
//             "jpg",
//             "jpeg",
//             "png",
//             "zip",
//             "ppt",
//             "pptx",
//           ],
//         },
//       ],
//       maxFileSize: {
//         type: Number,
//         default: 50 * 1024 * 1024, // 50MB in bytes
//         max: 100 * 1024 * 1024, // 100MB max
//       },
//       requireTextSubmission: {
//         type: Boolean,
//         default: true,
//       },
//       requireFileAttachment: {
//         type: Boolean,
//         default: false,
//       },
//       minWordCount: {
//         type: Number,
//         default: 0,
//         min: 0,
//       },
//       maxWordCount: {
//         type: Number,
//         default: 10000,
//         min: 1,
//       },
//     },
//     // Peer evaluation settings
//     peerEvaluationSettings: {
//       enabled: {
//         type: Boolean,
//         default: false,
//       },
//       evaluationsPerSubmission: {
//         type: Number,
//         default: 2,
//         min: 1,
//         max: 5,
//       },
//       maxEvaluationsPerStudent: {
//         type: Number,
//         default: 3,
//         min: 1,
//         max: 10,
//       },
//       evaluationDeadline: {
//         type: Date,
//       },
//       anonymousEvaluation: {
//         type: Boolean,
//         default: true,
//       },
//       allowSelfEvaluation: {
//         type: Boolean,
//         default: false,
//       },
//       requireEvaluatorComments: {
//         type: Boolean,
//         default: true,
//       },
//       minCommentLength: {
//         type: Number,
//         default: 50,
//         min: 0,
//       },
//     },
//     // Assignment resources/attachments
//     resources: [
//       {
//         title: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//         url: {
//           type: String,
//           required: true,
//         },
//         fileType: {
//           type: String,
//           enum: ["image", "video", "audio", "document", "other"],
//           default: "document",
//         },
//         isRequired: {
//           type: Boolean,
//           default: false,
//         },
//         uploadedAt: {
//           type: Date,
//           default: Date.now,
//         },
//         _id: false,
//       },
//     ],
//     // Assignment tags for categorization
//     tags: [
//       {
//         type: String,
//         trim: true,
//         lowercase: true,
//       },
//     ],
//     // Assignment statistics (updated automatically)
//     statistics: {
//       totalSubmissions: {
//         type: Number,
//         default: 0,
//       },
//       submittedCount: {
//         type: Number,
//         default: 0,
//       },
//       pendingCount: {
//         type: Number,
//         default: 0,
//       },
//       lateCount: {
//         type: Number,
//         default: 0,
//       },
//       averageScore: {
//         type: Number,
//         default: 0,
//       },
//       completionRate: {
//         type: Number,
//         default: 0,
//       },
//       lastUpdated: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//     // Evaluation statistics
//     evaluationStatistics: {
//       totalEvaluations: {
//         type: Number,
//         default: 0,
//       },
//       completedEvaluations: {
//         type: Number,
//         default: 0,
//       },
//       pendingEvaluations: {
//         type: Number,
//         default: 0,
//       },
//       averageEvaluationScore: {
//         type: Number,
//         default: 0,
//       },
//       evaluationCompletionRate: {
//         type: Number,
//         default: 0,
//       },
//     },
//     // Additional metadata
//     metadata: {
//       type: mongoose.Schema.Types.Mixed,
//       default: {},
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes for better query performance
// assignmentSchema.index({ courseId: 1, status: 1 });
// assignmentSchema.index({ createdBy: 1, createdAt: -1 });
// assignmentSchema.index({ dueDate: 1, status: 1 });
// assignmentSchema.index({ status: 1 });
// assignmentSchema.index({ tags: 1 });

// // Virtual properties
// assignmentSchema.virtual("isOverdue").get(function () {
//   return new Date() > this.dueDate && this.status === "published";
// });

// assignmentSchema.virtual("daysRemaining").get(function () {
//   const now = new Date();
//   const timeDiff = this.dueDate.getTime() - now.getTime();
//   return Math.ceil(timeDiff / (1000 * 3600 * 24));
// });

// assignmentSchema.virtual("submissionDeadlinePassed").get(function () {
//   const deadline = this.lateSubmissionDeadline || this.dueDate;
//   return new Date() > deadline;
// });

// // Instance methods
// assignmentSchema.methods.canUserAccess = function (userId, userRole) {
//   // Admin can access everything
//   if (userRole === "admin") return true;

//   // Creator can always access
//   if (this.createdBy.toString() === userId.toString()) return true;

//   // Check if user is course instructor (needs to be populated or checked)
//   return userRole === "teacher" || userRole === "student";
// };

// assignmentSchema.methods.canSubmit = function () {
//   const now = new Date();

//   // Check if assignment is published
//   if (this.status !== "published" && this.status !== "active") {
//     return {
//       allowed: false,
//       reason: "Assignment is not yet available for submission",
//     };
//   }

//   // Check if deadline has passed
//   if (now > this.dueDate) {
//     if (this.submissionSettings.allowLateSubmission) {
//       if (this.lateSubmissionDeadline && now > this.lateSubmissionDeadline) {
//         return {
//           allowed: false,
//           reason: "Late submission deadline has passed",
//         };
//       }
//       return { allowed: true, isLate: true, reason: "Late submission allowed" };
//     } else {
//       return { allowed: false, reason: "Submission deadline has passed" };
//     }
//   }

//   return { allowed: true, isLate: false };
// };

// assignmentSchema.methods.updateStatistics = async function () {
//   try {
//     const Submission = mongoose.model("Submission");

//     // Get all submissions for this assignment
//     const submissions = await Submission.find({ assignmentId: this._id });

//     const totalSubmissions = submissions.length;
//     const submittedCount = submissions.filter((s) =>
//       ["submitted", "under_evaluation", "evaluated", "finalized"].includes(
//         s.status
//       )
//     ).length;
//     const lateCount = submissions.filter((s) => s.isLate).length;

//     // Calculate average score from finalized submissions
//     const finalizedSubmissions = submissions.filter(
//       (s) =>
//         s.status === "finalized" &&
//         s.finalEvaluation?.averageScore !== undefined
//     );
//     const averageScore =
//       finalizedSubmissions.length > 0
//         ? finalizedSubmissions.reduce(
//             (sum, s) => sum + s.finalEvaluation.averageScore,
//             0
//           ) / finalizedSubmissions.length
//         : 0;

//     // Get course enrollment count for completion rate
//     const Course = mongoose.model("Course");
//     const course = await Course.findById(this.courseId);
//     const enrolledCount =
//       course?.enrolledStudents?.filter((e) => e.status === "active")?.length ||
//       0;

//     const completionRate =
//       enrolledCount > 0 ? (submittedCount / enrolledCount) * 100 : 0;

//     // Update statistics
//     this.statistics = {
//       totalSubmissions,
//       submittedCount,
//       pendingCount: enrolledCount - submittedCount,
//       lateCount,
//       averageScore: Math.round(averageScore * 100) / 100,
//       completionRate: Math.round(completionRate * 100) / 100,
//       lastUpdated: new Date(),
//     };

//     await this.save();
//     return this.statistics;
//   } catch (error) {
//     console.error("Error updating assignment statistics:", error);
//     throw error;
//   }
// };

// // Static methods
// assignmentSchema.statics.updateAssignmentStatistics = async function (
//   assignmentId
// ) {
//   const assignment = await this.findById(assignmentId);
//   if (assignment) {
//     return await assignment.updateStatistics();
//   }
//   return null;
// };

// assignmentSchema.statics.triggerPeerEvaluations = async function (
//   assignmentId,
//   settings = {}
// ) {
//   try {
//     const assignment = await this.findById(assignmentId);
//     if (!assignment) {
//       throw new Error("Assignment not found");
//     }

//     if (!assignment.peerEvaluationSettings.enabled) {
//       throw new Error("Peer evaluation is not enabled for this assignment");
//     }

//     // Get all submitted submissions
//     const Submission = mongoose.model("Submission");
//     const submissions = await Submission.find({
//       assignmentId: assignmentId,
//       status: "submitted",
//     }).populate("userId", "_id userName");

//     if (submissions.length < 2) {
//       throw new Error("Need at least 2 submissions to start peer evaluation");
//     }

//     // Trigger evaluation assignment
//     const result = await Submission.triggerEvaluationAssignment(assignmentId);

//     // Update assignment status
//     assignment.status = "evaluation_phase";
//     await assignment.save();

//     return result;
//   } catch (error) {
//     throw new Error(`Failed to trigger peer evaluations: ${error.message}`);
//   }
// };

// // Pre-save middleware
// assignmentSchema.pre("save", function (next) {
//   // Validate due date is in the future for new assignments
//   if (this.isNew && this.dueDate <= new Date() && this.status !== "draft") {
//     return next(new Error("Due date must be in the future"));
//   }

//   // Auto-set evaluation deadline if peer evaluation is enabled
//   if (
//     this.peerEvaluationSettings.enabled &&
//     !this.peerEvaluationSettings.evaluationDeadline
//   ) {
//     const evaluationDeadline = new Date(this.dueDate);
//     evaluationDeadline.setDate(evaluationDeadline.getDate() + 7); // 7 days after due date
//     this.peerEvaluationSettings.evaluationDeadline = evaluationDeadline;
//   }

//   // Set default allowed file types if none specified
//   if (this.submissionSettings.allowedFileTypes.length === 0) {
//     this.submissionSettings.allowedFileTypes = ["pdf", "doc", "docx"];
//   }

//   next();
// });

// // Pre-remove middleware to clean up related data
// assignmentSchema.pre("remove", async function (next) {
//   try {
//     const Submission = mongoose.model("Submission");
//     const Evaluation = mongoose.model("Evaluation");

//     // Remove all submissions for this assignment
//     await Submission.deleteMany({ assignmentId: this._id });

//     // Remove all evaluations for this assignment
//     await Evaluation.deleteMany({ assignmentId: this._id });

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// const Assignment = mongoose.model("Assignment", assignmentSchema);

// export default Assignment;
