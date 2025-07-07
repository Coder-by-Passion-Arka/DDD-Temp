import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { handleFirebaseAuth } from "../controllers/firebaseAuth.controller.js";
import {
  refreshAccessToken,
  registerUser,
  logoutUser,
  loginUser,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
} from "../controllers/auth.controller.js";

// Social login controllers
import {
  googleCallback,
  githubCallback
} from "../controllers/socialAuth.controller.js";

const router = Router();

// Middleware to check if user has required role(s)
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
};

// Middleware to check if user can access specific profile
const canAccessProfile = (req, res, next) => {
  const { userId } = req.params;
  const requestingUser = req.user;

  // Users can always access their own profile
  if (userId === requestingUser._id.toString()) {
    return next();
  }

  // Teachers and admins can access any profile
  if (["teacher", "admin"].includes(requestingUser.userRole)) {
    return next();
  }

  // Students can only access their own profile
  return res.status(403).json({
    success: false,
    message: "Students can only access their own profile",
  });
};

// Public routes (Not secured) //

// 1. Register user
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// 2. Login user
router.route("/login").post(loginUser);

// 3. Refresh access token
router.route("/refresh-token").post(refreshAccessToken);

// Firebase Authentication
router.route("/firebase").post(handleFirebaseAuth);

// Firebase Authentication
router.route("/firebase").post(handleFirebaseAuth);


// ============================= //

// Secured Routes (Require authentication) //

// 4. Logout user
router.route("/logout").post(verifyJWT, logoutUser);

// 5. Change password (All authenticated users)
router.route("/change-password").patch(verifyJWT, changePassword);

// 6. Get current user's own profile (without needing userId)
router.route("/me").get(verifyJWT, getCurrentUser);

// 7. Update current user's own profile
router.route("/update-profile").patch(
  verifyJWT,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateAccountDetails
);

// ============================= //

// Role-based Protected Routes //

// 8. Get specific user profile (with role-based access control)
router
  .route("/profile/:userId")
  .get(verifyJWT, canAccessProfile, getCurrentUser);

// 9. Admin-only routes
router.route("/admin/users").get(
  verifyJWT,
  requireRole("admin"),
  // TODO: Add getAllUsers controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: "Admin user management endpoint not implemented yet",
    });
  }
);

router.route("/admin/users/:userId").patch(
  verifyJWT,
  requireRole("admin"),
  // TODO: Add adminUpdateUser controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: "Admin user update endpoint not implemented yet",
    });
  }
);

router.route("/admin/users/:userId/deactivate").patch(
  verifyJWT,
  requireRole("admin"),
  // TODO: Add deactivateUser controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: "User deactivation endpoint not implemented yet",
    });
  }
);

// 10. Teacher-only routes
router.route("/teacher/students").get(
  verifyJWT,
  requireRole("teacher", "admin"),
  // TODO: Add getTeacherStudents controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: "Teacher students endpoint not implemented yet",
    });
  }
);

router.route("/teacher/assignments").post(
  verifyJWT,
  requireRole("teacher", "admin"),
  // TODO: Add createAssignment controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: "Create assignment endpoint not implemented yet",
    });
  }
);

// 11. Student search (Teachers and Admins only)
router.route("/search/students").get(
  verifyJWT,
  requireRole("teacher", "admin"),
  // TODO: Add searchStudents controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: "Student search endpoint not implemented yet",
    });
  }
);

// 12. Role-specific dashboard data
router.route("/dashboard/:role").get(
  verifyJWT,
  (req, res, next) => {
    const { role } = req.params;
    const userRole = req.user.userRole;

    // Users can only access their own role's dashboard
    if (role !== userRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own role's dashboard",
      });
    }

    next();
  },
  // TODO: Add getDashboardData controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: "Dashboard data endpoint not implemented yet",
    });
  }
);

// ============================= //

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error("User routes error:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(error.errors).map((err) => err.message),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate field value entered",
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

export default router;

// ====================================================== //

// import { Router } from "express";
// import {
//   registerUser,
//   loginUser,
//   logoutUser,
//   refreshAccessToken,
//   changeCurrentPassword,
//   getCurrentUser,
//   updateAccountDetails,
//   updateUserAvatar,
//   updateUserCoverImage,
//   getUserProfile,
//   getAllUsers,
//   updateUserStatus,
//   forgotPassword,
//   resetPassword,
// } from "../controllers/auth.controller.js";
// import { verifyJWT, isAdmin, rateLimit, validateRequiredFields } from "../middlewares/auth.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";

// const router = Router();

// // Public routes
// router.route("/register").post(
//   rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }), // 5 requests per 15 minutes
//   upload.fields([
//     { name: "avatar", maxCount: 1 },
//     { name: "coverImage", maxCount: 1 }
//   ]),
//   registerUser
// );

// router.route("/login").post(
//   rateLimit({ max: 10, windowMs: 15 * 60 * 1000 }), // 10 requests per 15 minutes
//   validateRequiredFields(["userEmail", "userPassword"]),
//   loginUser
// );

// router.route("/refresh-token").post(refreshAccessToken);
// router.route("/forgot-password").post(
//   rateLimit({ max: 3, windowMs: 60 * 60 * 1000 }), // 3 requests per hour
//   validateRequiredFields(["userEmail"]),
//   forgotPassword
// );
// router.route("/reset-password").post(
//   rateLimit({ max: 3, windowMs: 60 * 60 * 1000 }), // 3 requests per hour
//   validateRequiredFields(["token", "newPassword"]),
//   resetPassword
// );

// // Public profile routes
// router.route("/profile/:userId").get(getUserProfile);

// // Protected routes
// router.route("/logout").post(verifyJWT, logoutUser);
// router.route("/change-password").post(
//   verifyJWT,
//   validateRequiredFields(["oldPassword", "newPassword"]),
//   changeCurrentPassword
// );

// // User profile routes
// router.route("/profile").get(verifyJWT, getCurrentUser);
// router.route("/profile").patch(verifyJWT, updateAccountDetails);
// router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
// router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// // Admin only routes
// router.route("/users").get(verifyJWT, isAdmin, getAllUsers);
// router.route("/users/:userId/status").patch(verifyJWT, isAdmin, updateUserStatus);

// export default router;
