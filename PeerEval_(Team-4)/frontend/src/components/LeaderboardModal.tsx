import React, { useState, useEffect } from "react";
import { 
  X, 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  TrendingUp 
} from "lucide-react";

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

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// API Service functions
const LeaderBoardService = {
  // Get all the calculated leaderboard data
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

  // Update the leaderboard data each day
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

  // Update user score
  async updateUserScore(
    userId: string,
    scoreChange: number,
    type: string
  ): Promise<boolean> {
    try {
      const response = await fetch("/api/v1/leaderboard/user/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, scoreChange, type }),
      });
      return response.ok;
    } catch (error) {
      console.error("Error updating user score:", error);
      return false;
    }
  },
};

// Utility functions
const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return (
        <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">
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

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  // Load leaderboard data on component mount
  useEffect(() => {
    if (isOpen) {
      loadLeaderboardData();
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Leaderboard</h2>
              <p className="text-sm text-white/80">Top performers this week</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpdateLeaderboard}
              disabled={isLoading}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white text-sm rounded-lg transition-colors duration-200"
            >
              {isLoading ? "Updating..." : "Refresh"}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={loadLeaderboardData}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No leaderboard data available yet.</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {leaderboardData.length >= 3 && (
                <div className="mb-8">
                  <div className="flex items-end justify-center space-x-4 mb-6">
                    {/* 2nd Place */}
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-lg mb-2">
                        {leaderboardData[1].avatar}
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 min-h-[80px] flex flex-col justify-center">
                        <Medal className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {leaderboardData[1].name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {leaderboardData[1].score} pts
                        </p>
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-xl mb-2">
                        {leaderboardData[0].avatar}
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 min-h-[100px] flex flex-col justify-center">
                        <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="font-bold text-gray-900 dark:text-white">
                          {leaderboardData[0].name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {leaderboardData[0].score} pts
                        </p>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold text-lg mb-2">
                        {leaderboardData[2].avatar}
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 min-h-[80px] flex flex-col justify-center">
                        <Award className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {leaderboardData[2].name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {leaderboardData[2].score} pts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Rankings */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Full Rankings
                </h3>
                {leaderboardData.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      entry.rank <= 3
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800"
                        : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
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
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {entry.name}
                        </p>
                        {entry.rank <= 3 && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{entry.evaluationsCompleted} evaluations</span>
                        <span>•</span>
                        <span>{entry.assignmentsSubmitted} assignments</span>
                      </div>
                    </div>

                    {/* Score and Change */}
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {entry.score.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-end">
                        {getChangeIndicator(entry.change)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Info */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      How scoring works
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Points are awarded for completing evaluations (+25 pts),
                      submitting assignments (+15 pts), and receiving high peer
                      ratings (up to +50 pts). Rankings update weekly.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
