import { Router } from "express";
import authRoutes from "./auth.routes.js";
import courseRoutes from "./course.routes.js";
import assignmentRoutes from "./assignment.routes.js";
import evaluationRoutes from "./evaluation.routes.js";
import submissionRoutes from "./submission.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import uploadRoutes from "./upload.routes.js";
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
router.get("/health", (req, res) => {
  res.status(200).json({
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
router.use("/dashboard", dashboardRoutes);
router.use("/upload", uploadRoutes);

// API info route
router.get("/", (req, res) => {
  res.status(200).json({
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
      dashboard: "/api/v1/dashboard",
      upload: "/api/v1/upload",
    },
  });
});

export default router;
