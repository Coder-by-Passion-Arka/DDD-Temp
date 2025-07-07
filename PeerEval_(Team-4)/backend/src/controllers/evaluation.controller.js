import Evaluation from "../models/evaluation.models.js";
import Assignment from "../models/assignment.models.js";
import Submission from "../models/submissions.models.js";
import User from "../models/user.models.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import EvaluationAssignmentService from "../services/evaluationAssigner.js";

// Get evaluations for current user (all types)
const getUserEvaluations = asyncHandler(async (req, res) => {
  const { status, type = "all" } = req.query;

  let evaluations = { toEvaluate: [], completed: [], received: [] };

  try {
    // Get evaluations where user is the evaluator (to evaluate)
    const toEvaluateQuery = { evaluatorId: req.user._id };
    if (status) {
      toEvaluateQuery.status = status;
    } else {
      toEvaluateQuery.status = { $in: ["assigned", "in_progress"] };
    }

    const toEvaluate = await Evaluation.find(toEvaluateQuery)
      .populate("assignmentId", "title description subject")
      .populate("submissionId", "content attachments")
      .populate("submitterId", "userName userEmail")
      .sort({ dueDate: 1, assignedAt: -1 });

    // Get evaluations user has completed
    const completedQuery = {
      evaluatorId: req.user._id,
      status: { $in: ["submitted", "reviewed", "finalized"] },
    };
    const completed = await Evaluation.find(completedQuery)
      .populate("assignmentId", "title description subject")
      .populate("submitterId", "userName userEmail")
      .sort({ submittedAt: -1 });

    // Get evaluations of user's submissions (received)
    const receivedQuery = { submitterId: req.user._id };
    if (status) {
      receivedQuery.status = status;
    }

    const received = await Evaluation.find(receivedQuery)
      .populate("assignmentId", "title description subject")
      .populate("evaluatorId", "userName userEmail")
      .sort({ submittedAt: -1, assignedAt: -1 });

    // Filter based on type requested
    if (type === "to_evaluate" || type === "all") {
      evaluations.toEvaluate = toEvaluate;
    }
    if (type === "completed" || type === "all") {
      evaluations.completed = completed;
    }
    if (type === "received" || type === "all") {
      evaluations.received = received;
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          evaluations,
          "User evaluations fetched successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching user evaluations:", error);
    throw new ApiError(500, "Error fetching evaluations");
  }
});

// Get single evaluation by ID
const getEvaluation = asyncHandler(async (req, res) => {
  const { evaluationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(evaluationId)) {
    throw new ApiError(400, "Invalid evaluation ID");
  }

  const evaluation = await Evaluation.findById(evaluationId)
    .populate(
      "assignmentId",
      "title description gradingCriteria peerEvaluationSettings"
    )
    .populate("submissionId", "content attachments userId")
    .populate("submitterId", "userName userEmail")
    .populate("evaluatorId", "userName userEmail");

  if (!evaluation) {
    throw new ApiError(404, "Evaluation not found");
  }

  // Check permissions - user must be evaluator, submitter, or admin/instructor
  const isEvaluator =
    evaluation.evaluatorId._id.toString() === req.user._id.toString();
  const isSubmitter =
    evaluation.submitterId._id.toString() === req.user._id.toString();
  const isAdmin = req.user.userRole === "admin";

  // Check if user is instructor of the course
  const assignment = await Assignment.findById(
    evaluation.assignmentId
  ).populate("courseId");
  const isInstructor =
    assignment &&
    (assignment.createdBy.toString() === req.user._id.toString() ||
      assignment.courseId.instructor.toString() === req.user._id.toString());

  if (!isEvaluator && !isSubmitter && !isAdmin && !isInstructor) {
    throw new ApiError(403, "Access denied to this evaluation");
  }

  // For anonymous evaluations, hide evaluator info from submitter
  let sanitizedEvaluation = evaluation.toObject();
  if (evaluation.isAnonymous && isSubmitter && !isAdmin && !isInstructor) {
    sanitizedEvaluation.evaluatorId = {
      _id: sanitizedEvaluation.evaluatorId._id,
      userName: "Anonymous Peer",
      userEmail: "anonymous@peer.evaluation",
    };
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sanitizedEvaluation,
        "Evaluation fetched successfully"
      )
    );
});

