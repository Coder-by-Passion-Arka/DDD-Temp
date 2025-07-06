import Assignment from "../models/assignment.models.js";
import Course from "../models/course.models.js";
import Submission from "../models/submissions.models.js";
import Evaluation from "../models/evaluation.models.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

// Create a new assignment
const createAssignment = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    courseId,
    instructions,
    requirements,
    gradingCriteria,
    totalPoints,
    passingScore,
    dueDate,
    lateSubmissionDeadline,
    submissionSettings,
    peerEvaluationSettings,
    tags,
    metadata,
  } = req.body;

  // Validation
  if (!title || !description || !courseId || !dueDate || !totalPoints) {
    throw new ApiError(
      400,
      "Title, description, course ID, due date, and total points are required"
    );
  }

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid course ID");
  }

  // Check if course exists and user has permission
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const isInstructor = course.instructor.toString() === req.user._id.toString();
  const isCreator = course.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.userRole === "admin";

  if (!isInstructor && !isCreator && !isAdmin) {
    throw new ApiError(
      403,
      "Not authorized to create assignments for this course"
    );
  }

  // Validate dates
  const assignmentDueDate = new Date(dueDate);
  const now = new Date();

  if (assignmentDueDate <= now) {
    throw new ApiError(400, "Due date must be in the future");
  }

  // Validate late submission deadline if provided
  if (lateSubmissionDeadline) {
    const lateDeadline = new Date(lateSubmissionDeadline);
    if (lateDeadline <= assignmentDueDate) {
      throw new ApiError(
        400,
        "Late submission deadline must be after due date"
      );
    }
  }

  // Parse arrays if they come as strings
  let parsedRequirements = requirements;
  let parsedGradingCriteria = gradingCriteria;
  let parsedTags = tags;
  let parsedMetadata = metadata;

  try {
    if (typeof requirements === "string") {
      parsedRequirements = JSON.parse(requirements);
    }
    if (typeof gradingCriteria === "string") {
      parsedGradingCriteria = JSON.parse(gradingCriteria);
    }
    if (typeof tags === "string") {
      parsedTags = JSON.parse(tags);
    }
    if (typeof metadata === "string") {
      parsedMetadata = JSON.parse(metadata);
    }
  } catch (parseError) {
    throw new ApiError(400, "Invalid JSON format in request data");
  }

  // Handle file uploads for resources
  let resources = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const uploadResult = await uploadOnCloudinary(file.path);
        if (uploadResult && uploadResult.url) {
          resources.push({
            title: file.originalname,
            url: uploadResult.url,
            fileType: file.mimetype.split("/")[0], // Get file type (image, video, etc.)
            isRequired: false,
          });
        }
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError);
      }
    }
  }

  // Create assignment
  const assignment = await Assignment.create({
    title: title.trim(),
    description: description.trim(),
    courseId,
    createdBy: req.user._id,
    instructions: instructions?.trim() || "",
    requirements: Array.isArray(parsedRequirements) ? parsedRequirements : [],
    gradingCriteria: Array.isArray(parsedGradingCriteria)
      ? parsedGradingCriteria
      : [],
    totalPoints: parseInt(totalPoints),
    passingScore: passingScore ? parseInt(passingScore) : undefined,
    dueDate: assignmentDueDate,
    lateSubmissionDeadline: lateSubmissionDeadline
      ? new Date(lateSubmissionDeadline)
      : undefined,
    submissionSettings: {
      allowLateSubmission: submissionSettings?.allowLateSubmission || false,
      latePenaltyPerDay: submissionSettings?.latePenaltyPerDay || 0,
      maxSubmissionAttempts: submissionSettings?.maxSubmissionAttempts || 1,
      allowedFileTypes: submissionSettings?.allowedFileTypes || [
        "pdf",
        "doc",
        "docx",
      ],
      maxFileSize: submissionSettings?.maxFileSize || 50 * 1024 * 1024,
      requireTextSubmission:
        submissionSettings?.requireTextSubmission !== false,
      requireFileAttachment: submissionSettings?.requireFileAttachment || false,
      minWordCount: submissionSettings?.minWordCount || 0,
      maxWordCount: submissionSettings?.maxWordCount || 10000,
    },
    peerEvaluationSettings: {
      enabled: peerEvaluationSettings?.enabled || false,
      evaluationsPerSubmission:
        peerEvaluationSettings?.evaluationsPerSubmission || 2,
      maxEvaluationsPerStudent:
        peerEvaluationSettings?.maxEvaluationsPerStudent || 3,
      evaluationDeadline: peerEvaluationSettings?.evaluationDeadline
        ? new Date(peerEvaluationSettings.evaluationDeadline)
        : undefined,
      anonymousEvaluation:
        peerEvaluationSettings?.anonymousEvaluation !== false,
      allowSelfEvaluation: peerEvaluationSettings?.allowSelfEvaluation || false,
      requireEvaluatorComments:
        peerEvaluationSettings?.requireEvaluatorComments !== false,
      minCommentLength: peerEvaluationSettings?.minCommentLength || 50,
    },
    tags: Array.isArray(parsedTags) ? parsedTags : [],
    resources,
    metadata: parsedMetadata || {},
  });

  // Update course assignments array
  await Course.findByIdAndUpdate(courseId, {
    $push: { assignments: assignment._id },
  });

  const createdAssignment = await Assignment.findById(assignment._id)
    .populate("createdBy", "userName userEmail")
    .populate("courseId", "title courseCode");

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdAssignment, "Assignment created successfully")
    );
});

