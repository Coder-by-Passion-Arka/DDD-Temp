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

import React, { useState, useEffect, useCallback } from "react";
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
  Plus,
  Edit,
  Trash2,
  Crown,
  Zap,
  Heart,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  // achievementApi,
  Achievement,
  AchievementsResponse,
  AchievementStats,
  CreateAchievementData,
} from "../services/achievements.api";
import achievementApi from "../services/achievements.api";

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
  Crown,
  Zap,
  Heart,
};

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAchievementData) => void;
  userRole: string;
  isLoading: boolean;
}

const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userRole,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateAchievementData>({
    title: "",
    description: "",
    type: "",
    category: "academic",
    icon: "Medal",
    points: 10,
    userId: "",
  });

  const categories = achievementApi.getAchievementCategories(userRole);
  const icons = Object.keys(iconMap);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Award Achievement
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {userRole === "teacher" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student ID (required for teachers)
                </label>
                <input
                  type="text"
                  value={formData.userId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required={userRole === "teacher"}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  {icons.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., first_assignment"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Award Achievement</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Achievements: React.FC = () => {
  const { state } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAwardingAchievement, setIsAwardingAchievement] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const userRole = state.user?.userRole || "student";
  const canManageAchievements = achievementApi.canManageAchievements(userRole);
  const canDeleteAchievements = achievementApi.canDeleteAchievements(userRole);

  // Fetch achievements from backend
  const fetchAchievements = useCallback(async () => {
    if (!state.user) return;

    try {
      setIsLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: 12,
        ...(selectedCategory && { category: selectedCategory }),
      };

      const response: AchievementsResponse =
        await achievementApi.getUserAchievements(params);
      setAchievements(response.achievements);
      setTotalPages(response.pagination.totalPages);

      // Also fetch stats
      const statsResponse = await achievementApi.getAchievementStats();
      setStats(statsResponse);
    } catch (error: any) {
      console.error("Error fetching achievements:", error);
      setError(error.message || "Failed to load achievements");
    } finally {
      setIsLoading(false);
    }
  }, [state.user, currentPage, selectedCategory]);

  // Award achievement
  const handleAwardAchievement = async (data: CreateAchievementData) => {
    try {
      setIsAwardingAchievement(true);

      let newAchievement: Achievement;

      if (userRole === "teacher") {
        newAchievement = await achievementApi.teacherAwardAchievement(
          data as CreateAchievementData & { userId: string }
        );
      } else if (userRole === "admin") {
        newAchievement = await achievementApi.adminAwardAchievement(data);
      } else {
        newAchievement = await achievementApi.createAchievement(data);
      }

      // Refresh achievements list
      await fetchAchievements();
      setShowAwardModal(false);
    } catch (error: any) {
      console.error("Error awarding achievement:", error);
      setError(error.message || "Failed to award achievement");
    } finally {
      setIsAwardingAchievement(false);
    }
  };

  // Delete achievement
  const handleDeleteAchievement = async (achievementId: string) => {
    if (!canDeleteAchievements) return;

    if (!confirm("Are you sure you want to delete this achievement?")) return;

    try {
      await achievementApi.deleteAchievement(achievementId);
      await fetchAchievements(); // Refresh list
    } catch (error: any) {
      console.error("Error deleting achievement:", error);
      setError(error.message || "Failed to delete achievement");
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

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
        return "🎓 Teaching Achievements";
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

  if (isLoading && achievements.length === 0) {
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

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 bg-gradient-to-br ${getRoleGradient()} min-h-screen rounded-xl`}
    >
      {/* Header */}
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${getRoleAccentColor()}`}
            >
              {getRoleSpecificTitle()}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
              {getRoleSpecificDescription()}
            </p>
          </div>

          {canManageAchievements && (
            <button
              onClick={() => setShowAwardModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Award Achievement</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
            {achievementApi
              .getAchievementCategories(userRole)
              .map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Achievement Stats */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center border border-gray-200 dark:border-gray-700">
            <div
              className={`text-2xl sm:text-3xl font-bold mb-2 ${getRoleAccentColor()}`}
            >
              {stats.overview.totalAchievements}
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Total Achievements
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center border border-gray-200 dark:border-gray-700">
            <div
              className={`text-2xl sm:text-3xl font-bold mb-2 ${getRoleAccentColor()}`}
            >
              {stats.overview.totalPoints}
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Total Points
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center border border-gray-200 dark:border-gray-700">
            <div
              className={`text-2xl sm:text-3xl font-bold mb-2 ${getRoleAccentColor()}`}
            >
              {stats.overview.categories.length}
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Categories
            </div>
          </div>
        </div>
      )}

      {/* Achievements Grid */}
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {achievements.map((achievement, idx) => {
            const IconComponent =
              iconMap[achievement.icon as keyof typeof iconMap] || Medal;
            return (
              <motion.div
                key={achievement._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-lg dark:hover:shadow-gray-900/50 ease-in-out delay-150 duration-300 relative`}
              >
                {canDeleteAchievements && (
                  <button
                    onClick={() => handleDeleteAchievement(achievement._id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center`}
                  >
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2 leading-tight">
                      {achievement.title}
                    </h2>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                      {achievement.category}
                    </span>
                  </div>
                  {achievement.points && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 bg-indigo-600 text-white rounded-lg">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Award Achievement Modal */}
      <AchievementModal
        isOpen={showAwardModal}
        onClose={() => setShowAwardModal(false)}
        onSubmit={handleAwardAchievement}
        userRole={userRole}
        isLoading={isAwardingAchievement}
      />
    </div>
  );
};

export default Achievements;
