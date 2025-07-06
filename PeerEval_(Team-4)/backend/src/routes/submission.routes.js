import { Router } from "express";
import {
  getSubmissions,
  getSubmission,
  updateSubmission,
  deleteSubmission,
  getSubmissionEvaluations,
} from "../controllers/submission.controller.js";
import { verifyJWT, isTeacherOrAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Submission routes
router.route("/").get(getSubmissions);
router
  .route("/:submissionId")
  .get(getSubmission)
  .patch(updateSubmission)
  .delete(deleteSubmission);

router.route("/:submissionId/evaluations").get(getSubmissionEvaluations);

export default router;
