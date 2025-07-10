import { Router } from "express";
import {
  getUserAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievementStats,
  checkAndAwardAchievements, // TODO: Need to use this 
  handleAchievementLeaderboard,
  handleAchievementRecommendations,
  getSystemStats,
} from "../controllers/achievement.controller.js";
import {
  verifyJWT,
  authorizeRoles,
  isTeacherOrAdmin,
  validateRequiredFields,
} from "../middlewares/auth.middleware.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import Achievement from "../models/achievement.models.js";
import User from "../models/user.models.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// ============================================
// Public Achievement Routes (All Users)
// ============================================

// Get current user's achievements with pagination and filtering
router.route("/").get(getUserAchievements);

// Get achievement statistics for current user
router.route("/stats").get(getAchievementStats);

// Get specific achievement (user can only access their own)
router.route("/:achievementId").get(getAchievement);

// Get achievement leaderboard (public)
router.route("/leaderboard").get(handleAchievementLeaderboard);

// ============================================
// Management Routes (Teachers & Admins)
// ============================================

// Award achievement (teachers and admins only)
router
  .route("/award")
  .post(
    isTeacherOrAdmin,
    validateRequiredFields(["title", "description", "type", "category"]), // Essential fields
    createAchievement
  );

// Update specific achievement (teachers and admins only)
router.route("/:achievementId").patch(isTeacherOrAdmin, updateAchievement);

// Delete achievement (admin only)
router
  .route("/:achievementId")
  .delete(authorizeRoles("admin"), deleteAchievement);

// ============================================
// Role-Specific Routes
// ============================================

// Student-specific routes
router
  .route("/student/my-achievements")
  .get(authorizeRoles("student", "teacher", "admin"), getUserAchievements);

router
  .route("/student/recommendations")
  .get(
    authorizeRoles("student", "teacher", "admin"),
    handleAchievementRecommendations
  );

// Teacher-specific routes (Need authentication)

// Award achievement to a student (teachers and admins only)
router.route("/teacher/award-to-student").post(
  authorizeRoles("teacher", "admin"),
  validateRequiredFields([
    "userId", // Student ID is required for teachers
    "title",
    "description",
    "type",
    "category",
  ]),
  async (request, response) => {
    try {
      const { userId, ...achievementData } = request.body;

      // Verify the student exists and is actually a student
      const student = await User.findOne({ _id: userId, userRole: "student" });
      if (!student) {
        throw new ApiError(404, "Student not found");
      }

      // Create achievement for the student
      request.body = { ...achievementData, userId };
      return createAchievement(request, response);
    } catch (error) {
      throw new ApiError(500, "Error awarding achievement to student");
    }
  }
);

// Function to check the achievements of a student (TODO: Need to fix the logic, need to pass the complete array of students in the request body)
router
  .route("/teacher/my-students-achievements")
  .get(authorizeRoles("teacher", "admin"), asyncHandler(async(request, response) => {
    try{
      // Loop through the array of students passed in the request body and check their achievements
      const { students } = request.body;
      const studentAchievements = await Promise.all(students.map(async student => {
        request.body = { user: {userId: student._id} };
        const studentAchievements = getUserAchievements(request);
        return studentAchievements;
      }));

      return response.status(200).json(new ApiResponse(200, studentAchievements));
    }
    catch(error){
      throw new ApiError(500, "Error fetching teacher's students achievements");
    }
    finally{
      return {};
    }
  })
  );
  // async (request, response) => {
  //   try {
  //     const { page = 1, limit = 10, studentId } = request.query;
  //     const skip = (parseInt(page) - 1) * parseInt(limit);

  //     // TODO: Get students taught by this teacher in the particular course
  //     // For now, we'll get all student achievements
  //     const query = studentId ? { userId: studentId } : {};

  //     // Add filter to only show student achievements
  //     const studentIds = await User.find({ userRole: "student" }).select("_id");
  //     query.userId = { $in: studentIds.map((s) => s._id) };

  //     const achievements = await Achievement.find(query)
  //       .populate("userId", "userName userEmail userProfileImage")
  //       .sort({ earnedAt: -1 })
  //       .skip(skip)
  //       .limit(parseInt(limit));

  //     const totalAchievements = await Achievement.countDocuments(query);

  //     return response.status(200).json(
  //       new ApiResponse(
  //         200,
  //         {
  //           achievements,
  //           pagination: {
  //             currentPage: parseInt(page),
  //             totalPages: Math.ceil(totalAchievements / parseInt(limit)),
  //             totalAchievements,
  //             achievementsPerPage: parseInt(limit),
  //           },
  //         },
  //         "Student achievements fetched successfully"
  //       )
  //     );
  //   } catch (error) {
  //     throw new ApiError(500, "Error fetching student achievements");
  //   }
  // };

// Admin-specific routes 
router
  .route("/admin/award-to-user")
  .post(
    authorizeRoles("admin"),
    validateRequiredFields(["title", "description", "type", "category"]),
    createAchievement
  );

