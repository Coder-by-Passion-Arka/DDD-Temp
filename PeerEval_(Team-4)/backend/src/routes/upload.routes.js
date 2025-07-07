import { Router } from "express";
import { 
  uploadFile, 
  uploadMultipleFiles,
  deleteFile, 
  getFileInfo,
  uploadAssignmentFile,
  uploadProfileImage,
  getUploadStatistics
} from "../controllers/upload.controller.js";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Apply authentication to all routes
router.use(verifyJWT);

// Single file upload
router.route("/single").post(upload.single("file"), uploadFile);

// Multiple files upload
router.route("/multiple").post(upload.array("files", 10), uploadMultipleFiles);

// Assignment-specific file upload
router.route("/assignment/:assignmentId").post(upload.single("file"), uploadAssignmentFile);

// Profile image upload
router.route("/profile-image").post(upload.single("image"), uploadProfileImage);

// File operations
router.route("/info/:publicId").get(getFileInfo);
router.route("/:publicId").delete(deleteFile);

// Admin-only statistics
router.route("/statistics").get(isAdmin, getUploadStatistics);

// Legacy route for backward compatibility
router.route("/").post(upload.single("file"), uploadFile);

export default router;
