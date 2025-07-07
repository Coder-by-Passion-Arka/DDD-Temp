// const Submission = require("../models/submissions.models.js");

// /**
//  * Create a new submission
//  * Expected body: { assignmentId, studentId, content, [attachments] }
//  */
// const createSubmission = async (request, response) => {
//   try {
//     const { assignmentId, studentId, content, attachments } = request.body;

//     if (!assignmentId || !studentId || !content) {
//       return response
//         .status(400)
//         .json({
//           message: "assignmentId, studentId, and content are required.",
//         });
//     }

//     const submission = new Submission({
//       assignmentId,
//       studentId,
//       content,
//       attachments: attachments || [],
//       submittedAt: new Date(),
//       status: "submitted",
//     });

//     await submission.save();
//     response.status(201).json(submission);
//   } catch (error) {
//     console.error("Error creating submission:", error);
//     response.status(500).json({ message: "Internal server error." });
//   }
// };

// /**
//  * Get all submissions (optionally filter by assignmentId or studentId)
//  * Query params: assignmentId, studentId
//  */
// const getSubmissions = async (request, response) => {
//   try {
//     const { assignmentId, studentId } = request.query;
//     const filter = {};
//     if (assignmentId) filter.assignmentId = assignmentId;
//     if (studentId) filter.studentId = studentId;

//     const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
//     response.json(submissions);
//   } catch (error) {
//     console.error("Error fetching submissions:", error);
//     response.status(500).json({ message: "Internal server error." });
//   }
// };

// /**
//  * Get a single submission by ID
//  */
// const getSubmissionById = async (request, response) => {
//   try {
//     const { id } = request.params;
//     const submission = await Submission.findById(id);
//     if (!submission) {
//       return response.status(404).json({ message: "Submission not found." });
//     }
//     response.json(submission);
//   } catch (error) {
//     console.error("Error fetching submission:", error);
//     response.status(500).json({ message: "Internal server error." });
//   }
// };

// /**
//  * Update a submission (e.g., resubmit or add attachments)
//  * Only allow updating content or attachments before evaluation
//  */
// const updateSubmission = async (request, response) => {
//   try {
//     const { id } = request.params;
//     const { content, attachments } = request.body;

//     const submission = await Submission.findById(id);
//     if (!submission) {
//       return response.status(404).json({ message: "Submission not found." });
//     }

//     if (submission.status === "evaluated") {
//       return response
//         .status(400)
//         .json({ message: "Cannot update an evaluated submission." });
//     }

//     if (content) submission.content = content;
//     if (attachments) submission.attachments = attachments;
//     submission.updatedAt = new Date();

//     await submission.save();
//     response.json(submission);
//   } catch (error) {
//     console.error("Error updating submission:", error);
//     response.status(500).json({ message: "Internal server error." });
//   }
// };

// /**
//  * Delete a submission (optional, for admin use)
//  */
// const deleteSubmission = async (request, response) => {
//   try {
//     const { id } = request.params;
//     const submission = await Submission.findByIdAndDelete(id);
//     if (!submission) {
//       return response.status(404).json({ message: "Submission not found." });
//     }
//     response.json({ message: "Submission deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting submission:", error);
//     response.status(500).json({ message: "Internal server error." });
//   }
// };

// ====================================================== //

import Submission from "../models/submissions.models.js";
import Assignment from "../models/assignment.models.js";
import User from "../models/user.models.js";
import mongoose from "mongoose";
import asynchandler from "express-async-handler";

/**
 * Create a new submission
 * Expected body: { assignmentId, content, attachments }
 * Student ID extracted from authenticated user
 */