router
  .route("/admin/user/:userId/achievements")
  .get(authorizeRoles("admin"), async (request, response) => {
    try {
      const { userId } = request.params;
      const { page = 1, limit = 10 } = request.query; // TODO: Need to view this properly

      // Temporarily set the user ID for the controller
      const originalUserId = request.user._id;
      request.user._id = userId;

      const result = await getUserAchievements(request, response);

      // Restore original user ID
      request.user._id = originalUserId;

      return result;
    } catch (error) {
      throw new ApiError(500, "Error fetching user achievements");
    }
  });

// Bulk award achievements to multiple users (maybe used for course completion)
router.route("/admin/bulk-award").post(
  authorizeRoles("admin"),
  validateRequiredFields([
    "userIds", // Array of user IDs
    "title",
    "description",
    "type",
    "category",
  ]),
  async (request, response) => {
    try {
      const { userIds, ...achievementData } = request.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new ApiError(400, "userIds must be a non-empty array");
      }

      const results = [];

      for (const userId of userIds) {
        try {
          // Verify user exists
          const user = await User.findById(userId);
          if (!user) {
            results.push({ userId, success: false, error: "User not found" });
            continue;
          }

          // Check if user already has this achievement
          const existingAchievement = await Achievement.findOne({
            userId: userId,
            type: achievementData.type,
          });

          if (existingAchievement) {
            results.push({
              userId,
              success: false,
              error: "User already has this achievement",
            });
            continue;
          }

          // Create achievement
          const achievement = await Achievement.create({
            ...achievementData,
            userId,
            earnedAt: new Date(),
          });

          // Update user points and stats
          await User.findByIdAndUpdate(userId, {
            $inc: {
              totalPoints: achievementData.points || 10,
              "achievementStats.totalAchievements": 1,
              [`achievementStats.categoryCounts.${achievementData.category}`]: 1,
            },
            $set: {
              "achievementStats.lastAchievementDate": new Date(),
            },
          });

          results.push({ userId, success: true, achievement });
        } catch (error) {
          results.push({ userId, success: false, error: error.message });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      return response.status(200).json(
        new ApiResponse(
          200,
          {
            results,
            summary: {
              total: userIds.length,
              successful: successCount,
              failed: failureCount,
            },
          },
          `Bulk achievement operation completed: ${successCount} successful, ${failureCount} failed`
        )
      );
    } catch (error) {
      throw new ApiError(500, "Error in bulk achievement operation");
    }
  }
);

// Check the system achievement statistics
router
  .route("/admin/system-stats")
  .get(authorizeRoles("admin"), getSystemStats);

// ============================================
// Utility Routes TODO: Need to shift logic to some other folder
// ============================================

// Get available achievement types and categories
router.route("/metadata").get(async (request, response) => {
  try {
    const userRole = request.user.userRole;

    // Define achievement categories based on user role
    const getAchievementCategories = (role) => {
      const commonCategories = [
        "academic",
        "collaboration",
        "milestones",
        "skills",
      ];

      switch (role) {
        case "teacher":
          return [...commonCategories, "teaching", "mentorship"];
        case "admin":
          return [...commonCategories, "management", "leadership"];
        default:
          return commonCategories;
      }
    };

    // Define achievement types by category
    const achievementTypesByCategory = {
      academic: [
        "perfect_score",
        "academic_excellence",
        "consistent_performer",
        "subject_master",
      ],
      collaboration: [
        "helpful_peer",
        "collaboration_champion",
        "feedback_hero",
        "mentor",
      ],
      milestones: [
        "first_assignment",
        "assignment_streak",
        "weekly_warrior",
        "monthly_champion",
      ],
      skills: ["skill_master", "polyglot", "problem_solver"],
      teaching: [
        "excellent_teacher",
        "student_favorite",
        "innovative_pedagogy",
        "assignment_creator",
      ],
      mentorship: ["student_mentor", "guidance_expert", "career_advisor"],
      management: ["platform_growth", "system_excellence", "user_advocate"],
      leadership: ["team_builder", "strategic_thinker", "community_leader"],
    };

    // Available icons
    const availableIcons = [
      "Medal",
      "ScrollText",
      "Globe",
      "Trophy",
      "Award",
      "Star",
      "Users",
      "BookOpen",
      "Shield",
      "Target",
      "BarChart3",
      "Crown",
      "Zap",
      "Heart",
    ];

    const metadata = {
      categories: getAchievementCategories(userRole),
      typesByCategory: achievementTypesByCategory,
      availableIcons,
      permissions: {
        canCreate: ["teacher", "admin"].includes(userRole),
        canDelete: userRole === "admin",
        canViewAll: ["teacher", "admin"].includes(userRole),
      },
    };

    return response
      .status(200)
      .json(
        new ApiResponse(
          200,
          metadata,
          "Achievement metadata fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching achievement metadata");
  }
});

export default router;
