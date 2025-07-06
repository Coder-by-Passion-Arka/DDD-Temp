import { Router } from "express";
import {
  getUserEvaluations,
  getEvaluation,
  startEvaluation,
  submitEvaluation,
  updateEvaluation,
  getAssignmentEvaluations,
  reassignEvaluation,
  reviewEvaluation,
  getEvaluationStatistics,
} from "../controllers/evaluation.controller.js";
import {
  verifyJWT,
  isTeacherOrAdmin,
  validateRequiredFields,
} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// User evaluation routes
router.route("/user").get(getUserEvaluations);
router.route("/statistics").get(getEvaluationStatistics);

// Individual evaluation routes
router.route("/:evaluationId").get(getEvaluation).patch(updateEvaluation);

router.route("/:evaluationId/start").patch(startEvaluation);
router
  .route("/:evaluationId/submit")
  .patch(
    validateRequiredFields([
      "scores",
      "totalScore",
      "maxTotalScore",
      "overallFeedback",
    ]),
    submitEvaluation
  );

// Instructor/Admin evaluation management routes
router
  .route("/assignment/:assignmentId")
  .get(isTeacherOrAdmin, getAssignmentEvaluations);
router
  .route("/:evaluationId/reassign")
  .patch(
    isTeacherOrAdmin,
    validateRequiredFields(["newEvaluatorId"]),
    reassignEvaluation
  );
router
  .route("/:evaluationId/review")
  .patch(
    isTeacherOrAdmin,
    validateRequiredFields(["approved"]),
    reviewEvaluation
  );

export default router;
