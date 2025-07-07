import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "express-async-handler";

// Valid user roles
const VALID_ROLES = ["student", "teacher", "admin"];

// Role hierarchy - higher roles can access lower role features
const ROLE_HIERARCHY = {
  admin: 3,
  teacher: 2,
  student: 1,
};

/**
 * Middleware to verify JWT token and attach user to request
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Authentication required. Please login.");
    }

    const decodedToken = jwt.verify(token, process.env.accessToken_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-userPassword -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token. User not found.");
    }

    if (!user.isActive) {
      throw new ApiError(
        403,
        "Your account has been deactivated. Please contact support."
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid access token.");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired. Please login again.");
    } else {
      throw error;
    }
  }
});

/**
 * Middleware to check if user has required role(s)
 * @param {...string} allowedRoles - Array of allowed roles
 */
export const requireRole = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    const userRole = req.user.userRole;

    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(
        403,
        `Access denied. Required role: ${allowedRoles.join(
          " or "
        )}. Your role: ${userRole}`
      );
    }

    next();
  });
};

/**
 * Middleware to check if user has minimum role level (hierarchical)
 * @param {string} minimumRole - Minimum required role level
 */
export const requireMinimumRole = (minimumRole) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    const userRole = req.user.userRole;
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      throw new ApiError(
        403,
        `Access denied. Minimum required role: ${minimumRole}. Your role: ${userRole}`
      );
    }

    next();
  });
};

/**
 * Middleware to check if user can access specific profile
 * Users can access their own profile, teachers and admins can access any profile
 */
export const canAccessProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const requestingUser = req.user;

  if (!requestingUser) {
    throw new ApiError(401, "Authentication required.");
  }

  // Users can always access their own profile
  if (userId === requestingUser._id.toString()) {
    return next();
  }

  // Teachers and admins can access any profile
  if (["teacher", "admin"].includes(requestingUser.userRole)) {
    return next();
  }

  // Students can only access their own profile
  throw new ApiError(403, "Students can only access their own profile.");
});

/**
 * Middleware to check if user can modify specific resource
 * @param {string} resourceType - Type of resource (assignment, evaluation, etc.)
 */
export const canModifyResource = (resourceType) => {
  return asyncHandler(async (req, res, next) => {
    const requestingUser = req.user;

    if (!requestingUser) {
      throw new ApiError(401, "Authentication required.");
    }

    switch (resourceType) {
      case "assignment":
        // Only teachers and admins can create/modify assignments
        if (["teacher", "admin"].includes(requestingUser.userRole)) {
          return next();
        }
        throw new ApiError(
          403,
          "Only teachers and administrators can modify assignments."
        );

      case "user":
        // Only admins can modify user accounts (except own profile)
        if (requestingUser.userRole === "admin") {
          return next();
        }
        throw new ApiError(
          403,
          "Only administrators can modify user accounts."
        );

      case "evaluation":
        // Students can submit evaluations, teachers and admins can grade
        if (["student", "teacher", "admin"].includes(requestingUser.userRole)) {
          return next();
        }
        throw new ApiError(403, "Invalid role for evaluation operations.");

      case "system":
        // Only admins can modify system settings
        if (requestingUser.userRole === "admin") {
          return next();
        }
        throw new ApiError(
          403,
          "Only administrators can modify system settings."
        );

      default:
        throw new ApiError(400, "Invalid resource type specified.");
    }
  });
};

/**
 * Middleware to check if user owns the resource or has permission to access it
 * @param {Function} getResourceOwner - Function to get resource owner ID
 */
export const requireOwnershipOrRole = (
  getResourceOwner,
  allowedRoles = ["admin"]
) => {
  return asyncHandler(async (req, res, next) => {
    const requestingUser = req.user;

    if (!requestingUser) {
      throw new ApiError(401, "Authentication required.");
    }

    // Admins can access everything (unless restricted)
    if (allowedRoles.includes(requestingUser.userRole)) {
      return next();
    }

    // Check if user owns the resource
    const resourceOwnerId = await getResourceOwner(req);

    if (resourceOwnerId === requestingUser._id.toString()) {
      return next();
    }

    throw new ApiError(
      403,
      "Access denied. You can only access your own resources."
    );
  });
};

/**
 * Middleware to log role-based actions for audit purposes
 */
export const auditRoleAction = (action) => {
  return (req, res, next) => {
    const user = req.user;

    if (user) {
      console.log(
        `[AUDIT] ${new Date().toISOString()} - User: ${user.userEmail} (${
          user.userRole
        }) - Action: ${action} - IP: ${req.ip}`
      );
    }

    next();
  };
};

/**
 * Middleware to validate role during role changes (admin only)
 */
export const validateRoleChange = asyncHandler(async (req, res, next) => {
  const { userRole } = req.body;
  const requestingUser = req.user;

  // Only admins can change roles
  if (requestingUser.userRole !== "admin") {
    throw new ApiError(403, "Only administrators can change user roles.");
  }

  // Validate the new role
  if (userRole && !VALID_ROLES.includes(userRole.toLowerCase())) {
    throw new ApiError(
      400,
      "Invalid role. Valid roles are: student, teacher, admin"
    );
  }

  next();
});

/**
 * Middleware to prevent students from accessing teacher/admin routes
 */
export const restrictStudentAccess = asyncHandler(async (req, res, next) => {
  const requestingUser = req.user;

  if (!requestingUser) {
    throw new ApiError(401, "Authentication required.");
  }

  if (requestingUser.userRole === "student") {
    throw new ApiError(
      403,
      "Students are not authorized to access this resource."
    );
  }

  next();
});

/**
 * Middleware to check API rate limits based on user role
 */
export const roleBasedRateLimit = () => {
  const rateLimits = {
    student: { requests: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes
    teacher: { requests: 200, window: 15 * 60 * 1000 }, // 200 requests per 15 minutes
    admin: { requests: 500, window: 15 * 60 * 1000 }, // 500 requests per 15 minutes
  };

  return asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
      return next();
    }

    const userRole = user.userRole;
    const limit = rateLimits[userRole] || rateLimits.student;

    // Simple in-memory rate limiting (in production, use Redis)
    const key = `${user._id}_${userRole}`;

    // This is a simplified implementation
    // In production, implement proper rate limiting with Redis
    req.rateLimit = {
      limit: limit.requests,
      window: limit.window,
      key: key,
    };

    next();
  });
};

/**
 * Error handling middleware for role-based operations
 */
export const handleRoleErrors = (error, req, res, next) => {
  console.error("Role-based access error:", error);

  // Handle specific role-related errors
  if (error.statusCode === 403) {
    return res.status(403).json({
      success: false,
      message: error.message,
      code: "ACCESS_DENIED",
      userRole: req.user?.userRole || "unknown",
      timestamp: new Date().toISOString(),
    });
  }

  if (error.statusCode === 401) {
    return res.status(401).json({
      success: false,
      message: error.message,
      code: "AUTHENTICATION_REQUIRED",
      timestamp: new Date().toISOString(),
    });
  }

  // Pass other errors to the default error handler
  next(error);
};

export default {
  verifyJWT,
  requireRole,
  requireMinimumRole,
  canAccessProfile,
  canModifyResource,
  requireOwnershipOrRole,
  auditRoleAction,
  validateRoleChange,
  restrictStudentAccess,
  roleBasedRateLimit,
  handleRoleErrors,
  VALID_ROLES,
  ROLE_HIERARCHY,
};
