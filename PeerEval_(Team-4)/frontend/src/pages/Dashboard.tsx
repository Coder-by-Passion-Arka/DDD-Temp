// import React from 'react';
// import {
//   BookOpen,
//   Clock,
//   Target,
//   CheckCircle,
// } from 'lucide-react';
// import StatsCard from '../components/StatsCard';
// import ProgressChart from '../components/ProgressChart';
// import StreakCounter from '../components/StreakCounter';
// import RecentAssignments from '../components/RecentAssignments';

// const Dashboard: React.FC = () => {
//   const stats = {
//     submitted: 24,
//     inProgress: 3,
//     toEvaluate: 7,
//     completed: 180,
//   };

//   const dailyProgress = [
//     { day: 'Mon', submissions: 4, evaluations: 2 },
//     { day: 'Tue', submissions: 6, evaluations: 3 },
//     { day: 'Wed', submissions: 3, evaluations: 5 },
//     { day: 'Thu', submissions: 8, evaluations: 4 },
//     { day: 'Fri', submissions: 5, evaluations: 6 },
//     { day: 'Sat', submissions: 2, evaluations: 1 },
//     { day: 'Sun', submissions: 3, evaluations: 2 },
//   ];

//   return (
//     <>
//       <div className="mb-6 sm:mb-8">
//         <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-3">
//           Evaluation Dashboard
//         </h1>
//         <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
//           Track your peer evaluation progress and assignments with real-time insights
//         </p>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
//         <StatsCard
//           title="Total Submitted"
//           value={stats.submitted}
//           icon={CheckCircle}
//           color="emerald"
//           trend="+12%"
//         />
//         <StatsCard
//           title="In Progress"
//           value={stats.inProgress}
//           icon={Clock}
//           color="amber"
//           trend="-5%"
//         />
//         <StatsCard
//           title="To Evaluate"
//           value={stats.toEvaluate}
//           icon={Target}
//           color="blue"
//           trend="+8%"
//         />
//         <StatsCard
//           title="Completed"
//           value={stats.completed}
//           icon={BookOpen}
//           color="purple"
//           trend="+23%"
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
//         <div className="lg:col-span-2">
//           <ProgressChart data={dailyProgress} />
//         </div>
//         <div id="streak-section" className="transition-all duration-300 rounded-2xl">
//           <StreakCounter currentStreak={12} bestStreak={28} />
//         </div>
//       </div>

//       <RecentAssignments />
//     </>
//   );
// };

// export default Dashboard;

// ================================================================ //

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  Loader2,
  Users,
  Settings,
  BarChart,
} from "lucide-react";
import StatsCard from "../components/StatsCard";
import ProgressChart from "../components/ProgressChart";
import StreakCounter from "../components/StreakCounter";
import RecentAssignments from "../components/RecentAssignments";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

interface DashboardStats {
  submitted: number;
  inProgress: number;
  toEvaluate: number;
  completed: number;
}

interface TeacherStats {
  totalStudents: number;
  activeAssignments: number;
  pendingEvaluations: number;
  coursesManaged: number;
}

interface AdminStats {
  totalUsers: number;
  activeTeachers: number;
  totalStudents: number;
  systemHealth: number;
}