const createSubmission = async (request, response) => {
  try {
    const { assignmentId, content, attachments } = request.body;
    const studentId = request.user.id; // Assuming authentication middleware sets request.user

    // Validate required fields
    if (!assignmentId || !content) {
      return response.status(400).json({
        success: false,
        message: "Assignment ID and content are required.",
      });
    }

    // Validate assignment exists and is active
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return response.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    // Check if assignment is still open for submissions
    const now = new Date();
    if (assignment.dueDate && now > assignment.dueDate) {
      return response.status(400).json({
        success: false,
        message: "Assignment submission deadline has passed.",
      });
    }

    // Check if student already has a submission for this assignment
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId,
    });

    if (existingSubmission) {
      return response.status(400).json({
        success: false,
        message:
          "You have already submitted for this assignment. Use update instead.",
      });
    }

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) {
      return response.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Create submission
    const submission = new Submission({
      assignmentId,
      studentId,
      studentName: student.name,
      content,
      attachments: attachments || [],
      submittedAt: new Date(),
      status: "submitted",
      isLate: assignment.dueDate && now > assignment.dueDate,
    });

    await submission.save();

    response.status(201).json({
      success: true,
      message: "Submission created successfully.",
      data: submission,
    });
  } catch (error) {
    console.error("Error creating submission:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all submissions with filtering and pagination
 * Query params: assignmentId, studentId, status, page, limit
 */
const getSubmissions = async (request, response) => {
  try {
    const {
      assignmentId,
      studentId,
      status,
      page = 1,
      limit = 10,
    } = request.query;

    // Build filter object
    const filter = {};
    if (assignmentId) filter.assignmentId = assignmentId;
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get submissions with pagination
    const submissions = await Submission.find(filter)
      .populate("assignmentId", "title description dueDate")
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Submission.countDocuments(filter);

    response.json({
      success: true,
      data: submissions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Get one particular submissions with filtering and pagination
 * Query params: assignmentId, studentId, status, page, limit
 */
// TODO: Modify this function to return a single submission
const getSubmission = async (request, response) => {
  try {
    const {
      assignmentId,
      studentId,
      status,
      page = 1,
      limit = 10,
    } = request.query;

    // Build filter object
    const filter = {};
    if (assignmentId) filter.assignmentId = assignmentId;
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get submissions with pagination
    const submissions = await Submission.find(filter)
      .populate("assignmentId", "title description dueDate")
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Submission.countDocuments(filter);

    response.json({
      success: true,
      data: submissions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Get submissions for peer evaluation
 * Returns submissions that need to be evaluated by the current user
 */
const getSubmissionsForEvaluation = async (request, response) => {
  try {
    const { assignmentId } = request.params;
    const evaluatorId = request.user.id;

    // Get assignment to check evaluation settings
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return response.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    // Get submissions excluding the evaluator's own submission
    const submissions = await Submission.find({
      assignmentId,
      studentId: { $ne: evaluatorId },
      status: { $in: ["submitted", "under_evaluation"] },
    })
      .populate("studentId", "name")
      .select("-evaluations") // Exclude evaluations to prevent bias
      .sort({ submittedAt: 1 });

    response.json({
      success: true,
      data: submissions,
      assignment: {
        title: assignment.title,
        evaluationCriteria: assignment.evaluationCriteria,
      },
    });
  } catch (error) {
    console.error("Error fetching submissions for evaluation:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Get a single submission by ID
 */
const getSubmissionById = async (request, response) => {
  try {
    const { id } = request.params;
    const userId = request.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({
        success: false,
        message: "Invalid submission ID.",
      });
    }

    const submission = await Submission.findById(id)
      .populate("assignmentId", "title description dueDate")
      .populate("studentId", "name email")
      .populate("evaluations.evaluatorId", "name");

    if (!submission) {
      return response.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    // Check if user has permission to view this submission
    const isOwner = submission.studentId._id.toString() === userId;
    const isInstructor = request.user.role === "instructor";

    if (!isOwner && !isInstructor) {
      // For peer evaluation, only show limited info
      const limitedSubmission = {
        _id: submission._id,
        content: submission.content,
        attachments: submission.attachments,
        submittedAt: submission.submittedAt,
        assignmentId: submission.assignmentId,
      };

      return response.json({
        success: true,
        data: limitedSubmission,
      });
    }

    response.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Update a submission (resubmit or modify)
 * Only allow updates before evaluation or if resubmission is allowed
 */
const updateSubmission = asynchandler(async (request, response) => {
  try {
    const { id } = request.params;
    const { content, attachments } = request.body;
    const userId = request.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({
        success: false,
        message: "Invalid submission ID.",
      });
    }

    const submission = await Submission.findById(id).populate("assignmentId");
    if (!submission) {
      return response.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    // Check ownership
    if (submission.studentId.toString() !== userId) {
      return response.status(403).json({
        success: false,
        message: "You can only update your own submissions.",
      });
    }

    // Check if updates are allowed
    if (
      submission.status === "evaluated" &&
      !submission.assignmentId.allowResubmission
    ) {
      return response.status(400).json({
        success: false,
        message: "Cannot update an evaluated submission.",
      });
    }

    // Check deadline for updates
    const now = new Date();
    if (
      submission.assignmentId.dueDate &&
      now > submission.assignmentId.dueDate
    ) {
      return response.status(400).json({
        success: false,
        message: "Cannot update submission after deadline.",
      });
    }

    // Update submission
    if (content !== undefined) submission.content = content;
    if (attachments !== undefined) submission.attachments = attachments;
    submission.updatedAt = new Date();

    // Reset status if it was evaluated and resubmission is allowed
    if (
      submission.status === "evaluated" &&
      submission.assignmentId.allowResubmission
    ) {
      submission.status = "resubmitted";
      submission.evaluations = []; // Clear previous evaluations
    }

    await submission.save();

    response.json({
      success: true,
      message: "Submission updated successfully.",
      data: submission,
    });
  } catch (error) {
    console.error("Error updating submission:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

/**
 * Delete a submission (admin/instructor only)
 */
const deleteSubmission = async (request, response) => {
  try {
    const { id } = request.params;
    const userRole = request.user.role;

    // Only allow instructors/admins to delete submissions
    if (userRole !== "instructor" && userRole !== "admin") {
      return response.status(403).json({
        success: false,
        message: "Insufficient permissions to delete submissions.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({
        success: false,
        message: "Invalid submission ID.",
      });
    }

    const submission = await Submission.findByIdAndDelete(id);
    if (!submission) {
      return response.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    response.json({
      success: true,
      message: "Submission deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting submission:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Get submission statistics for an assignment
 */
const getSubmissionStats = async (request, response) => {
  try {
    const { assignmentId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const stats = await Submission.aggregate([
      { $match: { assignmentId: mongoose.Types.ObjectId(assignmentId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSubmissions = await Submission.countDocuments({ assignmentId });
    const lateSubmissions = await Submission.countDocuments({
      assignmentId,
      isLate: true,
    });

    response.json({
      success: true,
      data: {
        total: totalSubmissions,
        late: lateSubmissions,
        byStatus: stats,
      },
    });
  } catch (error) {
    console.error("Error fetching submission stats:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Submit evaluation for a submission
 */
const submitEvaluation = async (request, response) => {
  try {
    const { submissionId } = request.params;
    const { criteria, overallScore, comments } = request.body;
    const evaluatorId = request.user.id;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid submission ID.",
      });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return response.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    // Check if evaluator is trying to evaluate their own submission
    if (submission.studentId.toString() === evaluatorId) {
      return response.status(400).json({
        success: false,
        message: "Cannot evaluate your own submission.",
      });
    }

    // Check if already evaluated by this user
    const existingEvaluation = submission.evaluations.find(
      (evaluation) => evaluation.evaluatorId.toString() === evaluatorId
    );

    if (existingEvaluation) {
      return response.status(400).json({
        success: false,
        message: "You have already evaluated this submission.",
      });
    }

    // Add evaluation
    submission.evaluations.push({
      evaluatorId,
      criteria,
      overallScore,
      comments,
      evaluatedAt: new Date(),
    });

    // Update submission status
    if (submission.status === "submitted") {
      submission.status = "under_evaluation";
    }

    await submission.save();

    response.json({
      success: true,
      message: "Evaluation submitted successfully.",
    });
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export {
  createSubmission, // A student can create a submission for a specific assignment
  getSubmission, // A student can get a single submission for a specific assignment
  getSubmissions, // A student can get all submissions for a specific assignment
  updateSubmission, // A student can update his own submissions if resubmission is allowed
  deleteSubmission, // A student can delete his own submissions
  submitEvaluation, // An evaluator can submit an evaluation for a specific submission
  getSubmissionStats, // Get submission statistics for an assignment
  getSubmissionsForEvaluation, // An Evaluator can get submissions to evaluate  getSubmissionById,
};