// Start evaluation (mark as in progress)
const startEvaluation = asyncHandler(async (req, res) => {
  const { evaluationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(evaluationId)) {
    throw new ApiError(400, "Invalid evaluation ID");
  }

  const evaluation = await Evaluation.findById(evaluationId);

  if (!evaluation) {
    throw new ApiError(404, "Evaluation not found");
  }

  // Check if user is the assigned evaluator
  if (evaluation.evaluatorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not assigned to this evaluation");
  }

  // Check if evaluation can be started
  if (evaluation.status !== "assigned") {
    throw new ApiError(
      400,
      `Cannot start evaluation with status: ${evaluation.status}`
    );
  }

  // Check if evaluation deadline has passed
  const now = new Date();
  if (now > evaluation.dueDate) {
    throw new ApiError(400, "Evaluation deadline has passed");
  }

  // Update evaluation status
  evaluation.status = "in_progress";
  evaluation.startedAt = now;
  await evaluation.save();

  const updatedEvaluation = await Evaluation.findById(evaluationId)
    .populate("assignmentId", "title description")
    .populate("submissionId", "content attachments")
    .populate("submitterId", "userName userEmail");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedEvaluation, "Evaluation started successfully")
    );
});

// Submit evaluation
const submitEvaluation = asyncHandler(async (req, res) => {
  const { evaluationId } = req.params;
  const { scores, totalScore, maxTotalScore, overallFeedback, grade } =
    req.body;

  if (!mongoose.Types.ObjectId.isValid(evaluationId)) {
    throw new ApiError(400, "Invalid evaluation ID");
  }

  // Validation
  if (!scores || !Array.isArray(scores) || scores.length === 0) {
    throw new ApiError(400, "Evaluation scores are required");
  }

  if (!overallFeedback || overallFeedback.trim().length === 0) {
    throw new ApiError(400, "Overall feedback is required");
  }

  if (typeof totalScore !== "number" || typeof maxTotalScore !== "number") {
    throw new ApiError(400, "Total score and max total score must be numbers");
  }

  const evaluation = await Evaluation.findById(evaluationId);

  if (!evaluation) {
    throw new ApiError(404, "Evaluation not found");
  }

  // Check if user is the assigned evaluator
  if (evaluation.evaluatorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not assigned to this evaluation");
  }

  // Check if evaluation can be submitted
  if (!["assigned", "in_progress"].includes(evaluation.status)) {
    throw new ApiError(
      400,
      `Cannot submit evaluation with status: ${evaluation.status}`
    );
  }

  // Check if evaluation deadline has passed
  const now = new Date();
  if (now > evaluation.dueDate) {
    throw new ApiError(400, "Evaluation deadline has passed");
  }

  // Get assignment to validate scores against criteria
  const assignment = await Assignment.findById(evaluation.assignmentId);
  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  // Validate scores against grading criteria
  if (assignment.gradingCriteria && assignment.gradingCriteria.length > 0) {
    const criteriaNames = assignment.gradingCriteria.map((c) => c.name);
    const submittedCriteriaNames = scores.map((s) => s.criteriaName);

    // Check if all required criteria are evaluated
    const missingCriteria = criteriaNames.filter(
      (name) => !submittedCriteriaNames.includes(name)
    );
    if (missingCriteria.length > 0) {
      throw new ApiError(
        400,
        `Missing evaluation for criteria: ${missingCriteria.join(", ")}`
      );
    }

    // Validate score ranges
    for (const score of scores) {
      const criteria = assignment.gradingCriteria.find(
        (c) => c.name === score.criteriaName
      );
      if (criteria) {
        if (score.score < 0 || score.score > criteria.maxPoints) {
          throw new ApiError(
            400,
            `Score for ${score.criteriaName} must be between 0 and ${criteria.maxPoints}`
          );
        }
        if (score.maxScore !== criteria.maxPoints) {
          throw new ApiError(
            400,
            `Max score for ${score.criteriaName} should be ${criteria.maxPoints}`
          );
        }
      }
    }
  }

  // Validate overall feedback length
  const assignment_settings = assignment.peerEvaluationSettings;
  if (
    assignment_settings.requireEvaluatorComments &&
    assignment_settings.minCommentLength
  ) {
    if (overallFeedback.trim().length < assignment_settings.minCommentLength) {
      throw new ApiError(
        400,
        `Feedback must be at least ${assignment_settings.minCommentLength} characters long`
      );
    }
  }

  // Update evaluation
  evaluation.scores = scores;
  evaluation.totalScore = totalScore;
  evaluation.maxTotalScore = maxTotalScore;
  evaluation.overallFeedback = overallFeedback.trim();
  evaluation.grade = grade;
  evaluation.status = "submitted";
  evaluation.submittedAt = now;

  // Mark as late if submitted after deadline
  if (now > evaluation.dueDate) {
    evaluation.isLate = true;
  }

  await evaluation.save();

  // Update submission evaluation status
  await Submission.findByIdAndUpdate(
    evaluation.submissionId,
    {
      $set: {
        "evaluationAssignments.$[elem].status": "completed",
        "evaluationAssignments.$[elem].completedAt": now,
      },
    },
    {
      arrayFilters: [{ "elem.evaluationId": evaluationId }],
    }
  );

  // Check if all evaluations for this submission are complete
  const allEvaluations = await Evaluation.find({
    submissionId: evaluation.submissionId,
    status: { $in: ["submitted", "reviewed", "finalized"] },
  });

  const totalEvaluationsForSubmission = await Evaluation.countDocuments({
    submissionId: evaluation.submissionId,
  });

  // If all evaluations are complete, compile final evaluation
  if (allEvaluations.length === totalEvaluationsForSubmission) {
    const submission = await Submission.findById(evaluation.submissionId);
    if (submission) {
      try {
        await submission.compileFinalEvaluation();
      } catch (error) {
        console.error("Error compiling final evaluation:", error);
      }
    }
  }

  // Update assignment statistics
  await Assignment.updateAssignmentStatistics(evaluation.assignmentId);

  const updatedEvaluation = await Evaluation.findById(evaluationId)
    .populate("assignmentId", "title description")
    .populate("submitterId", "userName userEmail");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedEvaluation,
        "Evaluation submitted successfully"
      )
    );
});

