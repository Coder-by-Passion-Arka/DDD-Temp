import { Router } from "express";
import {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  triggerPeerEvaluations,
  getAssignmentSubmissions,
  getAssignmentEvaluationStatus,
} from "../controllers/assignment.controller.js";
import {
  verifyJWT,
  isTeacherOrAdmin,
  validateRequiredFields,
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Assignment CRUD routes
router
  .route("/")
  .get(getAssignments)
  .post(
    isTeacherOrAdmin,
    upload.array("resources", 10),
    validateRequiredFields([
      "title",
      "description",
      "courseId",
      "dueDate",
      "totalPoints",
    ]),
    createAssignment
  );

router
  .route("/:assignmentId")
  .get(getAssignment)
  .patch(upload.array("resources", 10), updateAssignment)
  .delete(deleteAssignment);

// Assignment submission routes
router
  .route("/:assignmentId/submit")
  .post(
    upload.array("attachments", 5),
    validateRequiredFields(["content"]),
    submitAssignment
  );

// Assignment management routes (teachers/admins only)
router
  .route("/:assignmentId/submissions")
  .get(isTeacherOrAdmin, getAssignmentSubmissions);
router
  .route("/:assignmentId/trigger-evaluations")
  .post(isTeacherOrAdmin, triggerPeerEvaluations);
router
  .route("/:assignmentId/evaluation-status")
  .get(isTeacherOrAdmin, getAssignmentEvaluationStatus);

export default router;
