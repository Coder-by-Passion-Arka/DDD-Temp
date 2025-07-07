import { Router } from "express";
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getCourseEnrollments,
  getUserCourses,
  updateCourseStatistics,
} from "../controllers/course.controller.js";
import {
  verifyJWT,
  isTeacherOrAdmin,
  validateRequiredFields,
} from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Course CRUD routes
router
  .route("/")
  .get(getCourses)
  .post(
    isTeacherOrAdmin,
    validateRequiredFields(["title", "description", "courseCode"]),
    createCourse
  );

router.route("/my-courses").get(getUserCourses);

router
  .route("/:courseId")
  .get(getCourse)
  .patch(updateCourse)
  .delete(deleteCourse);

// Course enrollment routes
router.route("/:courseId/enroll").post(enrollStudent);
router.route("/:courseId/unenroll").post(unenrollStudent);
router.route("/:courseId/enrollments").get(getCourseEnrollments);

// Course statistics
router
  .route("/:courseId/statistics")
  .patch(isTeacherOrAdmin, updateCourseStatistics);

export default router;