// Update evaluation (for drafts and in-progress evaluations)
const updateEvaluation = asyncHandler(async (req, res) => {
  const { evaluationId } = req.params;
  const { scores, totalScore, maxTotalScore, overallFeedback, grade } =
    req.body;

  if (!mongoose.Types.ObjectId.isValid(evaluationId)) {
    throw new ApiError(400, "Invalid evaluation ID");
  }

  const evaluation = await Evaluation.findById(evaluationId);

  if (!evaluation) {
    throw new ApiError(404, "Evaluation not found");
  }

  // Check if user is the assigned evaluator
  if (evaluation.evaluatorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not assigned to this evaluation");
  }

  // Check if evaluation can be updated
  if (!["assigned", "in_progress"].includes(evaluation.status)) {
    throw new ApiError(
      400,
      `Cannot update evaluation with status: ${evaluation.status}`
    );
  }

  // Build update object
  const updateFields = {};

  if (scores && Array.isArray(scores)) updateFields.scores = scores;
  if (typeof totalScore === "number") updateFields.totalScore = totalScore;
  if (typeof maxTotalScore === "number")
    updateFields.maxTotalScore = maxTotalScore;
  if (overallFeedback !== undefined)
    updateFields.overallFeedback = overallFeedback.trim();
  if (grade) updateFields.grade = grade;

  // If not started yet, mark as in progress
  if (
    evaluation.status === "assigned" &&
    Object.keys(updateFields).length > 0
  ) {
    updateFields.status = "in_progress";
    updateFields.startedAt = new Date();
  }

  const updatedEvaluation = await Evaluation.findByIdAndUpdate(
    evaluationId,
    { $set: updateFields },
    { new: true, runValidators: true }
  )
    .populate("assignmentId", "title description")
    .populate("submitterId", "userName userEmail");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedEvaluation, "Evaluation updated successfully")
    );
});

