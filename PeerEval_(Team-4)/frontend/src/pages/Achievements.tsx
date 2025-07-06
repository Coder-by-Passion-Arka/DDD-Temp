// import React from 'react';
// import { motion } from 'framer-motion';
// import { ScrollText, Medal, Globe } from "lucide-react";

// const achievements = [
//   {
//     title: 'Winner - AI Hackathon 2024',
//     description: 'Led a 4-member team to build a chatbot that won 1st prize at national level.',
//     icon: Medal
//   },
//   {
//     title: 'Certificate of Excellence - Java',
//     description: 'Achieved 98% in Oracle Certified Java Programmer Course.',
//     icon: ScrollText
//   },
//   {
//     title: ' Web Dev Star - Bootcamp 2023',
//     description: 'Completed a full-stack bootcamp and built 3 live projects with MERN stack.',
//     icon: Globe
//   },
// ];

// const Achievements: React.FC = () => {
//   return (
//     <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-yellow-50 to-pink-100 dark:bg-gradient-to-br dark:to-pink-500 dark:from-purple-900 min-h-screen rounded-xl">
//       {/* Header */}
//       <div className="mb-6 sm:mb-8 lg:mb-10">
//         <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-pink-700 dark:text-amber-600 mb-2 sm:mb-3">
//           🏆 Achievements
//         </h1>
//         <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 text-center">
//           Celebrate your accomplishments and milestones
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
//         {achievements.map((item, idx) => (
//           <motion.div
//             key={idx}
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: idx * 0.2 }}
//             className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition border border-pink-200 dark:bg-purple-500 dark:border-white dark:hover:shadow-lg dark:hover:shadow-slate-700/50 ease-in-out delay-150 duration-300"
//           >
//             <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
//               <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-purple-600 dark:from-amber-500 dark:to-yellow-600 rounded-xl flex items-center justify-center">
//                 <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2 leading-tight">
//                   {item.title}
//                 </h2>
//               </div>
//             </div>
//             <p className="text-sm sm:text-base text-gray-600 dark:text-amber-300 leading-relaxed">
//               {item.description}
//             </p>
//           </motion.div>
//         ))}
//       </div>

//       {/* Achievement Stats */}
//       <div className="mt-8 sm:mt-12 max-w-4xl mx-auto">
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
//           <div className="bg-white dark:bg-purple-600/50 rounded-xl p-4 sm:p-6 text-center border border-pink-200 dark:border-white/20">
//             <div className="text-2xl sm:text-3xl font-bold text-pink-600 dark:text-amber-400 mb-2">
//               {achievements.length}
//             </div>
//             <div className="text-sm sm:text-base text-gray-600 dark:text-white">
//               Total Achievements
//             </div>
//           </div>
//           <div className="bg-white dark:bg-purple-600/50 rounded-xl p-4 sm:p-6 text-center border border-pink-200 dark:border-white/20">
//             <div className="text-2xl sm:text-3xl font-bold text-pink-600 dark:text-amber-400 mb-2">
//               2024
//             </div>
//             <div className="text-sm sm:text-base text-gray-600 dark:text-white">
//               Latest Achievement
//             </div>
//           </div>
//           <div className="bg-white dark:bg-purple-600/50 rounded-xl p-4 sm:p-6 text-center border border-pink-200 dark:border-white/20">
//             <div className="text-2xl sm:text-3xl font-bold text-pink-600 dark:text-amber-400 mb-2">
//               98%
//             </div>
//             <div className="text-sm sm:text-base text-gray-600 dark:text-white">
//               Highest Score
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Achievements;

// =================================================== //

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ScrollText,
  Medal,
  Globe,
  Loader2,
  Trophy,
  Award,
  Star,
  Users,
  BookOpen,
  Shield,
  Target,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category?: string;
  points?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

const iconMap = {
  Medal,
  ScrollText,
  Globe,
  Trophy,
  Award,
  Star,
  Users,
  BookOpen,
  Shield,
  Target,
  BarChart3,
};

