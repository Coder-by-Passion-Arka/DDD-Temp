// import { Router } from "express";
// import {
//   createAssignment,
//   getAssignments,
//   getAssignment,
//   updateAssignment,
//   deleteAssignment,
//   submitAssignment,
//   triggerPeerEvaluations,
//   getAssignmentSubmissions,
//   getAssignmentEvaluationStatus,
// } from "../controllers/assignment.controller.js";
// import {
//   verifyJWT,
//   isTeacherOrAdmin,
//   validateRequiredFields,
// } from "../middlewares/auth.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";

// const router = Router();

// // All routes require authentication
// router.use(verifyJWT);

// // Assignment CRUD routes

// // 1. Get Assisgnments from backend and display them on the frontend
// router
//   .route("/")
//   .get(getAssignments)
//   .post(
//     isTeacherOrAdmin,
//     upload.array("resources", 10),
//     validateRequiredFields([
//       "title",
//       "description",
//       "courseId",
//       "dueDate",
//       "totalPoints",
//     ]),
//     createAssignment
//   );

// // 2. Get a single assignment from backend and display it on the frontend
// router
//   .route("/:assignmentId")
//   .get(getAssignment)
//   .patch(upload.array("resources", 10), updateAssignment)
//   .delete(deleteAssignment);

// // Assignment submission routes
// router
//   .route("/:assignmentId/submit")
//   .post(
//     upload.array("attachments", 5),
//     validateRequiredFields(["content"]),
//     submitAssignment
//   );

// // Assignment management routes (teachers/admins only)
// router
//   .route("/:assignmentId/submissions")
//   .get(isTeacherOrAdmin, getAssignmentSubmissions);
// router
//   .route("/:assignmentId/trigger-evaluations")
//   .post(isTeacherOrAdmin, triggerPeerEvaluations);
// router
//   .route("/:assignmentId/evaluation-status")
//   .get(isTeacherOrAdmin, getAssignmentEvaluationStatus);

// export default router;

// ======================================================================================= // 


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
// 1. Get assignments from backend and display them on the frontend
// 2. Create new assignment (teachers/admins only)
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
// 3. Get a single assignment from backend and display it on the frontend
// 4. Update assignment (creators/instructors/admins only)
// 5. Delete assignment (creators/admins only)
router
  .route("/:assignmentId")
  .get(getAssignment)
  .patch(upload.array("resources", 10), updateAssignment)
  .delete(deleteAssignment);
// Assignment submission routes
// 6. Submit assignment (students only)
router
  .route("/:assignmentId/submit")
  .post(
    upload.array("attachments", 5),
    validateRequiredFields(["content"]),
    submitAssignment
  );
// Assignment management routes (teachers/admins only)
// 7. Get all submissions for an assignment (instructors/admins only)
router
  .route("/:assignmentId/submissions")
  .get(isTeacherOrAdmin, getAssignmentSubmissions);
// 8. Trigger peer evaluation assignment using graph coloring (instructors/admins only)
router
  .route("/:assignmentId/trigger-evaluations")
  .post(isTeacherOrAdmin, triggerPeerEvaluations);
// 9. Get evaluation status and statistics (instructors/admins only)
router
  .route("/:assignmentId/evaluation-status")
  .get(isTeacherOrAdmin, getAssignmentEvaluationStatus);
// Additional helper routes
// 10. Get assignments by course (all authenticated users)
router.route("/course/:courseId").get((req, res, next) => {
  req.query.courseId = req.params.courseId;
  next();
}, getAssignments);
// 11. Get user's assignments with submission status (students)
router.route("/user/my-assignments").get((req, res, next) => {
  // This will be handled by the main getAssignments with user filtering
  next();
}, getAssignments);
// 12. Get assignments ready for evaluation setup (teachers/admins)
router.route("/evaluation/ready").get(
  isTeacherOrAdmin,
  (req, res, next) => {
    req.query.status = "closed";
    next();
  },
  getAssignments
);
export default router;
