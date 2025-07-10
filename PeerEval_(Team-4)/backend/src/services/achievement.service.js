import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.models.js";
import Achievement from "../models/achievement.models.js";

dotenv.config({ path: "src/.env" });

// Predefined achievement templates for the system
const achievementTemplates = [
  // Milestone Achievements
  {
    title: "Welcome Aboard",
    description: "Completed your profile setup and joined the platform",
    type: "profile_complete",
    category: "milestones",
    icon: "Medal",
    points: 5,
    criteria: { profileComplete: true },
  },
  {
    title: "First Steps",
    description: "Submitted your first assignment",
    type: "first_assignment",
    category: "milestones",
    icon: "ScrollText",
    points: 10,
    criteria: { assignmentCount: 1 },
  },
  {
    title: "Getting Started",
    description: "Completed your first peer evaluation",
    type: "first_evaluation",
    category: "milestones",
    icon: "Users",
    points: 10,
    criteria: { evaluationCount: 1 },
  },

  // Academic Achievements
  {
    title: "Perfectionist",
    description: "Achieved a perfect score on an assignment",
    type: "perfect_score",
    category: "academic",
    icon: "Star",
    points: 25,
    criteria: { minScore: 100 },
  },
  {
    title: "Academic Excellence",
    description: "Maintained an average score above 90%",
    type: "academic_excellence",
    category: "academic",
    icon: "Trophy",
    points: 50,
    criteria: { minScore: 90, assignmentCount: 5 },
  },
  {
    title: "Consistent Performer",
    description: "Submitted 10 assignments with consistent quality",
    type: "consistent_performer",
    category: "academic",
    icon: "BarChart3",
    points: 30,
    criteria: { assignmentCount: 10 },
  },

  // Collaboration Achievements
  {
    title: "Helpful Peer",
    description: "Provided 10 helpful peer evaluations",
    type: "helpful_peer",
    category: "collaboration",
    icon: "Heart",
    points: 30,
    criteria: { evaluationCount: 10 },
  },
  {
    title: "Collaboration Champion",
    description: "Received positive feedback on 20 evaluations",
    type: "collaboration_champion",
    category: "collaboration",
    icon: "Users",
    points: 40,
    criteria: { helpfulEvaluations: 20 },
  },
  {
    title: "Feedback Hero",
    description: "Provided detailed feedback on 25 submissions",
    type: "feedback_hero",
    category: "collaboration",
    icon: "Globe",
    points: 35,
    criteria: { evaluationCount: 25 },
  },

  // Streak Achievements
  {
    title: "Weekly Warrior",
    description: "Active on the platform for 7 consecutive days",
    type: "weekly_warrior",
    category: "milestones",
    icon: "Target",
    points: 20,
    criteria: { streakDays: 7 },
  },
  {
    title: "Monthly Champion",
    description: "Active on the platform for 30 consecutive days",
    type: "monthly_champion",
    category: "milestones",
    icon: "Crown",
    points: 100,
    criteria: { streakDays: 30 },
  },

  // Skill Achievements
  {
    title: "Skill Master",
    description: "Demonstrated proficiency in 5 different skills",
    type: "skill_master",
    category: "skills",
    icon: "Zap",
    points: 40,
    criteria: { skillCount: 5 },
  },

  // Teacher-specific Achievements
  {
    title: "Teaching Debut",
    description: "Created your first assignment",
    type: "first_teacher_assignment",
    category: "teaching",
    icon: "BookOpen",
    points: 15,
    criteria: { assignmentCount: 1 },
  },
  {
    title: "Assignment Creator",
    description: "Created 10 assignments",
    type: "assignment_creator",
    category: "teaching",
    icon: "Zap",
    points: 50,
    criteria: { assignmentCount: 10 },
  },
  {
    title: "Student Mentor",
    description: "Helped 50 students through feedback and guidance",
    type: "student_mentor",
    category: "mentorship",
    icon: "Users",
    points: 75,
    criteria: { studentsHelped: 50 },
  },

  // Admin-specific Achievements
  {
    title: "Platform Guardian",
    description: "Resolved 100 user issues",
    type: "platform_guardian",
    category: "management",
    icon: "Shield",
    points: 100,
    criteria: { issuesResolved: 100 },
  },
  {
    title: "System Excellence",
    description: "Implemented 10 platform improvements",
    type: "system_excellence",
    category: "management",
    icon: "Award",
    points: 150,
    criteria: { systemImprovements: 10 },
  },
];