interface DashboardData {
  stats: DashboardStats | TeacherStats | AdminStats;
  dailyProgress: Array<{
    day: string;
    submissions: number;
    evaluations: number;
  }>;
  currentStreak: number;
  bestStreak: number;
}

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Get user role, defaulting to student if not set
  const userRole = state.user?.userRole || "student";

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!state.user) return;

      try {
        setIsLoading(true);

        // Mock data based on user role
        let mockData: DashboardData;

        switch (userRole) {
          case "teacher":
            mockData = {
              stats: {
                totalStudents: 45,
                activeAssignments: 8,
                pendingEvaluations: 23,
                coursesManaged: 3,
              } as TeacherStats,
              dailyProgress: [
                { day: "Mon", submissions: 12, evaluations: 8 },
                { day: "Tue", submissions: 15, evaluations: 10 },
                { day: "Wed", submissions: 8, evaluations: 12 },
                { day: "Thu", submissions: 18, evaluations: 9 },
                { day: "Fri", submissions: 14, evaluations: 15 },
                { day: "Sat", submissions: 5, evaluations: 3 },
                { day: "Sun", submissions: 7, evaluations: 4 },
              ],
              currentStreak: 15,
              bestStreak: 42,
            };
            break;

          case "admin":
            mockData = {
              stats: {
                totalUsers: 1250,
                activeTeachers: 25,
                totalStudents: 1200,
                systemHealth: 98,
              } as AdminStats,
              dailyProgress: [
                { day: "Mon", submissions: 45, evaluations: 35 },
                { day: "Tue", submissions: 52, evaluations: 42 },
                { day: "Wed", submissions: 38, evaluations: 48 },
                { day: "Thu", submissions: 61, evaluations: 39 },
                { day: "Fri", submissions: 47, evaluations: 56 },
                { day: "Sat", submissions: 23, evaluations: 18 },
                { day: "Sun", submissions: 28, evaluations: 22 },
              ],
              currentStreak: 30,
              bestStreak: 85,
            };
            break;

          default: // student
            mockData = {
              stats: {
                submitted: 24,
                inProgress: 3,
                toEvaluate: 7,
                completed: 180,
              } as DashboardStats,
              dailyProgress: [
                { day: "Mon", submissions: 4, evaluations: 2 },
                { day: "Tue", submissions: 6, evaluations: 3 },
                { day: "Wed", submissions: 3, evaluations: 5 },
                { day: "Thu", submissions: 8, evaluations: 4 },
                { day: "Fri", submissions: 5, evaluations: 6 },
                { day: "Sat", submissions: 2, evaluations: 1 },
                { day: "Sun", submissions: 3, evaluations: 2 },
              ],
              currentStreak: 12,
              bestStreak: 28,
            };
        }

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // TODO: Replace with actual API calls when backend endpoints are ready
        /*
        const response = await apiService.get(`/user/dashboard/${userRole}`);
        const actualData: DashboardData = response.data;
        */

        setDashboardData(mockData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [state.user, userRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          No dashboard data available
        </p>
      </div>
    );
  }

  // Render based on user role
  const renderDashboard = () => {
    switch (userRole) {
      case "teacher":
        return renderTeacherDashboard();
      case "admin":
        return renderAdminDashboard();
      default:
        return renderStudentDashboard();
    }
  };
  // Student Dashboard 
  const renderStudentDashboard = () => {
    const stats = dashboardData.stats as DashboardStats;

    return (
      <>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-3">
            Welcome back, {state.user?.userName || "Student"}!
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
            Track your peer evaluation progress and assignments with real-time
            insights
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Submitted"
            value={stats.submitted}
            icon={CheckCircle}
            color="emerald"
            trend={stats.submitted > 0 ? "+12%" : "0%"}
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock}
            color="amber"
            trend={stats.inProgress > 0 ? "-5%" : "0%"}
          />
          <StatsCard
            title="To Evaluate"
            value={stats.toEvaluate}
            icon={Target}
            color="blue"
            trend={stats.toEvaluate > 0 ? "+8%" : "0%"}
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={BookOpen}
            color="purple"
            trend={stats.completed > 0 ? "+23%" : "0%"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <ProgressChart data={dashboardData.dailyProgress} />
          </div>
          <div className="transition-all duration-300 rounded-2xl">
            <StreakCounter
              currentStreak={dashboardData.currentStreak}
              bestStreak={dashboardData.bestStreak}
            />
          </div>
        </div>

        <RecentAssignments />

        {/* Welcome message for new users */}
        {stats.submitted === 0 && stats.completed === 0 && (
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to the Peer Evaluation System! 🎉
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get started by checking the Assignments page for tasks to
                complete, or explore your profile to add more information about
                yourself.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => (window.location.href = "/assignments")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Assignments
                </button>
                <button
                  onClick={() => (window.location.href = "/profile")}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };
 
  // Teacher Dashboard
  const renderTeacherDashboard = () => {
    const stats = dashboardData.stats as TeacherStats;

    return (
      <>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-300 dark:to-blue-100 bg-clip-text text-transparent mb-2 sm:mb-3">
            Teacher Dashboard - {state.user?.userName || "Teacher"}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
            Manage your courses, assignments, and track student progress
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            color="blue"
            trend="+5%"
          />
          <StatsCard
            title="Active Assignments"
            value={stats.activeAssignments}
            icon={BookOpen}
            color="emerald"
            trend="+2"
          />
          <StatsCard
            title="Pending Evaluations"
            value={stats.pendingEvaluations}
            icon={Clock}
            color="amber"
            trend="-8%"
          />
          <StatsCard
            title="Courses Managed"
            value={stats.coursesManaged}
            icon={Target}
            color="purple"
            trend="0%"
          />
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <ProgressChart data={dashboardData.dailyProgress} />
          </div>
          <div className="transition-all duration-300 rounded-2xl">
            <StreakCounter
              currentStreak={dashboardData.currentStreak}
              bestStreak={dashboardData.bestStreak}
            />
          </div>
        </div> */}

        {/* Teacher-specific features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              🎯 Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = "/assignments/create")}
                className="w-full text-left px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Assignment
              </button>
              <button
                onClick={() => (window.location.href = "/students")}
                className="w-full text-left px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Manage Students
              </button>
              <button
                onClick={() => (window.location.href = "/evaluations/pending")}
                className="w-full text-left px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Review Pending Evaluations
              </button>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800 text-xl">
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-4">
              📊 Class Overview
            </h3>
            <div className="space-y-2 md:text-sm text-emerald-800 dark:text-emerald-200 text-xl">
              <p>
                • {stats.totalStudents} students across {stats.coursesManaged}{" "}
                courses
              </p>
              <p>• {stats.activeAssignments} assignments currently active</p>
              <p>
                • {stats.pendingEvaluations} evaluations awaiting your review
              </p>
              <p>• {dashboardData.currentStreak} day teaching streak!</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Admin Dashboard
  const renderAdminDashboard = () => {
    const stats = dashboardData.stats as AdminStats;

    return (
      <>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-900 to-red-600 dark:from-red-300 dark:to-red-100 bg-clip-text text-transparent mb-2 sm:mb-3">
            Admin Dashboard - {state.user?.userName || "Administrator"}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
            System overview and platform management
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="purple"
            trend="+12%"
          />
          <StatsCard
            title="Active Teachers"
            value={stats.activeTeachers}
            icon={BookOpen}
            color="blue"
            trend="+3"
          />
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Target}
            color="emerald"
            trend="+8%"
          />
          <StatsCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            icon={BarChart}
            color="amber"
            trend="+2%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <ProgressChart data={dashboardData.dailyProgress} />
          </div>
          <div className="transition-all duration-300 rounded-2xl">
            <StreakCounter
              currentStreak={dashboardData.currentStreak}
              bestStreak={dashboardData.bestStreak}
            />
          </div>
        </div>

        {/* Admin-specific features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
              🛡️ System Management
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = "/admin/users")}
                className="w-full text-left px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Manage Users
              </button>
              <button
                onClick={() => (window.location.href = "/admin/system")}
                className="w-full text-left px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                System Settings
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              📈 Platform Stats
            </h3>
            <div className="space-y-2 md:text-sm text-blue-800 dark:text-blue-200 text-xl">
              <p>• {stats.totalUsers} total platform users</p>
              <p>• {stats.activeTeachers} active teachers</p>
              <p>• {stats.totalStudents} enrolled students</p>
              <p>• {stats.systemHealth}% system uptime</p>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-4">
              ⚡ Quick Reports
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = "/admin/reports/usage")}
                className="w-full text-left px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Usage Analytics
              </button>
              <button
                onClick={() =>
                  (window.location.href = "/admin/reports/performance")
                }
                className="w-full text-left px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Performance Reports
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return <>{renderDashboard()}</>;
};

export default Dashboard;