const Achievements: React.FC = () => {
  const { state } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const userRole = state.user?.userRole || "student";

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!state.user) return;

      try {
        setIsLoading(true);

        // Mock achievements based on user role
        let mockAchievements: Achievement[] = [];

        switch (userRole) {
          case "teacher":
            mockAchievements = [
              {
                id: "t1",
                title: "Master Educator",
                description:
                  "Successfully guided 50+ students through course completion",
                icon: "BookOpen",
                earnedAt: "2025-06-15",
                category: "Teaching Excellence",
                points: 100,
                rarity: "epic",
              },
              {
                id: "t2",
                title: "Feedback Champion",
                description: "Provided detailed feedback on 100+ assignments",
                icon: "Star",
                earnedAt: "2025-05-20",
                category: "Student Support",
                points: 75,
                rarity: "rare",
              },
              {
                id: "t3",
                title: "Innovation Leader",
                description: "Created 10+ unique assignment types",
                icon: "Trophy",
                earnedAt: "2025-04-10",
                category: "Innovation",
                points: 150,
                rarity: "legendary",
              },
            ];
            break;

          case "admin":
            mockAchievements = [
              {
                id: "a1",
                title: "System Guardian",
                description: "Maintained 99.9% uptime for 6 months",
                icon: "Shield",
                earnedAt: "2025-06-30",
                category: "System Management",
                points: 200,
                rarity: "legendary",
              },
              {
                id: "a2",
                title: "User Advocate",
                description: "Resolved 500+ user support tickets",
                icon: "Users",
                earnedAt: "2025-05-25",
                category: "User Support",
                points: 120,
                rarity: "epic",
              },
              {
                id: "a3",
                title: "Platform Growth",
                description: "Oversaw platform expansion to 1000+ users",
                icon: "BarChart3",
                earnedAt: "2025-04-15",
                category: "Growth",
                points: 175,
                rarity: "legendary",
              },
            ];
            break;

          default: // student
            mockAchievements = [
              {
                id: "s1",
                title: "First Steps",
                description: "Completed your first assignment submission",
                icon: "Medal",
                earnedAt: "2025-06-01",
                category: "Getting Started",
                points: 25,
                rarity: "common",
              },
              {
                id: "s2",
                title: "Peer Evaluator",
                description:
                  "Completed 10 peer evaluations with quality feedback",
                icon: "Star",
                earnedAt: "2025-06-10",
                category: "Peer Learning",
                points: 50,
                rarity: "rare",
              },
              {
                id: "s3",
                title: "High Achiever",
                description:
                  "Maintained an average score above 90% for a month",
                icon: "Trophy",
                earnedAt: "2025-06-20",
                category: "Academic Excellence",
                points: 100,
                rarity: "epic",
              },
            ];
        }

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        setAchievements(mockAchievements);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setError("Failed to load achievements");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [state.user, userRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading achievements...
          </p>
        </div>
      </div>
    );
  }

  const totalPoints = achievements.reduce(
    (sum, achievement) => sum + (achievement.points || 0),
    0
  );

  const latestAchievement =
    achievements.length > 0
      ? achievements.sort(
          (a, b) =>
            new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
        )[0]
      : null;

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-500 to-orange-600";
      case "epic":
        return "from-purple-500 to-purple-600";
      case "rare":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getRarityBorder = (rarity?: string) => {
    switch (rarity) {
      case "legendary":
        return "border-yellow-400 dark:border-yellow-500";
      case "epic":
        return "border-purple-400 dark:border-purple-500";
      case "rare":
        return "border-blue-400 dark:border-blue-500";
      default:
        return "border-gray-300 dark:border-gray-600";
    }
  };

  const getRoleSpecificTitle = () => {
    switch (userRole) {
      case "teacher":
        return "🏆 Teaching Achievements";
      case "admin":
        return "🛡️ Administrative Achievements";
      default:
        return "🏆 Academic Achievements";
    }
  };

  const getRoleSpecificDescription = () => {
    switch (userRole) {
      case "teacher":
        return "Your teaching milestones, student engagement, and educational excellence";
      case "admin":
        return "System management, platform growth, and administrative excellence";
      default:
        return "Your learning journey, peer contributions, and academic milestones";
    }
  };

  const getRoleGradient = () => {
    switch (userRole) {
      case "teacher":
        return "from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900";
      case "admin":
        return "from-red-50 to-pink-100 dark:from-red-900 dark:to-pink-900";
      default:
        return "from-yellow-50 to-pink-100 dark:from-yellow-900 dark:to-pink-900";
    }
  };

  const getRoleAccentColor = () => {
    switch (userRole) {
      case "teacher":
        return "text-blue-700 dark:text-blue-300";
      case "admin":
        return "text-red-700 dark:text-red-300";
      default:
        return "text-pink-700 dark:text-amber-600";
    }
  };

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 bg-gradient-to-br ${getRoleGradient()} min-h-screen rounded-xl`}
    >
      {/* Header */}
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <h1
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-center ${getRoleAccentColor()} mb-2 sm:mb-3`}
        >
          {getRoleSpecificTitle()}
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 text-center">
          {getRoleSpecificDescription()}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {achievements.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-700 dark:to-yellow-800 rounded-full flex items-center justify-center mb-6">
            <Trophy className="w-12 h-12 text-yellow-600 dark:text-yellow-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Achievements Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {userRole === "teacher"
              ? "Start creating assignments and engaging with students to earn your first achievements!"
              : userRole === "admin"
              ? "Begin managing the platform and supporting users to unlock achievements!"
              : "Start completing assignments and participating in peer evaluations to earn your first achievements!"}
          </p>

          {/* Role-specific achievement categories preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl mx-auto border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Achievement Categories
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userRole === "teacher" ? (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                      <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Teaching Excellence
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Student success rates, course completion, and teaching
                      innovation
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                      <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Student Engagement
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Feedback quality, student mentoring, and community
                      building
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                      <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Innovation
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Creative assignments, new teaching methods, and platform
                      contributions
                    </p>
                  </div>
                </>
              ) : userRole === "admin" ? (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
                      <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      System Management
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Platform stability, security measures, and system
                      optimization
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                      <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      User Support
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Help desk excellence, user satisfaction, and community
                      support
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                      <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Platform Growth
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      User acquisition, feature adoption, and strategic
                      initiatives
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                      <ScrollText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Academic Excellence
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Assignment quality, consistent performance, and subject
                      mastery
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                      <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Peer Collaboration
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quality evaluations, helpful feedback, and community
                      participation
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                      <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Platform Engagement
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Consistent activity, skill development, and goal
                      achievement
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {achievements.map((achievement, idx) => {
            const IconComponent = iconMap[achievement.icon] || Medal;
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.2 }}
                className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition border-2 ${getRarityBorder(
                  achievement.rarity
                )} dark:bg-gray-800 dark:hover:shadow-lg dark:hover:shadow-gray-900/50 ease-in-out delay-150 duration-300`}
              >
                <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${getRarityColor(
                      achievement.rarity
                    )} rounded-xl flex items-center justify-center`}
                  >
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2 leading-tight">
                      {achievement.title}
                    </h2>
                    {achievement.category && (
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                          achievement.rarity === "legendary"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                            : achievement.rarity === "epic"
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                            : achievement.rarity === "rare"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                            : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {achievement.category}
                      </span>
                    )}
                  </div>
                  {achievement.points && (
                    <div className="flex-shrink-0 text-right">
                      <div
                        className={`text-lg font-bold ${
                          achievement.rarity === "legendary"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : achievement.rarity === "epic"
                            ? "text-purple-600 dark:text-purple-400"
                            : achievement.rarity === "rare"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        +{achievement.points}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-300">
                        points
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {achievement.description}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Earned on{" "}
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Achievement Stats */}
      <div className="mt-8 sm:mt-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center border border-gray-200 dark:border-gray-700`}
          >
            <div
              className={`text-2xl sm:text-3xl font-bold mb-2 ${getRoleAccentColor()}`}
            >
              {achievements.length}
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Total Achievements
            </div>
          </div>
          <div
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center border border-gray-200 dark:border-gray-700`}
          >
            <div
              className={`text-2xl sm:text-3xl font-bold mb-2 ${getRoleAccentColor()}`}
            >
              {latestAchievement
                ? new Date(latestAchievement.earnedAt).getFullYear()
                : new Date().getFullYear()}
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Latest Year
            </div>
          </div>
          <div
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center border border-gray-200 dark:border-gray-700`}
          >
            <div
              className={`text-2xl sm:text-3xl font-bold mb-2 ${getRoleAccentColor()}`}
            >
              {totalPoints}
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Total Points
            </div>
          </div>
        </div>
      </div>

      {/* Progress motivation */}
      {achievements.length > 0 && achievements.length < 5 && (
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Keep Going! 🚀
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {userRole === "teacher"
                ? "You're building an impressive teaching portfolio. Continue engaging with students to unlock more achievements!"
                : userRole === "admin"
                ? "Your administrative excellence is showing. Keep managing the platform to earn more recognition!"
                : "You're building an impressive achievement collection. Complete more assignments and engage with peers to unlock even more rewards!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
