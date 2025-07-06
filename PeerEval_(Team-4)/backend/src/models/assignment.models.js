// import mongoose from "mongoose";

// const assignmentSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       minlength: 5,
//       maxlength: 100,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//       minlength: 10,
//       maxlength: 2000,
//       trim: true,
//     },
//     instructions: {
//       type: String,
//       maxlength: 5000,
//       trim: true,
//     },
//     points: {
//       type: Number,
//       required: true,
//       min: 0,
//       max: 1000,
//     },
//     courseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Course",
//       required: true,
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // Teacher who created the assignment
//       required: true,
//     },
//     assignedDate: {
//       type: Date,
//       required: true,
//       default: Date.now,
//     },
//     dueDate: {
//       type: Date,
//       required: true,
//     },
//     submissionType: {
//       type: String,
//       enum: ["file", "text", "both"],
//       default: "both",
//     },
//     allowedFileTypes: [
//       {
//         type: String,
//         enum: ["pdf", "doc", "docx", "txt", "jpg", "png", "zip"],
//       },
//     ],
//     maxFileSize: {
//       type: Number, // in MB
//       default: 10,
//       max: 50,
//     },
//     submissions: [
//       {
//         student: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//           required: true,
//         },
//         submissionId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Submission",
//         },
//         submittedOn: {
//           type: Date,
//           default: Date.now,
//         },
//         isLate: {
//           type: Boolean,
//           default: false,
//         },
//         attemptNumber: {
//           type: Number,
//           default: 1,
//           min: 1,
//         },
//       },
//     ],
//     maxAttempts: {
//       type: Number,
//       default: 1,
//       min: 1,
//       max: 5,
//     },
//     isPublished: {
//       type: Boolean,
//       default: false,
//     },
//     allowLateSubmission: {
//       type: Boolean,
//       default: false,
//     },
//     latePenalty: {
//       type: Number, // Percentage penalty per day
//       min: 0,
//       max: 100,
//       default: 0,
//     },
//     rubric: [
//       {
//         criterion: {
//           type: String,
//           required: true,
//           maxlength: 100,
//         },
//         description: {
//           type: String,
//           maxlength: 500,
//         },
//         maxPoints: {
//           type: Number,
//           required: true,
//           min: 1,
//         },
//       },
//     ],
//     attachments: [
//       {
//         fileName: {
//           type: String,
//           required: true,
//         },
//         fileUrl: {
//           type: String,
//           required: true,
//         },
//         fileType: {
//           type: String,
//           required: true,
//         },
//         uploadedAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes for better performance
// // assignmentSchema.index({ courseId: 1 });
// // assignmentSchema.index({ createdBy: 1 });
// assignmentSchema.index({ dueDate: 1 });
// // assignmentSchema.index({ isPublished: 1 });

// // Virtual for submission count
// assignmentSchema.virtual("submissionCount").get(function () {
//   return this.submissions.length;
// });

// // Virtual for checking if assignment is overdue
// assignmentSchema.virtual("isOverdue").get(function () {
//   return new Date() > this.dueDate;
// });

// // Virtual for days remaining
// assignmentSchema.virtual("daysRemaining").get( function () {
//   const now = new Date();
//   const timeDiff = this.dueDate.getTime() - now.getTime();
//   return Math.ceil(timeDiff / (1000 * 3600 * 24));
// });

// // Pre-save middleware to validate due date
// assignmentSchema.pre("save", function (next) {
//   if (this.dueDate <= this.assignedDate) {
//     next(new Error("Due date must be after assigned date"));
//   } else {
//     next();
//   }
// });

// export default mongoose.model("Assignment", assignmentSchema);

// ============================== //

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
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
      trim: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "submitted", "evaluated", "completed"],
      default: "draft",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
        mimetype: String,
      },
    ],
    submissions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        content: String,
        attachments: [
          {
            filename: String,
            url: String,
            size: Number,
            mimetype: String,
          },
        ],
        status: {
          type: String,
          enum: ["submitted", "under_review", "evaluated"],
          default: "submitted",
        },
      },
    ],
    maxScore: {
      type: Number,
      default: 100,
    },
    rubric: {
      criteria: [
        {
          name: String,
          description: String,
          maxPoints: Number,
        },
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
assignmentSchema.index({ assignedBy: 1, createdAt: -1 });
assignmentSchema.index({ assignedTo: 1, dueDate: 1 });
assignmentSchema.index({ status: 1 });

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
