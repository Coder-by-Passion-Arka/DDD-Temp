// const Submission = require("../models/submissions.models.js");

// /**
//  * Create a new submission
//  * Expected body: { assignmentId, studentId, content, [attachments] }
//  */
// const createSubmission = async (req, res) => {
//   try {
//     const { assignmentId, studentId, content, attachments } = req.body;

//     if (!assignmentId || !studentId || !content) {
//       return res
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
//     res.status(201).json(submission);
//   } catch (error) {
//     console.error("Error creating submission:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// /**
//  * Get all submissions (optionally filter by assignmentId or studentId)
//  * Query params: assignmentId, studentId
//  */
// const getSubmissions = async (req, res) => {
//   try {
//     const { assignmentId, studentId } = req.query;
//     const filter = {};
//     if (assignmentId) filter.assignmentId = assignmentId;
//     if (studentId) filter.studentId = studentId;

//     const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
//     res.json(submissions);
//   } catch (error) {
//     console.error("Error fetching submissions:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// /**
//  * Get a single submission by ID
//  */
// const getSubmissionById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const submission = await Submission.findById(id);
//     if (!submission) {
//       return res.status(404).json({ message: "Submission not found." });
//     }
//     res.json(submission);
//   } catch (error) {
//     console.error("Error fetching submission:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// /**
//  * Update a submission (e.g., resubmit or add attachments)
//  * Only allow updating content or attachments before evaluation
//  */
// const updateSubmission = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { content, attachments } = req.body;

//     const submission = await Submission.findById(id);
//     if (!submission) {
//       return res.status(404).json({ message: "Submission not found." });
//     }

//     if (submission.status === "evaluated") {
//       return res
//         .status(400)
//         .json({ message: "Cannot update an evaluated submission." });
//     }

//     if (content) submission.content = content;
//     if (attachments) submission.attachments = attachments;
//     submission.updatedAt = new Date();

//     await submission.save();
//     res.json(submission);
//   } catch (error) {
//     console.error("Error updating submission:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// /**
//  * Delete a submission (optional, for admin use)
//  */
// const deleteSubmission = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const submission = await Submission.findByIdAndDelete(id);
//     if (!submission) {
//       return res.status(404).json({ message: "Submission not found." });
//     }
//     res.json({ message: "Submission deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting submission:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// ====================================================== //

import Submission from "../models/submissions.models.js";
import Assignment from "../models/assignment.models.js";
import User from "../models/user.models.js";
import mongoose from "mongoose";

/**
 * Create a new submission
 * Expected body: { assignmentId, content, attachments }
 * Student ID extracted from authenticated user
 */
const createSubmission = async (req, res) => {
  try {
    const { assignmentId, content, attachments } = req.body;
    const studentId = req.user.id; // Assuming authentication middleware sets req.user

    // Validate required fields
    if (!assignmentId || !content) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID and content are required.",
      });
    }

    // Validate assignment exists and is active
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    // Check if assignment is still open for submissions
    const now = new Date();
    if (assignment.dueDate && now > assignment.dueDate) {
      return res.status(400).json({
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
      return res.status(400).json({
        success: false,
        message:
          "You have already submitted for this assignment. Use update instead.",
      });
    }

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
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

    res.status(201).json({
      success: true,
      message: "Submission created successfully.",
      data: submission,
    });
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({
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
const getSubmissions = async (req, res) => {
  try {
    const { assignmentId, studentId, status, page = 1, limit = 10 } = req.query;

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

    res.json({
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
    res.status(500).json({
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
const getSubmission = async (req, res) => {
    try {
      const { assignmentId, studentId, status, page = 1, limit = 10 } = req.query;
  
      // Build filter object
      const filter = {};
      if (assignmentId) 
        filter.assignmentId = assignmentId;
      if (studentId) 
        filter.studentId = studentId;
      if (status) 
        filter.status = status;
  
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
  
      res.json({
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
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  };

/**
 * Get submissions for peer evaluation
 * Returns submissions that need to be evaluated by the current user
 */
const getSubmissionsForEvaluation = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const evaluatorId = req.user.id;

    // Get assignment to check evaluation settings
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
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

    res.json({
      success: true,
      data: submissions,
      assignment: {
        title: assignment.title,
        evaluationCriteria: assignment.evaluationCriteria,
      },
    });
  } catch (error) {
    console.error("Error fetching submissions for evaluation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Get a single submission by ID
 */
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID.",
      });
    }

    const submission = await Submission.findById(id)
      .populate("assignmentId", "title description dueDate")
      .populate("studentId", "name email")
      .populate("evaluations.evaluatorId", "name");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    // Check if user has permission to view this submission
    const isOwner = submission.studentId._id.toString() === userId;
    const isInstructor = req.user.role === "instructor";

    if (!isOwner && !isInstructor) {
      // For peer evaluation, only show limited info
      const limitedSubmission = {
        _id: submission._id,
        content: submission.content,
        attachments: submission.attachments,
        submittedAt: submission.submittedAt,
        assignmentId: submission.assignmentId,
      };

      return res.json({
        success: true,
        data: limitedSubmission,
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Update a submission (resubmit or modify)
 * Only allow updates before evaluation or if resubmission is allowed
 */
const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID.",
      });
    }

    const submission = await Submission.findById(id).populate("assignmentId");
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    // Check ownership
    if (submission.studentId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own submissions.",
      });
    }

    // Check if updates are allowed
    if (
      submission.status === "evaluated" &&
      !submission.assignmentId.allowResubmission
    ) {
      return res.status(400).json({
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
      return res.status(400).json({
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

    res.json({
      success: true,
      message: "Submission updated successfully.",
      data: submission,
    });
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Delete a submission (admin/instructor only)
 */
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    // Only allow instructors/admins to delete submissions
    if (userRole !== "instructor" && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to delete submissions.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID.",
      });
    }

    const submission = await Submission.findByIdAndDelete(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    res.json({
      success: true,
      message: "Submission deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Get submission statistics for an assignment
 */
const getSubmissionStats = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({
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

    res.json({
      success: true,
      data: {
        total: totalSubmissions,
        late: lateSubmissions,
        byStatus: stats,
      },
    });
  } catch (error) {
    console.error("Error fetching submission stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Submit evaluation for a submission
 */
const submitEvaluation = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { criteria, overallScore, comments } = req.body;
    const evaluatorId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID.",
      });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    // Check if evaluator is trying to evaluate their own submission
    if (submission.studentId.toString() === evaluatorId) {
      return res.status(400).json({
        success: false,
        message: "Cannot evaluate your own submission.",
      });
    }

    // Check if already evaluated by this user
    const existingEvaluation = submission.evaluations.find(
      (evaluation) => evaluation.evaluatorId.toString() === evaluatorId
    );

    if (existingEvaluation) {
      return res.status(400).json({
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

    res.json({
      success: true,
      message: "Evaluation submitted successfully.",
    });
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export {
  createSubmission,
  getSubmissions,
  getSubmission,
  updateSubmission,
  deleteSubmission,
  submitEvaluation,
  getSubmissionStats,
  getSubmissionsForEvaluation,
  getSubmissionById,
};
