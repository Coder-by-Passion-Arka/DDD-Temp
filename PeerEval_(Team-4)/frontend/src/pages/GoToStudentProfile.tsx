import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Shield, User, Search } from "lucide-react";

function GoToStudentProfileDialog() {
  const { state } = useAuth();
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to access student profiles
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has permission to view student profiles
  if (state.user?.userRole === "student") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Students cannot access other student profiles. This feature is
              only available to teachers and administrators.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                View My Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!studentId.trim()) {
      setError("Please enter a student ID or email");
      return;
    }

    setIsLoading(true);

    try {
      // In a real implementation, you would first validate that the student exists
      // and that the current user has permission to view their profile

      // For now, we'll just navigate to the profile page
      // The profile page should handle the actual user lookup and permission checks

      // Navigate to the profile page with the entered ID
      navigate(`/profile/${studentId.trim()}`);
    } catch (error) {
      console.error("Error navigating to student profile:", error);
      setError("Failed to navigate to student profile");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "teacher":
        return "Teacher";
      case "admin":
        return "Administrator";
      default:
        return "User";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Find Student Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a student's ID or email to view their profile
          </p>
        </div>

        {/* User role indicator */}
        <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Logged in as:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {getRoleDisplayName(state.user?.userRole || "")}
              </span>
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="studentId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Student ID or Email
            </label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student ID, email, or username"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              You can search by user ID, email address, or username
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !studentId.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>View Profile</span>
              </>
            )}
          </button>
        </form>

        {/* Additional actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              My Profile
            </button>
          </div>
        </div>

        {/* Permissions note */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> You can view student profiles based on your
            role permissions. Contact your administrator if you need access to
            specific profiles.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GoToStudentProfileDialog;
