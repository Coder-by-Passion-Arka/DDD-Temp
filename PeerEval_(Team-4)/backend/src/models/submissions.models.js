import { json } from "express";
import mongoose from "mongoose";
const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Submission content is required"],
      trim: true,
      maxlength: 10000,
    },
    attachments: [
      {
        filename: {
          type: String,
          required: true,
          trim: true,
        },
        originalName: {
          type: String,
          trim: true,
        },
        url: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          min: 0,
          max: 50 * 1024 * 1024, // 50MB limit
        },
        mimetype: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        _id: false,
      },
    ],
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_evaluation",
        "evaluated",
        "finalized",
        "returned",
      ],
      default: "draft",
      index: true,
    },
    submittedAt: {
      type: Date,
      index: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    // Evaluation tracking
    evaluationAssignments: [
      {
        evaluationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Evaluation",
        },
        evaluatorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["assigned", "in_progress", "completed"],
          default: "assigned",
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
        completedAt: Date,
        _id: false,
      },
    ],
    // Final evaluation results
    finalEvaluation: {
      totalScore: {
        type: Number,
        min: 0,
      },
      maxScore: {
        type: Number,
        min: 1,
      },
      averageScore: {
        type: Number,
        min: 0,
      },
      grade: {
        type: String,
        enum: [
          "A+",
          "A",
          "A-",
          "B+",
          "B",
          "B-",
          "C+",
          "C",
          "C-",
          "D+",
          "D",
          "F",
        ],
      },
      evaluationCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      consensusReached: {
        type: Boolean,
        default: false,
      },
      finalizedAt: Date,
      finalizedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    // Feedback compilation
    compiledFeedback: {
      strengths: [String],
      improvements: [String],
      overallComments: String,
      instructorNotes: String,
    },
    // Quality assurance
    qualityMetrics: {
      plagiarismCheck: {
        status: {
          type: String,
          enum: ["pending", "checked", "flagged", "cleared"],
          default: "pending",
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        report: String,
        checkedAt: Date,
      },
      wordCount: {
        type: Number,
        min: 0,
      },
      readabilityScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      completenessScore: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    // Resubmission tracking
    resubmissionData: {
      isResubmission: {
        type: Boolean,
        default: false,
      },
      originalSubmissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission",
      },
      resubmissionCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      maxResubmissions: {
        type: Number,
        default: 2,
        min: 0,
      },
      resubmissionReason: String,
    },
  },
  {
    timestamps: true,
  }
);
// Compound indexes for efficient queries
submissionSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });
submissionSchema.index({ assignmentId: 1, status: 1 });
submissionSchema.index({ userId: 1, submittedAt: -1 });
submissionSchema.index({ status: 1, submittedAt: -1 });
// Update lastModified on save
submissionSchema.pre("save", async function (next) {
  this.lastModified = new Date();
  // Set submittedAt when status changes to submitted
  if (
    this.isModified("status") &&
    this.status === "submitted" &&
    !this.submittedAt
  ) {
    this.submittedAt = new Date();
  }
  // Update version on content change
  if (this.isModified("content") && !this.isNew) {
    this.version += 1;
  }
  // Calculate word count for quality metrics
  if (this.isModified("content")) {
    this.qualityMetrics.wordCount = this.content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
  // Check if submission is late
  if (this.isNew && this.assignmentId) {
    try {
      const Assignment = mongoose.model("Assignment");
      const assignment = await Assignment.findById(this.assignmentId);
      if (assignment && this.submittedAt) {
        this.isLate = new Date(this.submittedAt) > new Date(assignment.dueDate);
      }
    } catch (error) {
      console.error("Error checking late submission:", error);
    }
  }
  next();
});
// Virtual for evaluation progress
submissionSchema.virtual("evaluationProgress").get(function () {
  if (!this.evaluationAssignments || this.evaluationAssignments.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  const total = this.evaluationAssignments.length;
  const completed = this.evaluationAssignments.filter(
    (evaluation) => evaluation.status === "completed"
  ).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
});
// Virtual for submission score percentage
submissionSchema.virtual("scorePercentage").get(function () {
  if (!this.finalEvaluation?.maxScore || this.finalEvaluation.maxScore === 0) {
    return 0;
  }
  return Math.round(
    (this.finalEvaluation.averageScore / this.finalEvaluation.maxScore) * 100
  );
});
// Virtual for can resubmits
submissionSchema.virtual("canResubmit").get(function () {
  if (!this.resubmissionData) return false;
  else
    return (
      this.resubmissionData.resubmissionCount,
      this.resubmissionData.maxResubmissions
    );
});
// Method to update evaluation status
submissionSchema.methods.updateEvaluationStatus = function (
  evaluationId,
  status,
  completedAt = null
) {
  const evalAssignment = this.evaluationAssignments.find(
    (evaluation) =>
      evaluation.evaluationId.toString() === evaluationId.toString()
  );
  if (evalAssignment) {
    evalAssignment.status = status;
    if (status === "completed" && completedAt) {
      evalAssignment.completedAt = completedAt;
    }
    // Check if all evaluations are completed
    const allCompleted = this.evaluationAssignments.every(
      (evaluation) => evaluation.status === "completed"
    );
    if (allCompleted && this.status === "under_evaluation") {
      this.status = "evaluated";
    }
  }
  return this.save();
};
// Method to compile final evaluation
submissionSchema.methods.compileFinalEvaluation = async function () {
  try {
    const evaluations = await mongoose.model("Evaluation").find({
      submissionId: this._id,
      status: { $in: ["submitted", "reviewed", "finalized"] },
    });
    if (evaluations.length === 0) {
      return null;
    }

    // Calculate average scores
    const totalScore = evaluations.reduce(
      (sum, evaluation) => sum + evaluation.totalScore,
      0
    );
    const maxScore = evaluations[0].maxTotalScore; // Assuming same max score for all
    const averageScore = totalScore / evaluations.length;

    // Determine grade based on average score
    const percentage = (averageScore / maxScore) * 100;
    let grade = "F";
    if (percentage >= 97) grade = "A+";
    else if (percentage >= 93) grade = "A";
    else if (percentage >= 90) grade = "A-";
    else if (percentage >= 87) grade = "B+";
    else if (percentage >= 83) grade = "B";
    else if (percentage >= 80) grade = "B-";
    else if (percentage >= 77) grade = "C+";
    else if (percentage >= 73) grade = "C";
    else if (percentage >= 70) grade = "C-";
    else if (percentage >= 67) grade = "D+";
    else if (percentage >= 60) grade = "D";

    // Compile feedback
    const allFeedback = evaluations
      .map((evaluation) => evaluation.overallFeedback)
      .filter(Boolean);
    const strengths = [];
    const improvements = [];

    // Simple keyword analysis for feedback categorization
    allFeedback.forEach((feedback) => {
      const lowerFeedback = feedback.toLowerCase();
      if (
        lowerFeedback.includes("good") ||
        lowerFeedback.includes("excellent") ||
        lowerFeedback.includes("well")
      ) {
        strengths.push(feedback);
      }
      if (
        lowerFeedback.includes("improve") ||
        lowerFeedback.includes("better") ||
        lowerFeedback.includes("need")
      ) {
        improvements.push(feedback);
      }
    });

    // Update final evaluation
    this.finalEvaluation = {
      totalScore: totalScore,
      maxScore: maxScore,
      averageScore: averageScore,
      grade: grade,
      evaluationCount: evaluations.length,
      consensusReached: true, // Could implement logic to check consensus
      finalizedAt: new Date(),
    };

    this.compiledFeedback = {
      strengths: strengths,
      improvements: improvements,
      overallComments: allFeedback.join("\n\n"),
    };

    this.status = "finalized";

    await this.save();
    return this.finalEvaluation;
  } catch (error) {
    throw new Error("Failed to compile final evaluation: ${error.message}");
  }
};
// Static method to trigger evaluation assignments
submissionSchema.statics.triggerEvaluationAssignment = async function (
  assignmentId
) {
  try {
    // Get all submitted submissions for this assignment
    const submissions = await this.find({
      assignmentId: assignmentId,
      status: "submitted",
    }).populate("userId", "_id userName");
    if (submissions.length < 2) {
      throw new Error("Need at least 2 submissions to start peer evaluation");
    }

    // Use the graph coloring algorithm from Evaluation model
    const Evaluation = mongoose.model("Evaluation");
    const submissionIds = submissions.map((sub) => sub._id);

    // Calculate due date for evaluations (e.g., 1 week from now)
    const evaluationDueDate = new Date();
    evaluationDueDate.setDate(evaluationDueDate.getDate() + 7);

    // Assign evaluations using graph coloring
    const evaluatorAssignments =
      await Evaluation.assignEvaluationsUsingGraphColoring(
        assignmentId,
        submissionIds
      );

    // Create evaluation records
    const createdEvaluations =
      await Evaluation.createEvaluationsFromAssignments(
        assignmentId,
        evaluatorAssignments,
        evaluationDueDate
      );

    // Update submissions with evaluation assignments
    for (const evaluation of createdEvaluations) {
      await this.findByIdAndUpdate(evaluation.submissionId, {
        $push: {
          evaluationAssignments: {
            evaluationId: evaluation._id,
            evaluatorId: evaluation.evaluatorId,
            status: "assigned",
            assignedAt: new Date(),
          },
        },
        status: "under_evaluation",
      });
    }

    return response
           .status(200)
           .json({
              success: true,
              message: `Successfully assigned ${createdEvaluations.length} peer evaluations`,
              evaluations: createdEvaluations,
            });
  } catch (error) {
    throw new Error(
      `Failed to trigger evaluation assignment: ${error.message}`
    );
  }
};
// Method to get submissions for user with enhanced data
submissionSchema.statics.getSubmissionsForUser = async function (
  userId,
  filters = {}
) {
  const query = { userId };
  if (filters.assignmentId) query.assignmentId = filters.assignmentId;
  if (filters.status) query.status = filters.status;
  return this.find(query)
    .populate("assignmentId", "title description dueDate totalPoints courseId")
    .populate("assignmentId.courseId", "title courseCode")
    .sort({ submittedAt: -1 });
};

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;

// ======================================================================================== //

// import mongoose from "mongoose";

// const submissionSchema = new mongoose.Schema(
//   {
//     assignmentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Assignment",
//       required: true,
//       index: true,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },
//     content: {
//       type: String,
//       required: [true, "Submission content is required"],
//       trim: true,
//       maxlength: 10000,
//     },
//     attachments: [
//       {
//         filename: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//         originalName: {
//           type: String,
//           trim: true,
//         },
//         url: {
//           type: String,
//           required: true,
//         },
//         size: {
//           type: Number,
//           min: 0,
//           max: 50 * 1024 * 1024, // 50MB limit
//         },
//         mimetype: {
//           type: String,
//           required: true,
//         },
//         uploadedAt: {
//           type: Date,
//           default: Date.now,
//         },
//         _id: false,
//       },
//     ],
//     status: {
//       type: String,
//       enum: [
//         "draft",
//         "submitted",
//         "under_evaluation",
//         "evaluated",
//         "finalized",
//         "returned",
//       ],
//       default: "draft",
//       index: true,
//     },
//     submittedAt: {
//       type: Date,
//       index: true,
//     },
//     lastModified: {
//       type: Date,
//       default: Date.now,
//     },
//     version: {
//       type: Number,
//       default: 1,
//       min: 1,
//     },
//     isLate: {
//       type: Boolean,
//       default: false,
//     },
//     // Evaluation tracking
//     evaluationAssignments: [
//       {
//         evaluationId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Evaluation",
//         },
//         evaluatorId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//         },
//         status: {
//           type: String,
//           enum: ["assigned", "in_progress", "completed"],
//           default: "assigned",
//         },
//         assignedAt: {
//           type: Date,
//           default: Date.now,
//         },
//         completedAt: Date,
//         _id: false,
//       },
//     ],
//     // Final evaluation results
//     finalEvaluation: {
//       totalScore: {
//         type: Number,
//         min: 0,
//       },
//       maxScore: {
//         type: Number,
//         min: 1,
//       },
//       averageScore: {
//         type: Number,
//         min: 0,
//       },
//       grade: {
//         type: String,
//         enum: [
//           "A+",
//           "A",
//           "A-",
//           "B+",
//           "B",
//           "B-",
//           "C+",
//           "C",
//           "C-",
//           "D+",
//           "D",
//           "F",
//         ],
//       },
//       evaluationCount: {
//         type: Number,
//         default: 0,
//         min: 0,
//       },
//       consensusReached: {
//         type: Boolean,
//         default: false,
//       },
//       finalizedAt: Date,
//       finalizedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     },
//     // Feedback compilation
//     compiledFeedback: {
//       strengths: [String],
//       improvements: [String],
//       overallComments: String,
//       instructorNotes: String,
//     },
//     // Quality assurance
//     qualityMetrics: {
//       plagiarismCheck: {
//         status: {
//           type: String,
//           enum: ["pending", "checked", "flagged", "cleared"],
//           default: "pending",
//         },
//         score: {
//           type: Number,
//           min: 0,
//           max: 100,
//         },
//         report: String,
//         checkedAt: Date,
//       },
//       wordCount: {
//         type: Number,
//         min: 0,
//       },
//       readabilityScore: {
//         type: Number,
//         min: 0,
//         max: 100,
//       },
//       completenessScore: {
//         type: Number,
//         min: 0,
//         max: 100,
//       },
//     },
//     // Resubmission tracking
//     resubmissionData: {
//       isResubmission: {
//         type: Boolean,
//         default: false,
//       },
//       originalSubmissionId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Submission",
//       },
//       resubmissionCount: {
//         type: Number,
//         default: 0,
//         min: 0,
//       },
//       maxResubmissions: {
//         type: Number,
//         default: 2,
//         min: 0,
//       },
//       resubmissionReason: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Compound indexes for efficient queries
// submissionSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });
// submissionSchema.index({ assignmentId: 1, status: 1 });
// submissionSchema.index({ userId: 1, submittedAt: -1 });
// submissionSchema.index({ status: 1, submittedAt: -1 });

// // Update lastModified on save
// submissionSchema.pre("save", function (next) {
//   this.lastModified = new Date();

//   // Set submittedAt when status changes to submitted
//   if (
//     this.isModified("status") &&
//     this.status === "submitted" &&
//     !this.submittedAt
//   ) {
//     this.submittedAt = new Date();
//   }

//   // Update version on content change
//   if (this.isModified("content") && !this.isNew) {
//     this.version += 1;
//   }

//   next();
// });

// // Virtual for evaluation progress
// submissionSchema.virtual("evaluationProgress").get(function () {
//   if (!this.evaluationAssignments || this.evaluationAssignments.length === 0) {
//     return { completed: 0, total: 0, percentage: 0 };
//   }

//   const total = this.evaluationAssignments.length;
//   const completed = this.evaluationAssignments.filter(
//     (evaluations) => evaluations.status === "completed"
//   ).length;
//   const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

//   return { completed, total, percentage };
// });

// // Virtual for submission score percentage
// submissionSchema.virtual("scorePercentage").get(function () {
//   if (!this.finalEvaluation?.maxScore || this.finalEvaluation.maxScore === 0) {
//     return 0;
//   }
//   return Math.round(
//     (this.finalEvaluation.averageScore / this.finalEvaluation.maxScore) * 100
//   );
// });

// // Virtual for can resubmit
// submissionSchema.virtual("canResubmit").get(function () {
//   if (!this.resubmissionData) return false;
//   return (
//     this.resubmissionData.resubmissionCount <
//     this.resubmissionData.maxResubmissions
//   );
// });

// // Method to update evaluation status
// submissionSchema.methods.updateEvaluationStatus = function (
//   evaluationId,
//   status,
//   completedAt = null
// ) {
//   const evalAssignment = this.evaluationAssignments.find(
//     (evaluations) =>
//       evaluations.evaluationId.toString() === evaluationId.toString()
//   );

//   if (evalAssignment) {
//     evalAssignment.status = status;
//     if (status === "completed" && completedAt) {
//       evalAssignment.completedAt = completedAt;
//     }

//     // Check if all evaluations are completed
//     const allCompleted = this.evaluationAssignments.every(
//       (evaluations) => evaluations.status === "completed"
//     );
//     if (allCompleted && this.status === "under_evaluation") {
//       this.status = "evaluated";
//     }
//   }

//   return this.save();
// };

// // Method to compile final evaluation
// submissionSchema.methods.compileFinalEvaluation = async function () {
//   try {
//     const evaluations = await mongoose.model("Evaluation").find({
//       submissionId: this._id,
//       status: { $in: ["submitted", "reviewed", "finalized"] },
//     });

//     if (evaluations.length === 0) {
//       return null;
//     }

//     // Calculate average scores
//     const totalScore = evaluations.reduce(
//       (sum, evaluations) => sum + evaluations.totalScore,
//       0
//     );
//     const maxScore = evaluations[0].maxTotalScore; // Assuming same max score for all
//     const averageScore = totalScore / evaluations.length;

//     // Determine grade based on average score
//     const percentage = (averageScore / maxScore) * 100;
//     let grade = "F";
//     if (percentage >= 97) grade = "A+";
//     else if (percentage >= 93) grade = "A";
//     else if (percentage >= 90) grade = "A-";
//     else if (percentage >= 87) grade = "B+";
//     else if (percentage >= 83) grade = "B";
//     else if (percentage >= 80) grade = "B-";
//     else if (percentage >= 77) grade = "C+";
//     else if (percentage >= 73) grade = "C";
//     else if (percentage >= 70) grade = "C-";
//     else if (percentage >= 67) grade = "D+";
//     else if (percentage >= 60) grade = "D";

//     // Compile feedback
//     const allFeedback = evaluations
//       .map((evaluations) => evaluations.overallFeedback)
//       .filter(Boolean);
//     const strengths = [];
//     const improvements = [];

//     // Simple keyword analysis for feedback categorization
//     allFeedback.forEach((feedback) => {
//       const lowerFeedback = feedback.toLowerCase();
//       if (
//         lowerFeedback.includes("good") ||
//         lowerFeedback.includes("excellent") ||
//         lowerFeedback.includes("well")
//       ) {
//         strengths.push(feedback);
//       }
//       if (
//         lowerFeedback.includes("improve") ||
//         lowerFeedback.includes("better") ||
//         lowerFeedback.includes("need")
//       ) {
//         improvements.push(feedback);
//       }
//     });

//     // Update final evaluation
//     this.finalEvaluation = {
//       totalScore: totalScore,
//       maxScore: maxScore,
//       averageScore: averageScore,
//       grade: grade,
//       evaluationCount: evaluations.length,
//       consensusReached: true, // Could implement logic to check consensus
//       finalizedAt: new Date(),
//     };

//     this.compiledFeedback = {
//       strengths: strengths,
//       improvements: improvements,
//       overallComments: allFeedback.join("\n\n"),
//     };

//     this.status = "finalized";

//     await this.save();
//     return this.finalEvaluation;
//   } catch (error) {
//     throw new Error(`Failed to compile final evaluation: ${error.message}`);
//   }
// };

// // Static method to trigger evaluation assignments
// submissionSchema.statics.triggerEvaluationAssignment = async function (
//   assignmentId
// ) {
//   try {
//     // Get all submitted submissions for this assignment
//     const submissions = await this.find({
//       assignmentId: assignmentId,
//       status: "submitted",
//     }).populate("userId", "_id userName");

//     if (submissions.length < 2) {
//       throw new Error("Need at least 2 submissions to start peer evaluation");
//     }

//     // Use the graph coloring algorithm from Evaluation model
//     const Evaluation = mongoose.model("Evaluation");
//     const submissionIds = submissions.map((sub) => sub._id);

//     // Calculate due date for evaluations (e.g., 1 week from now)
//     const evaluationDueDate = new Date();
//     evaluationDueDate.setDate(evaluationDueDate.getDate() + 7);

//     // Assign evaluations using graph coloring
//     const evaluatorAssignments =
//       await Evaluation.assignEvaluationsUsingGraphColoring(
//         assignmentId,
//         submissionIds
//       );

//     // Create evaluation records
//     const createdEvaluations =
//       await Evaluation.createEvaluationsFromAssignments(
//         assignmentId,
//         evaluatorAssignments,
//         evaluationDueDate
//       );

//     // Update submissions with evaluation assignments
//     for (const evaluation of createdEvaluations) {
//       await this.findByIdAndUpdate(evaluation.submissionId, {
//         $push: {
//           evaluationAssignments: {
//             evaluationId: evaluation._id,
//             evaluatorId: evaluation.evaluatorId,
//             status: "assigned",
//             assignedAt: new Date(),
//           },
//         },
//         status: "under_evaluation",
//       });
//     }

//     return {
//       success: true,
//       message: `Successfully assigned ${createdEvaluations.length} peer evaluations`,
//       evaluations: createdEvaluations,
//     };
//   } catch (error) {
//     throw new Error(
//       `Failed to trigger evaluation assignment: ${error.message}`
//     );
//   }
// };

// const Submission = mongoose.model("Submission", submissionSchema);

// export default Submission;
