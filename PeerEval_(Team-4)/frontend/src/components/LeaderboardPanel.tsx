import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { apiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";


interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  change: number;
  evaluationsCompleted: number;
  assignmentsSubmitted: number;
}

interface LeaderboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// API Service functions (same as modal)
const LeaderBoardService = {
  async getAllStudents(): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch("/api/v1/leaderboard/students");
      if (!response.ok) throw new Error("Failed to fetch leaderboard data");
      return await response.json();
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      return [];
    }
  },

  async updateLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch("/api/v1/leaderboard/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to update leaderboard data");
      return await response.json();
    } catch (error) {
      console.error("Error updating leaderboard data:", error);
      return [];
    }
  },
};

const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      loadLeaderboardData();
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const loadLeaderboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await LeaderBoardService.getAllStudents();
      setLeaderboardData(data);
    } catch (error) {
      console.error("Error loading leaderboard data:", error);
      setError("Failed to load leaderboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLeaderboard = async () => {
    try {
      setIsLoading(true);
      const updatedData = await LeaderBoardService.updateLeaderboard();
      setLeaderboardData(updatedData);
    } catch (error) {
      console.error("Error updating leaderboard:", error);
      setError("Failed to update leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500">
            #{rank}
          </span>
        );
    }
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs font-medium">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
          <TrendingUp className="w-3 h-3 rotate-180" />
          <span className="text-xs font-medium">{change}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
          <span className="text-xs font-medium">-</span>
        </div>
      );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onWheel={(e) => {
          // Prevent event from bubbling to parent elements
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Leaderboard</h2>
              <p className="text-sm text-white/80">Top performers</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpdateLeaderboard}
              disabled={isLoading}
              className="p-2 hover:bg-white/20 disabled:opacity-50 rounded-lg transition-colors duration-200"
              title="Refresh leaderboard"
            >
              <RefreshCw
                className={`w-4 h-4 text-white ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable Area */}
        <div
          className="flex-1 overflow-y-auto p-6 overscroll-contain"
          style={{ height: "calc(100vh - 88px)" }}
          onWheel={(e) => {
            // Prevent event from bubbling to parent elements
            e.stopPropagation();
          }}
        >
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                  </div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                {error}
              </p>
              <button
                onClick={loadLeaderboardData}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No leaderboard data available yet.</p>
            </div>
          ) : (
            <>
              {/* Top 3 Compact */}
              {leaderboardData.length >= 3 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Top Performers
                  </h3>
                  <div className="space-y-2">
                    {leaderboardData.slice(0, 3).map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex items-center space-x-3 p-3 rounded-xl ${
                          entry.rank === 1
                            ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800"
                            : entry.rank === 2
                            ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border border-gray-200 dark:border-gray-700"
                            : "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            entry.rank === 1
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                              : entry.rank === 2
                              ? "bg-gradient-to-br from-gray-400 to-gray-500"
                              : "bg-gradient-to-br from-amber-600 to-amber-700"
                          }`}
                        >
                          {entry.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {entry.name}
                            </p>
                            <Star className="w-3 h-3 text-yellow-500" />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {entry.score.toLocaleString()} pts
                          </p>
                        </div>
                        <div className="text-right">
                          {getChangeIndicator(entry.change)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Rankings */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  All Rankings
                </h3>
                {leaderboardData.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-6">
                      {entry.rank <= 3 ? (
                        getRankIcon(entry.rank)
                      ) : (
                        <span className="text-sm font-bold text-gray-500">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                        entry.rank === 1
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                          : entry.rank === 2
                          ? "bg-gradient-to-br from-gray-400 to-gray-500"
                          : entry.rank === 3
                          ? "bg-gradient-to-br from-amber-600 to-amber-700"
                          : "bg-gradient-to-br from-indigo-500 to-purple-600"
                      }`}
                    >
                      {entry.avatar}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {entry.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>{entry.evaluationsCompleted}</span>
                        <span>•</span>
                        <span>{entry.assignmentsSubmitted}</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">
                        {entry.score.toLocaleString()}
                      </p>
                      {getChangeIndicator(entry.change)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Info */}
              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      Scoring System
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Evaluations: +25 pts • Assignments: +15 pts • High
                      ratings: up to +50 pts
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LeaderboardPanel;
