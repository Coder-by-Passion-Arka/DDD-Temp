import { Router } from "express";
import authRoutes from "./auth.route.js";
import courseRoutes from "./course.route.js";
import assignmentRoutes from "./assignment.route.js";
import evaluationRoutes from "./evaluation.route.js";
import submissionRoutes from "./submission.route.js";
import achievementRoutes from "./achievement.route.js";
import dailyActivityRoutes from "./dailyActivity.route.js";
import leaderboardRoutes from "./leaderboard.route.js";
import preferencesRoutes from "./preferences.route.js";
// import dashboardRoutes from "./dashboard.routes.js";
import uploadRoutes from "./upload.route.js";
import {
  corsMiddleware,
  securityHeaders,
  requestLogger,
  sanitizeInput,
} from "../middlewares/auth.middleware.js";

const router = Router();

// Apply global middleware
router.use(corsMiddleware);
router.use(securityHeaders);
router.use(requestLogger);
router.use(sanitizeInput);

// Health check route
router.get("/health", (request, response) => {
  response.status(200).json({
    success: true,
    message: "Server is running properly",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/assignments", assignmentRoutes);
router.use("/evaluations", evaluationRoutes);
router.use("/submissions", submissionRoutes);
router.use("/achievements", achievementRoutes);
router.use("/dailyActivities", dailyActivityRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/preferences", preferencesRoutes);
//router.use("/dashboard", dashboardRoutes);
router.use("/upload", uploadRoutes);

// API info route
router.get("/", (request, response) => {
  response.status(200).json({
    success: true,
    message: "Peer Evaluation Platform API",
    version: "1.0.0",
    documentation: "/api/docs",
    endpoints: {
      auth: "/api/v1/auth",
      courses: "/api/v1/courses",
      assignments: "/api/v1/assignments",
      evaluations: "/api/v1/evaluations",
      submissions: "/api/v1/submissions",
      achievements: "/api/v1/achievements",
      preferences: "/api/v1//preferences",
      //dashboard: "/api/v1/dashboard",
      upload: "/api/v1/upload",
    },
  });
});

export default router;
