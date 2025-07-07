import ApiError from "../utils/apiError.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

// Verify JWT token and authenticate user
export const verifyJWT = asyncHandler(async (request, response, next) => {
  try {
    const token =
      request.cookies?.accessToken ||
      request.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request - No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.accessToken_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-userPassword -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token - User not found");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account has been deactivated");
    }

    request.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid access token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// Optional authentication - doesn't fail if no token
export const optionalAuth = asyncHandler(async (request, response, next) => {
  try {
    const token =
      request.cookies?.accessToken ||
      request.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decodedToken = jwt.verify(token, process.env.accessToken_SECRET);
      const user = await User.findById(decodedToken?._id).select(
        "-userPassword -refreshToken"
      );

      if (user && user.isActive) {
        request.user = user;
      }
    }
  } catch (error) {
    // Silently ignore authentication errors for optional auth
    console.log("Optional auth failed:", error.message);
  }

  next();
});

// Role-based authorization middleware
export const authorizeRoles = (...roles) => {
  return asyncHandler(async (request, response, next) => {
    if (!request.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!roles.includes(request.user.userRole)) {
      throw new ApiError(
        403,
        `Access denied. Required role: ${roles.join(" or ")}`
      );
    }

    next();
  });
};

// Check if user is admin
export const isAdmin = asyncHandler(async (request, response, next) => {
  if (!request.user) {
    throw new ApiError(401, "Authentication required");
  }

  if (request.user.userRole !== "admin") {
    throw new ApiError(403, "Access denied. Admin privileges required.");
  }

  next();
});

// Check if user is teacher or admin
export const isTeacherOrAdmin = asyncHandler(async (request, response, next) => {
  if (!request.user) {
    throw new ApiError(401, "Authentication required");
  }

  if (!["teacher", "admin"].includes(request.user.userRole)) {
    throw new ApiError(
      403,
      "Access denied. Teacher or Admin privileges required."
    );
  }

  next();
});

// Check if user is student
export const isStudent = asyncHandler(async (request, response, next) => {
  if (!request.user) {
    throw new ApiError(401, "Authentication required");
  }

  if (request.user.userRole !== "student") {
    throw new ApiError(403, "Access denied. Student role required.");
  }

  next();
});

// Validate user ownership or admin access
export const validateOwnershipOrAdmin = (getUserId) => {
  return asyncHandler(async (request, response, next) => {
    if (!request.user) {
      throw new ApiError(401, "Authentication required");
    }

    const userId =
      typeof getUserId === "function" ? getUserId(request) : request.params.userId;

    if (request.user.userRole === "admin" || request.user._id.toString() === userId) {
      return next();
    }

    throw new ApiError(
      403,
      "Access denied. You can only access your own resources."
    );
  });
};

// Rate limiting middleware (basic implementation)
const rateLimitStore = new Map();

export const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = "Too many requests from this IP, please try again later",
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return asyncHandler(async (request, response, next) => {
    const key = request.ip || request.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitStore.get(key);

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    if (record.count >= max) {
      throw new ApiError(429, message);
    }

    record.count++;
    next();
  });
};

// CORS middleware
export const corsMiddleware = (request, response, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://your-frontend-domain.com",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  const origin = request.headers.origin;

  if (allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }

  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

  if (request.method === "OPTIONS") {
    response.status(200).end();
    return;
  }

  next();
};

// Security headers middleware
export const securityHeaders = (request, response, next) => {
  // Prevent clickjacking
  response.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  response.setHeader("X-XSS-Protection", "1; mode=block");

  // Require HTTPS (only in production)
  if (process.env.NODE_ENV === "production") {
    response.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // Content Security Policy (basic)
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;"
  );

  next();
};

// Request logging middleware
export const requestLogger = (request, response, next) => {
  const startTime = Date.now();

  // Log request
  console.log(
    `${new Date().toISOString()} - ${request.method} ${request.originalUrl} - IP: ${
      request.ip
    }`
  );

  // Log response time
  response.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(
      `${new Date().toISOString()} - ${request.method} ${request.originalUrl} - ${
        response.statusCode
      } - ${duration}ms`
    );
  });

  next();
};