// Get assignments (with filters)
const getAssignments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    courseId,
    status,
    search = "",
    tags = "",
    sortBy = "dueDate",
    sortOrder = "asc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query based on user role and filters
  let query = {};

  // Filter by course access
  if (courseId) {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new ApiError(400, "Invalid course ID");
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    if (!course.canUserAccess(req.user._id, req.user.userRole)) {
      throw new ApiError(403, "Access denied to this course");
    }

    query.courseId = courseId;
  } else {
    // Get assignments from user's courses
    let userCourses = [];

    switch (req.user.userRole) {
      case "admin":
        // Admins can see all assignments
        break;
      case "teacher":
        userCourses = await Course.find({
          $or: [{ instructor: req.user._id }, { createdBy: req.user._id }],
        }).distinct("_id");
        break;
      case "student":
        userCourses = await Course.find({
          "enrolledStudents.student": req.user._id,
          "enrolledStudents.status": "active",
        }).distinct("_id");
        break;
    }

    if (req.user.userRole !== "admin" && userCourses.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { assignments: [], pagination: { totalAssignments: 0 } },
            "No assignments found"
          )
        );
    }

    if (req.user.userRole !== "admin") {
      query.courseId = { $in: userCourses };
    }
  }

  // Apply additional filters
  if (status) {
    query.status = status;
  } else if (req.user.userRole === "student") {
    // Students only see published and active assignments
    query.status = {
      $in: ["published", "active", "closed", "evaluation_phase", "completed"],
    };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (tags) {
    const tagArray = tags.split(",").map((tag) => tag.trim());
    query.tags = { $in: tagArray };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const assignments = await Assignment.find(query)
    .populate("createdBy", "userName userEmail")
    .populate("courseId", "title courseCode")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const totalAssignments = await Assignment.countDocuments(query);

  // For students, add submission status
  let enrichedAssignments = assignments;
  if (req.user.userRole === "student") {
    enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignmentId: assignment._id,
          userId: req.user._id,
        });

        return {
          ...assignment.toObject(),
          userSubmission: submission || null,
        };
      })
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        assignments: enrichedAssignments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAssignments / parseInt(limit)),
          totalAssignments,
          assignmentsPerPage: parseInt(limit),
        },
      },
      "Assignments fetched successfully"
    )
  );
});

// Get single assignment by ID
const getAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    throw new ApiError(400, "Invalid assignment ID");
  }

  const assignment = await Assignment.findById(assignmentId)
    .populate("createdBy", "userName userEmail")
    .populate("courseId", "title courseCode");

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  // Check if user can access this assignment
  if (!assignment.canUserAccess(req.user._id, req.user.userRole)) {
    throw new ApiError(403, "Access denied to this assignment");
  }

  // For students, add submission status and evaluation assignments
  let enrichedAssignment = assignment.toObject();

  if (req.user.userRole === "student") {
    const submission = await Submission.findOne({
      assignmentId: assignment._id,
      userId: req.user._id,
    });

    const evaluations = await Evaluation.find({
      assignmentId: assignment._id,
      evaluatorId: req.user._id,
    })
      .populate("submissionId", "content userId")
      .populate("submitterId", "userName");

    enrichedAssignment.userSubmission = submission || null;
    enrichedAssignment.userEvaluations = evaluations || [];
  }

  // Update assignment statistics
  await Assignment.updateAssignmentStatistics(assignmentId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        enrichedAssignment,
        "Assignment fetched successfully"
      )
    );
});