// Function to seed sample achievements for testing
const seedSampleAchievements = async () => {
  try {
    console.log("🌱 Starting achievement seeding process...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("📊 Connected to MongoDB");

    // Get sample users from each role
    const sampleUsers = await User.aggregate([
      { $sample: { size: 20 } }, // Get 20 random users
      {
        $group: {
          _id: "$userRole",
          users: { $push: "$$ROOT" },
        },
      },
    ]);

    console.log(
      `👥 Found users for seeding:`,
      sampleUsers.map((group) => `${group._id}: ${group.users.length}`)
    );

    let totalAchievementsCreated = 0;

    // Create achievements for each user role
    for (const roleGroup of sampleUsers) {
      const { _id: userRole, users } = roleGroup;

      for (const user of users.slice(0, 5)) {
        // Limit to 5 users per role
        console.log(
          `🏆 Creating achievements for ${userRole}: ${user.userName}`
        );

        // Filter achievements relevant to this user role
        const relevantAchievements = achievementTemplates.filter((template) => {
          if (userRole === "student") {
            return !["teaching", "mentorship", "management"].includes(
              template.category
            );
          } else if (userRole === "teacher") {
            return !["management"].includes(template.category);
          }
          return true; // Admin gets all achievements
        });

        // Randomly assign 3-7 achievements to each user
        const numAchievements = Math.floor(Math.random() * 5) + 3;
        const selectedAchievements = relevantAchievements
          .sort(() => 0.5 - Math.random())
          .slice(0, numAchievements);

        for (const template of selectedAchievements) {
          try {
            // Check if user already has this achievement
            const existingAchievement = await Achievement.findOne({
              userId: user._id,
              type: template.type,
            });

            if (existingAchievement) {
              continue; // Skip if already exists
            }

            // Create achievement with random date in the past 30 days
            const randomDate = new Date();
            randomDate.setDate(
              randomDate.getDate() - Math.floor(Math.random() * 30)
            );

            const achievement = await Achievement.create({
              userId: user._id,
              title: template.title,
              description: template.description,
              type: template.type,
              category: template.category,
              icon: template.icon,
              points: template.points,
              criteria: template.criteria,
              earnedAt: randomDate,
              isVisible: true,
            });

            // Update user's total points and achievement stats
            await User.findByIdAndUpdate(user._id, {
              $inc: {
                totalPoints: template.points,
                "achievementStats.totalAchievements": 1,
                [`achievementStats.categoryCounts.${template.category}`]: 1,
              },
              $set: {
                "achievementStats.lastAchievementDate": randomDate,
              },
            });

            totalAchievementsCreated++;
            console.log(
              `  ✅ Created: ${template.title} (+${template.points} points)`
            );
          } catch (error) {
            console.log(
              `  ❌ Failed to create ${template.title}: ${error.message}`
            );
          }
        }

        // Update user's activity stats with realistic data
        await User.findByIdAndUpdate(user._id, {
          $set: {
            "activityStats.assignmentsSubmitted":
              Math.floor(Math.random() * 15) + 1,
            "activityStats.assignmentsCompleted":
              Math.floor(Math.random() * 10) + 1,
            "activityStats.perfectScores": Math.floor(Math.random() * 3),
            "activityStats.helpfulEvaluations": Math.floor(Math.random() * 20),
            "activityStats.evaluationsGiven":
              Math.floor(Math.random() * 25) + 5,
            "activityStats.consecutiveDaysActive":
              Math.floor(Math.random() * 15) + 1,
            ...(userRole === "teacher" && {
              "activityStats.studentsHelped":
                Math.floor(Math.random() * 30) + 5,
              "activityStats.coursesCreated": Math.floor(Math.random() * 5) + 1,
              "activityStats.assignmentsCreated":
                Math.floor(Math.random() * 20) + 3,
            }),
            ...(userRole === "admin" && {
              "activityStats.usersManaged":
                Math.floor(Math.random() * 100) + 20,
              "activityStats.issuesResolved":
                Math.floor(Math.random() * 50) + 10,
              "activityStats.systemImprovements":
                Math.floor(Math.random() * 8) + 2,
            }),
          },
        });
      }
    }

    console.log(`🎉 Achievement seeding completed!`);
    console.log(`📊 Total achievements created: ${totalAchievementsCreated}`);

    // Display some statistics
    const achievementStats = await Achievement.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalPoints: { $sum: "$points" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    console.log("\n📈 Achievement Distribution:");
    achievementStats.forEach((stat) => {
      console.log(
        `  ${stat._id}: ${stat.count} achievements (${stat.totalPoints} total points)`
      );
    });

    const userPointsStats = await User.aggregate([
      {
        $group: {
          _id: null,
          avgPoints: { $avg: "$totalPoints" },
          maxPoints: { $max: "$totalPoints" },
          minPoints: { $min: "$totalPoints" },
          totalUsers: { $sum: 1 },
        },
      },
    ]);

    if (userPointsStats[0]) {
      console.log("\n👥 User Statistics:");
      console.log(
        `  Average Points: ${Math.round(userPointsStats[0].avgPoints)}`
      );
      console.log(`  Highest Points: ${userPointsStats[0].maxPoints}`);
      console.log(`  Lowest Points: ${userPointsStats[0].minPoints}`);
      console.log(`  Total Users: ${userPointsStats[0].totalUsers}`);
    }
  } catch (error) {
    console.error("❌ Error seeding achievements:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📊 Disconnected from MongoDB");
  }
};

// Function to clean all achievements (for testing)
const cleanAchievements = async () => {
  try {
    console.log("🧹 Cleaning all achievements...");

    await mongoose.connect(process.env.MONGODB_URI);

    // Remove all achievements
    const deleteResult = await Achievement.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} achievements`);

    // Reset user achievement stats
    await User.updateMany(
      {},
      {
        $set: {
          totalPoints: 0,
          achievementLevel: 1,
          "achievementStats.totalAchievements": 0,
          "achievementStats.categoryCounts": {
            academic: 0,
            collaboration: 0,
            milestones: 0,
            skills: 0,
            teaching: 0,
            mentorship: 0,
            management: 0,
            leadership: 0,
          },
          "achievementStats.lastAchievementDate": null,
        },
      }
    );

    console.log("✅ Reset all user achievement stats");
  } catch (error) {
    console.error("❌ Error cleaning achievements:", error);
  } finally {
    await mongoose.disconnect();
  }
};

// Function to create achievement templates (for admin use)
const createAchievementTemplates = async () => {
  try {
    console.log("📋 Creating achievement templates...");

    // This could be used to store achievement templates in a separate collection
    // for dynamic achievement creation by admins

    console.log(
      `📝 Created ${achievementTemplates.length} achievement templates`
    );
    console.log("Templates can be used for:");
    console.log("- Dynamic achievement creation");
    console.log("- Achievement recommendations");
    console.log("- System achievement validation");

    return achievementTemplates;
  } catch (error) {
    console.error("❌ Error creating achievement templates:", error);
  }
};

// Export functions and templates
export {
  seedSampleAchievements,
  cleanAchievements,
  createAchievementTemplates,
  achievementTemplates,
};

// Command line execution
if (process.argv[2] === "seed") {
  seedSampleAchievements();
} else if (process.argv[2] === "clean") {
  cleanAchievements();
} else if (process.argv[2] === "templates") {
  createAchievementTemplates();
} else {
  console.log("Usage:");
  console.log(
    "  node achievementSeeder.js seed     - Seed sample achievements"
  );
  console.log("  node achievementSeeder.js clean    - Clean all achievements");
  console.log(
    "  node achievementSeeder.js templates - Display achievement templates"
  );
}
