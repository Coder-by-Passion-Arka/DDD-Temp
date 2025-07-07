import { Router } from "express";
import {
  createSubmission, // A student can create a submission for a specific assignment
  getSubmission, // Get a single submission status
  getSubmissions, // Get all submissions
  updateSubmission, // Update a submission
  deleteSubmission, // Delete a submission
  submitEvaluation, // Evaluater can submit an evaluation for a specific submission
  getSubmissionStats, // Get submission statistics for an assignment
  getSubmissionsForEvaluation, // An Evaluator can get submissions to evaluate  getSubmissionById,
} from "../controllers/submission.controller.js";
import {
  verifyJWT,
  isTeacherOrAdmin,
  isAdmin,
} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Submission routes
router.route("/").get(getSubmissions);

// 1. Student-only routes (for peer evaluation)

// Submitter Routes
router
  .route("/:submissionId/submissions")
  .post(createSubmission) // A student can create a submission for a specific assignment
  .get(getSubmission)
  .patch(updateSubmission); // A student can update his own submissions if resubmission is allowed
// Evaluator Routes
router
  .route("/:submissionId/evaluations")
  .route(getSubmissionsForEvaluation) // This controller checks if  the Evaluator is different from the submitter
  .post(submitEvaluation); // An evaluator can submit an evaluation for a specific submission

// 2. Teacher-only routes (Protected routes)
if (isTeacherOrAdmin) {
  router.route("/:submissionId/resubmit").post(verifyJWT, updateSubmission);
  router.route("/:submissionId/score").patch(verifyJWT, updateSubmission);
  router.route("/:submissionId/compile").post(verifyJWT, updateSubmission);
  router.route("/:submissionID/delete").delete(verifyJWT, deleteSubmission);
  router.route("/:submissionId/stats").get(getSubmissionStats);
}

// 3. Admin-only routes (Protected routes)
if (isAdmin) {
  router.route("/:submissionId/finalize").post(verifyJWT, updateSubmission);
  // router.route("/:submissionId/compile").post(verifyJWT, updateSubmission);
}

// router.route("/:submissionId/evaluations").get(getSubmissionEvaluations);

export default router;