// Get evaluations for a specific assignment (instructor view)
const getAssignmentEvaluations = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { status, page = 1, limit = 20 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    throw new ApiError(400, "Invalid assignment ID");
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  // Check permissions
  const isCreator = assignment.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.userRole === "admin";

  // Check if user is course instructor
  const course = await Assignment.findById(assignmentId).populate("courseId");
  const isInstructor =
    course && course.courseId.instructor.toString() === req.user._id.toString();

  if (!isCreator && !isInstructor && !isAdmin) {
    throw new ApiError(403, "Not authorized to view assignment evaluations");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query
  const query = { assignmentId };
  if (status) {
    query.status = status;
  }

  const evaluations = await Evaluation.find(query)
    .populate("evaluatorId", "userName userEmail")
    .populate("submitterId", "userName userEmail")
    .populate("submissionId", "content submittedAt")
    .sort({ submittedAt: -1, assignedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalEvaluations = await Evaluation.countDocuments(query);

  // Get evaluation statistics
  const stats = await Evaluation.aggregate([
    { $match: { assignmentId: mongoose.Types.ObjectId(assignmentId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgScore: { $avg: "$totalScore" },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        evaluations,
        statistics: stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalEvaluations / parseInt(limit)),
          totalEvaluations,
          evaluationsPerPage: parseInt(limit),
        },
      },
      "Assignment evaluations fetched successfully"
    )
  );
});

// Reassign evaluation to different evaluator
const reassignEvaluation = asyncHandler(async (req, res) => {
  const { evaluationId } = req.params;
  const { newEvaluatorId, reason } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(evaluationId) ||
    !mongoose.Types.ObjectId.isValid(newEvaluatorId)
  ) {
    throw new ApiError(400, "Invalid evaluation ID or evaluator ID");
  }

  const evaluation = await Evaluation.findById(evaluationId);
  if (!evaluation) {
    throw new ApiError(404, "Evaluation not found");
  }

  // Check permissions - only assignment creator, course instructor, or admin
  const assignment = await Assignment.findById(
    evaluation.assignmentId
  ).populate("courseId");
  const isCreator = assignment.createdBy.toString() === req.user._id.toString();
  const isInstructor =
    assignment.courseId.instructor.toString() === req.user._id.toString();
  const isAdmin = req.user.userRole === "admin";

  if (!isCreator && !isInstructor && !isAdmin) {
    throw new ApiError(403, "Not authorized to reassign evaluations");
  }

  // Validate new evaluator
  const newEvaluator = await User.findById(newEvaluatorId);
  if (!newEvaluator) {
    throw new ApiError(404, "New evaluator not found");
  }

  if (newEvaluator.userRole !== "student") {
    throw new ApiError(400, "New evaluator must be a student");
  }

  // Use the evaluation assignment service to reassign
  try {
    const reassignedEvaluation =
      await EvaluationAssignmentService.reassignEvaluation(
        evaluationId,
        newEvaluatorId,
        reason || "Reassigned by instructor"
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          reassignedEvaluation,
          "Evaluation reassigned successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

// Mark evaluation as reviewed (instructor action)
const reviewEvaluation = asyncHandler(async (req, res) => {
  const { evaluationId } = req.params;
  const { approved, reviewNotes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(evaluationId)) {
    throw new ApiError(400, "Invalid evaluation ID");
  }

  const evaluation = await Evaluation.findById(evaluationId);
  if (!evaluation) {
    throw new ApiError(404, "Evaluation not found");
  }

  // Check permissions - only assignment creator, course instructor, or admin
  const assignment = await Assignment.findById(
    evaluation.assignmentId
  ).populate("courseId");
  const isCreator = assignment.createdBy.toString() === req.user._id.toString();
  const isInstructor =
    assignment.courseId.instructor.toString() === req.user._id.toString();
  const isAdmin = req.user.userRole === "admin";

  if (!isCreator && !isInstructor && !isAdmin) {
    throw new ApiError(403, "Not authorized to review evaluations");
  }

  // Can only review submitted evaluations
  if (evaluation.status !== "submitted") {
    throw new ApiError(400, "Can only review submitted evaluations");
  }

  // Update evaluation
  evaluation.status = approved ? "reviewed" : "submitted";
  evaluation.reviewedAt = new Date();
  evaluation.qualityFlags.needsReview = !approved;
  evaluation.qualityFlags.reviewNotes = reviewNotes || "";

  await evaluation.save();

  const updatedEvaluation = await Evaluation.findById(evaluationId)
    .populate("assignmentId", "title")
    .populate("evaluatorId", "userName userEmail")
    .populate("submitterId", "userName userEmail");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedEvaluation,
        `Evaluation ${
          approved ? "approved" : "flagged for review"
        } successfully`
      )
    );
});

// Get evaluation assignment statistics for dashboard
const getEvaluationStatistics = asyncHandler(async (req, res) => {
  const { assignmentId } = req.query;

  let query = {};

  // If specific assignment requested, check permissions
  if (assignmentId) {
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw new ApiError(400, "Invalid assignment ID");
    }

    const assignment = await Assignment.findById(assignmentId).populate(
      "courseId"
    );
    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    const isCreator =
      assignment.createdBy.toString() === req.user._id.toString();
    const isInstructor =
      assignment.courseId.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.userRole === "admin";

    if (!isCreator && !isInstructor && !isAdmin) {
      throw new ApiError(403, "Not authorized to view evaluation statistics");
    }

    query.assignmentId = assignmentId;
  } else {
    // Get user's evaluation statistics
    query = {
      $or: [{ evaluatorId: req.user._id }, { submitterId: req.user._id }],
    };
  }

  try {
    const stats = await Evaluation.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgScore: { $avg: "$totalScore" },
          maxScore: { $max: "$totalScore" },
          minScore: { $min: "$totalScore" },
        },
      },
    ]);

    const totalEvaluations = await Evaluation.countDocuments(query);

    // Get user-specific statistics if no assignment specified
    let userStats = {};
    if (!assignmentId) {
      const asEvaluator = await Evaluation.countDocuments({
        evaluatorId: req.user._id,
      });
      const asSubmitter = await Evaluation.countDocuments({
        submitterId: req.user._id,
      });
      const completedAsEvaluator = await Evaluation.countDocuments({
        evaluatorId: req.user._id,
        status: { $in: ["submitted", "reviewed", "finalized"] },
      });

      userStats = {
        assignedToEvaluate: asEvaluator,
        completedEvaluations: completedAsEvaluator,
        submissionsEvaluated: asSubmitter,
        completionRate:
          asEvaluator > 0
            ? Math.round((completedAsEvaluator / asEvaluator) * 100)
            : 0,
      };
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          statusBreakdown: stats,
          totalEvaluations,
          userStatistics: userStats,
        },
        "Evaluation statistics fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching evaluation statistics");
  }
});

export {
  getUserEvaluations,
  getEvaluation,
  startEvaluation,
  submitEvaluation,
  updateEvaluation,
  getAssignmentEvaluations,
  reassignEvaluation,
  reviewEvaluation,
  getEvaluationStatistics,
};