// Update assignment
const updateAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const {
    title,
    description,
    instructions,
    requirements,
    gradingCriteria,
    totalPoints,
    passingScore,
    dueDate,
    lateSubmissionDeadline,
    submissionSettings,
    peerEvaluationSettings,
    tags,
    metadata,
    status,
  } = req.body;

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
  const course = await Course.findById(assignment.courseId);
  const isInstructor =
    course && course.instructor.toString() === req.user._id.toString();

  if (!isCreator && !isInstructor && !isAdmin) {
    throw new ApiError(403, "Not authorized to update this assignment");
  }

  // Validate dates if being changed
  if (dueDate) {
    const newDueDate = new Date(dueDate);
    const now = new Date();

    if (newDueDate <= now && assignment.status === "draft") {
      throw new ApiError(
        400,
        "Due date must be in the future for draft assignments"
      );
    }

    if (lateSubmissionDeadline) {
      const lateDeadline = new Date(lateSubmissionDeadline);
      if (lateDeadline <= newDueDate) {
        throw new ApiError(
          400,
          "Late submission deadline must be after due date"
        );
      }
    }
  }

  // Parse arrays if they come as strings
  let parsedRequirements = requirements;
  let parsedGradingCriteria = gradingCriteria;
  let parsedTags = tags;
  let parsedMetadata = metadata;

  try {
    if (typeof requirements === "string") {
      parsedRequirements = JSON.parse(requirements);
    }
    if (typeof gradingCriteria === "string") {
      parsedGradingCriteria = JSON.parse(gradingCriteria);
    }
    if (typeof tags === "string") {
      parsedTags = JSON.parse(tags);
    }
    if (typeof metadata === "string") {
      parsedMetadata = JSON.parse(metadata);
    }
  } catch (parseError) {
    throw new ApiError(400, "Invalid JSON format in request data");
  }

  // Build update object
  const updateFields = {};

  if (title) updateFields.title = title.trim();
  if (description) updateFields.description = description.trim();
  if (instructions !== undefined)
    updateFields.instructions = instructions.trim();
  if (Array.isArray(parsedRequirements))
    updateFields.requirements = parsedRequirements;
  if (Array.isArray(parsedGradingCriteria))
    updateFields.gradingCriteria = parsedGradingCriteria;
  if (totalPoints) updateFields.totalPoints = parseInt(totalPoints);
  if (passingScore) updateFields.passingScore = parseInt(passingScore);
  if (dueDate) updateFields.dueDate = new Date(dueDate);
  if (lateSubmissionDeadline)
    updateFields.lateSubmissionDeadline = new Date(lateSubmissionDeadline);
  if (submissionSettings) {
    updateFields.submissionSettings = {
      ...assignment.submissionSettings,
      ...submissionSettings,
    };
  }
  if (peerEvaluationSettings) {
    updateFields.peerEvaluationSettings = {
      ...assignment.peerEvaluationSettings,
      ...peerEvaluationSettings,
    };
  }
  if (Array.isArray(parsedTags)) updateFields.tags = parsedTags;
  if (parsedMetadata)
    updateFields.metadata = { ...assignment.metadata, ...parsedMetadata };
  if (
    status &&
    [
      "draft",
      "published",
      "active",
      "closed",
      "evaluation_phase",
      "completed",
      "archived",
    ].includes(status)
  ) {
    updateFields.status = status;
  }

  const updatedAssignment = await Assignment.findByIdAndUpdate(
    assignmentId,
    { $set: updateFields },
    { new: true, runValidators: true }
  )
    .populate("createdBy", "userName userEmail")
    .populate("courseId", "title courseCode");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedAssignment, "Assignment updated successfully")
    );
});

// Delete assignment
const deleteAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    throw new ApiError(400, "Invalid assignment ID");
  }

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  // Check permissions - only creator or admin can delete
  const isCreator = assignment.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.userRole === "admin";

  if (!isCreator && !isAdmin) {
    throw new ApiError(403, "Not authorized to delete this assignment");
  }

  // Check if assignment has submissions
  const submissionCount = await Submission.countDocuments({ assignmentId });
  if (submissionCount > 0) {
    throw new ApiError(
      400,
      "Cannot delete assignment with existing submissions. Archive it instead."
    );
  }

  // Remove assignment from course
  await Course.findByIdAndUpdate(assignment.courseId, {
    $pull: { assignments: assignmentId },
  });

  await Assignment.findByIdAndDelete(assignmentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Assignment deleted successfully"));
});