// Error handling middleware
export const errorHandler = (err, request, response, next) => {
  let error = err;

  // Log error for debugging
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ApiError(404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ApiError(400, message);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ApiError(400, message);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = new ApiError(401, message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = new ApiError(401, message);
  }

  response.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

// Not found middleware
export const notFound = (request, response, next) => {
  const error = new ApiError(404, `Route ${request.originalUrl} not found`);
  next(error);
};

// File upload size limit middleware
export const fileSizeLimit = (maxSize = 50 * 1024 * 1024) => {
  // 50MB default
  return (request, response, next) => {
    if (
      request.headers["content-length"] &&
      parseInt(request.headers["content-length"]) > maxSize
    ) {
      throw new ApiError(
        413,
        `File size too large. Maximum size allowed: ${Math.round(
          maxSize / 1024 / 1024
        )}MB`
      );
    }
    next();
  };
};

// Validate required fields middleware
export const validateRequiredFields = (fields) => {
  return asyncHandler(async (request, response, next) => 
  {
    const missingFields = fields.filter((field) => 
    {
      const value = request.body[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      throw new ApiError(
        400,
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }

    next();
  });
};

// Sanitize input middleware
export const sanitizeInput = (request, response, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        // Remove potential XSS
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (request.body) sanitize(request.body);
  if (request.query) sanitize(request.query);
  if (request.params) sanitize(request.params);

  next();
};

export default {
  verifyJWT,
  optionalAuth,
  authorizeRoles,
  isAdmin,
  isTeacherOrAdmin,
  isStudent,
  validateOwnershipOrAdmin,
  rateLimit,
  corsMiddleware,
  securityHeaders,
  requestLogger,
  errorHandler,
  notFound,
  fileSizeLimit,
  validateRequiredFields,
  sanitizeInput,
};

// ========================================================================== //

// import jwt from "jsonwebtoken";
// import User from "../models/user.models.js";
// import ApiError from "../utils/apiError.js";
// import asyncHandler from "express-async-handler";

// // Valid user roles
// const VALID_ROLES = ["student", "teacher", "admin"];

// // Role hierarchy - higher roles can access lower role features
// const ROLE_HIERARCHY = {
//   admin: 3,
//   teacher: 2,
//   student: 1,
// };

// /**
//  * Middleware to verify JWT token and attach user to request
//  */
// export const verifyJWT = asyncHandler(async (request, response, next) => {
//   try {
//     const token =
//       request.cookies?.accessToken ||
//       request.header("Authorization")?.replace("Bearer ", "");

//     if (!token) {
//       throw new ApiError(401, "Authentication required. Please login.");
//     }

//     const decodedToken = jwt.verify(token, process.env.accessToken_SECRET);

//     const user = await User.findById(decodedToken?._id).select(
//       "-userPassword -refreshToken"
//     );

//     if (!user) {
//       throw new ApiError(401, "Invalid access token. User not found.");
//     }

//     if (!user.isActive) {
//       throw new ApiError(
//         403,
//         "Your account has been deactivated. Please contact support."
//       );
//     }

//     request.user = user;
//     next();
//   } catch (error) {
//     if (error.name === "JsonWebTokenError") {
//       throw new ApiError(401, "Invalid access token.");
//     } else if (error.name === "TokenExpiredError") {
//       throw new ApiError(401, "Access token has expired. Please login again.");
//     } else {
//       throw error;
//     }
//   }
// });

// /**
//  * Middleware to check if user has required role(s)
//  * @param {...string} allowedRoles - Array of allowed roles
//  */
// export const requireRole = (...allowedRoles) => {
//   return asyncHandler(async (request, response, next) => {
//     if (!request.user) {
//       throw new ApiError(401, "Authentication required.");
//     }

//     const userRole = request.user.userRole;

//     if (!allowedRoles.includes(userRole)) {
//       throw new ApiError(
//         403,
//         `Access denied. Required role: ${allowedRoles.join(
//           " or "
//         )}. Your role: ${userRole}`
//       );
//     }

//     next();
//   });
// };

// /**
//  * Middleware to check if user has minimum role level (hierarchical)
//  * @param {string} minimumRole - Minimum required role level
//  */
// export const requireMinimumRole = (minimumRole) => {
//   return asyncHandler(async (request, response, next) => {
//     if (!request.user) {
//       throw new ApiError(401, "Authentication required.");
//     }

//     const userRole = request.user.userRole;
//     const userLevel = ROLE_HIERARCHY[userRole] || 0;
//     const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

//     if (userLevel < requiredLevel) {
//       throw new ApiError(
//         403,
//         `Access denied. Minimum required role: ${minimumRole}. Your role: ${userRole}`
//       );
//     }

//     next();
//   });
// };

// /**
//  * Middleware to check if user can access specific profile
//  * Users can access their own profile, teachers and admins can access any profile
//  */
// export const canAccessProfile = asyncHandler(async (request, response, next) => {
//   const { userId } = request.params;
//   const requestingUser = request.user;

//   if (!requestingUser) {
//     throw new ApiError(401, "Authentication required.");
//   }

//   // Users can always access their own profile
//   if (userId === requestingUser._id.toString()) {
//     return next();
//   }

//   // Teachers and admins can access any profile
//   if (["teacher", "admin"].includes(requestingUser.userRole)) {
//     return next();
//   }

//   // Students can only access their own profile
//   throw new ApiError(403, "Students can only access their own profile.");
// });

// /**
//  * Middleware to check if user can modify specific resource
//  * @param {string} resourceType - Type of resource (assignment, evaluation, etc.)
//  */
// export const canModifyResource = (resourceType) => {
//   return asyncHandler(async (request, response, next) => {
//     const requestingUser = request.user;

//     if (!requestingUser) {
//       throw new ApiError(401, "Authentication required.");
//     }

//     switch (resourceType) {
//       case "assignment":
//         // Only teachers and admins can create/modify assignments
//         if (["teacher", "admin"].includes(requestingUser.userRole)) {
//           return next();
//         }
//         throw new ApiError(
//           403,
//           "Only teachers and administrators can modify assignments."
//         );

//       case "user":
//         // Only admins can modify user accounts (except own profile)
//         if (requestingUser.userRole === "admin") {
//           return next();
//         }
//         throw new ApiError(
//           403,
//           "Only administrators can modify user accounts."
//         );

//       case "evaluation":
//         // Students can submit evaluations, teachers and admins can grade
//         if (["student", "teacher", "admin"].includes(requestingUser.userRole)) {
//           return next();
//         }
//         throw new ApiError(403, "Invalid role for evaluation operations.");

//       case "system":
//         // Only admins can modify system settings
//         if (requestingUser.userRole === "admin") {
//           return next();
//         }
//         throw new ApiError(
//           403,
//           "Only administrators can modify system settings."
//         );

//       default:
//         throw new ApiError(400, "Invalid resource type specified.");
//     }
//   });
// };

// /**
//  * Middleware to check if user owns the resource or has permission to access it
//  * @param {Function} getResourceOwner - Function to get resource owner ID
//  */
// export const requireOwnershipOrRole = (
//   getResourceOwner,
//   allowedRoles = ["admin"]
// ) => {
//   return asyncHandler(async (request, response, next) => {
//     const requestingUser = request.user;

//     if (!requestingUser) {
//       throw new ApiError(401, "Authentication required.");
//     }

//     // Admins can access everything (unless restricted)
//     if (allowedRoles.includes(requestingUser.userRole)) {
//       return next();
//     }

//     // Check if user owns the resource
//     const resourceOwnerId = await getResourceOwner(request);

//     if (resourceOwnerId === requestingUser._id.toString()) {
//       return next();
//     }

//     throw new ApiError(
//       403,
//       "Access denied. You can only access your own resources."
//     );
//   });
// };

// /**
//  * Middleware to log role-based actions for audit purposes
//  */
// export const auditRoleAction = (action) => {
//   return (request, response, next) => {
//     const user = request.user;

//     if (user) {
//       console.log(
//         `[AUDIT] ${new Date().toISOString()} - User: ${user.userEmail} (${
//           user.userRole
//         }) - Action: ${action} - IP: ${request.ip}`
//       );
//     }

//     next();
//   };
// };

// /**
//  * Middleware to validate role during role changes (admin only)
//  */
// export const validateRoleChange = asyncHandler(async (request, response, next) => {
//   const { userRole } = request.body;
//   const requestingUser = request.user;

//   // Only admins can change roles
//   if (requestingUser.userRole !== "admin") {
//     throw new ApiError(403, "Only administrators can change user roles.");
//   }

//   // Validate the new role
//   if (userRole && !VALID_ROLES.includes(userRole.toLowerCase())) {
//     throw new ApiError(
//       400,
//       "Invalid role. Valid roles are: student, teacher, admin"
//     );
//   }

//   next();
// });

// /**
//  * Middleware to prevent students from accessing teacher/admin routes
//  */
// export const restrictStudentAccess = asyncHandler(async (request, response, next) => {
//   const requestingUser = request.user;

//   if (!requestingUser) {
//     throw new ApiError(401, "Authentication required.");
//   }

//   if (requestingUser.userRole === "student") {
//     throw new ApiError(
//       403,
//       "Students are not authorized to access this resource."
//     );
//   }

//   next();
// });

// /**
//  * Middleware to check API rate limits based on user role
//  */
// export const roleBasedRateLimit = () => {
//   const rateLimits = {
//     student: { requests: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes
//     teacher: { requests: 200, window: 15 * 60 * 1000 }, // 200 requests per 15 minutes
//     admin: { requests: 500, window: 15 * 60 * 1000 }, // 500 requests per 15 minutes
//   };

//   return asyncHandler(async (request, response, next) => {
//     const user = request.user;

//     if (!user) {
//       return next();
//     }

//     const userRole = user.userRole;
//     const limit = rateLimits[userRole] || rateLimits.student;

//     // Simple in-memory rate limiting (in production, use Redis)
//     const key = `${user._id}_${userRole}`;

//     // This is a simplified implementation
//     // In production, implement proper rate limiting with Redis
//     request.rateLimit = {
//       limit: limit.requests,
//       window: limit.window,
//       key: key,
//     };

//     next();
//   });
// };

// /**
//  * Error handling middleware for role-based operations
//  */
// export const handleRoleErrors = (error, request, response, next) => {
//   console.error("Role-based access error:", error);

//   // Handle specific role-related errors
//   if (error.statusCode === 403) {
//     return response.status(403).json({
//       success: false,
//       message: error.message,
//       code: "ACCESS_DENIED",
//       userRole: request.user?.userRole || "unknown",
//       timestamp: new Date().toISOString(),
//     });
//   }

//   if (error.statusCode === 401) {
//     return response.status(401).json({
//       success: false,
//       message: error.message,
//       code: "AUTHENTICATION_REQUIRED",
//       timestamp: new Date().toISOString(),
//     });
//   }

//   // Pass other errors to the default error handler
//   next(error);
// };

// export default {
//   verifyJWT,
//   requireRole,
//   requireMinimumRole,
//   canAccessProfile,
//   canModifyResource,
//   requireOwnershipOrRole,
//   auditRoleAction,
//   validateRoleChange,
//   restrictStudentAccess,
//   roleBasedRateLimit,
//   handleRoleErrors,
//   VALID_ROLES,
//   ROLE_HIERARCHY,
// };