// Submit assignment
const submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    throw new ApiError(400, "Invalid assignment ID");
  }

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  // Check if submissions are allowed
  const canSubmit = assignment.canSubmit();
  if (!canSubmit.allowed) {
    throw new ApiError(400, canSubmit.reason);
  }

  // Validate content
  if (!content || content.trim().length === 0) {
    throw new ApiError(400, "Submission content is required");
  }

  if (assignment.submissionSettings.requireTextSubmission) {
    const wordCount = content.trim().split(/\s+/).length;

    if (wordCount < assignment.submissionSettings.minWordCount) {
      throw new ApiError(
        400,
        `Submission must be at least ${assignment.submissionSettings.minWordCount} words`
      );
    }

    if (wordCount > assignment.submissionSettings.maxWordCount) {
      throw new ApiError(
        400,
        `Submission cannot exceed ${assignment.submissionSettings.maxWordCount} words`
      );
    }
  }

  // Check for existing submission
  const existingSubmission = await Submission.findOne({
    assignmentId,
    userId: req.user._id,
  });

  if (existingSubmission) {
    // Check if resubmission is allowed
    if (
      existingSubmission.version >=
      assignment.submissionSettings.maxSubmissionAttempts
    ) {
      throw new ApiError(400, "Maximum submission attempts reached");
    }
  }

  // Handle file attachments
  let attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      // Validate file type
      const fileExtension = file.originalname.split(".").pop().toLowerCase();
      if (
        !assignment.submissionSettings.allowedFileTypes.includes(fileExtension)
      ) {
        throw new ApiError(400, `File type .${fileExtension} is not allowed`);
      }

      // Validate file size
      if (file.size > assignment.submissionSettings.maxFileSize) {
        throw new ApiError(
          400,
          `File ${file.originalname} exceeds maximum size limit`
        );
      }

      try {
        const uploadResult = await uploadOnCloudinary(file.path);
        if (uploadResult && uploadResult.url) {
          attachments.push({
            filename: file.originalname,
            originalName: file.originalname,
            url: uploadResult.url,
            size: file.size,
            mimetype: file.mimetype,
          });
        }
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw new ApiError(500, `Error uploading file: ${file.originalname}`);
      }
    }
  }

  // Check if file attachment is required
  if (
    assignment.submissionSettings.requireFileAttachment &&
    attachments.length === 0
  ) {
    throw new ApiError(400, "File attachment is required for this assignment");
  }

  const submissionData = {
    assignmentId,
    userId: req.user._id,
    content: content.trim(),
    attachments,
    status: "submitted",
    submittedAt: new Date(),
    version: existingSubmission ? existingSubmission.version + 1 : 1,
    isLate: canSubmit.isLate || false,
  };

  let submission;
  if (existingSubmission) {
    // Update existing submission
    submission = await Submission.findByIdAndUpdate(
      existingSubmission._id,
      { $set: submissionData },
      { new: true }
    ).populate("userId", "userName userEmail");
  } else {
    // Create new submission
    submission = await Submission.create(submissionData);
    submission = await Submission.findById(submission._id).populate(
      "userId",
      "userName userEmail"
    );
  }

  // Update assignment statistics
  await Assignment.updateAssignmentStatistics(assignmentId);

  return res
    .status(201)
    .json(
      new ApiResponse(201, submission, "Assignment submitted successfully")
    );
});

// Trigger peer evaluations using graph coloring algorithm
const triggerPeerEvaluations = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { settings = {} } = req.body;

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
  const course = await Course.findById(assignment.courseId);
  const isInstructor =
    course && course.instructor.toString() === req.user._id.toString();

  if (!isCreator && !isInstructor && !isAdmin) {
    throw new ApiError(403, "Not authorized to trigger peer evaluations");
  }

  if (!assignment.peerEvaluationSettings.enabled) {
    throw new ApiError(
      400,
      "Peer evaluation is not enabled for this assignment"
    );
  }

  try {
    const result = await Assignment.triggerPeerEvaluations(
      assignmentId,
      settings
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, result, "Peer evaluations triggered successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Get assignment submissions (for instructors)
const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

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
  const course = await Course.findById(assignment.courseId);
  const isInstructor =
    course && course.instructor.toString() === req.user._id.toString();

  if (!isCreator && !isInstructor && !isAdmin) {
    throw new ApiError(403, "Not authorized to view assignment submissions");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query
  const query = { assignmentId };
  if (status) {
    query.status = status;
  }

  const submissions = await Submission.find(query)
    .populate("userId", "userName userEmail userProfileImage")
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalSubmissions = await Submission.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSubmissions / parseInt(limit)),
          totalSubmissions,
          submissionsPerPage: parseInt(limit),
        },
      },
      "Assignment submissions fetched successfully"
    )
  );
});

// Get assignment evaluation status
const getAssignmentEvaluationStatus = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

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
  const course = await Course.findById(assignment.courseId);
  const isInstructor =
    course && course.instructor.toString() === req.user._id.toString();

  if (!isCreator && !isInstructor && !isAdmin) {
    throw new ApiError(403, "Not authorized to view evaluation status");
  }

  // Import evaluation service
  const EvaluationAssignmentService = (
    await import("../services/evaluation-assignment.service.js")
  ).default;

  try {
    const status =
      await EvaluationAssignmentService.getAssignmentEvaluationStatus(
        assignmentId
      );

    return res
      .status(200)
      .json(
        new ApiResponse(200, status, "Evaluation status fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching evaluation status");
  }
});

export {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  triggerPeerEvaluations,
  getAssignmentSubmissions,
  getAssignmentEvaluationStatus,
};
