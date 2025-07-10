import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Target,
  Timer,
  BookOpen,
  Coffee,
  Dumbbell,
  Users,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Filter,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { apiService } from "../services/api";
import { useAuth } from "../hooks/useAuth";

// Types matching the backend model
interface Activity {
  _id: string;
  type: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  productivity: number;
  tags: string[];
  relatedAssignment?: {
    _id: string;
    title: string;
    dueDate: Date;
  };
  relatedCourse?: {
    _id: string;
    title: string;
    code: string;
  };
  notes?: string;
}

interface DailyGoal {
  description: string;
  targetDuration: number;
  completed: boolean;
  completedAt?: Date;
  priority: "low" | "medium" | "high";
}

interface DailyActivity {
  _id: string;
  userId: string;
  date: Date;
  activities: Activity[];
  summary: {
    totalActivities: number;
    totalStudyTime: number;
    totalBreakTime: number;
    averageProductivity: number;
    topActivityType: string;
  };
  dailyGoals: DailyGoal[];
  dayRating?: number;
  mood?: string;
  energyLevel?: string;
  streakData: {
    isActiveDay: boolean;
    studyStreak: number;
    goalCompletionStreak: number;
  };
  isPrivate: boolean;
  reviewStatus: string;
}

interface ActivityStats {
  totalDays: number;
  totalStudyTime: number;
  totalActivities: number;
  averageProductivity: number;
  activeDays: number;
  averageDayRating: number;
}

interface ActivityFormData {
  type: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  productivity: number;
  tags: string[];
  relatedAssignment?: string;
  relatedCourse?: string;
  notes: string;
}

const DailyActivities: React.FC = () => {
  const { state } = useAuth();
  const userRole = state.user?.userRole;

  // State management
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Modal and form state
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityForm, setActivityForm] = useState<ActivityFormData>({
    type: "study_session",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    productivity: 3,
    tags: [],
    notes: "",
  });

  // Filter and view state
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "stats">(
    "list"
  );
  const [showPrivateActivities, setShowPrivateActivities] = useState(true);

  // Activity type configuration
  const activityTypes = [
    {
      value: "study_session",
      label: "Study Session",
      icon: BookOpen,
      color: "blue",
    },
    {
      value: "assignment_work",
      label: "Assignment Work",
      icon: Edit,
      color: "green",
    },
    { value: "reading", label: "Reading", icon: BookOpen, color: "purple" },
    { value: "research", label: "Research", icon: Target, color: "indigo" },
    {
      value: "project_work",
      label: "Project Work",
      icon: Users,
      color: "orange",
    },
    {
      value: "exam_preparation",
      label: "Exam Prep",
      icon: AlertCircle,
      color: "red",
    },
    {
      value: "peer_evaluation",
      label: "Peer Evaluation",
      icon: Users,
      color: "pink",
    },
    { value: "break", label: "Break", icon: Coffee, color: "yellow" },
    { value: "exercise", label: "Exercise", icon: Dumbbell, color: "emerald" },
    { value: "meeting", label: "Meeting", icon: Users, color: "gray" },
    { value: "other", label: "Other", icon: Clock, color: "slate" },
  ];

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        date: selectedDate,
        limit: "10",
        ...(filterType !== "all" && { activityType: filterType }),
      });

      const response = await apiService.get(`/dailyActivities?${params}`);
      setActivities(response.activities || []);
      setStats(response.stats);
    } catch (err: any) {
      console.error("Error fetching activities:", err);
      setError(err.message || "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, filterType]);

  // Fetch activity statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.get(
        "/dailyActivities/stats/personal?period=week"
      );
      setStats(response.stats);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle form submission
  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const activityData = {
        date: selectedDate,
        ...activityForm,
        startTime: new Date(`${selectedDate}T${activityForm.startTime}`),
        endTime: new Date(`${selectedDate}T${activityForm.endTime}`),
      };

      if (editingActivity) {
        await apiService.patch(
          `/dailyActivities/${editingActivity._id}`,
          activityData
        );
      } else {
        await apiService.post("/dailyActivities/activity", activityData);
      }

      setShowActivityModal(false);
      setEditingActivity(null);
      resetForm();
      await fetchActivities();
    } catch (err: any) {
      setError(err.message || "Failed to save activity");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setActivityForm({
      type: "study_session",
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      productivity: 3,
      tags: [],
      notes: "",
    });
  };

  // Handle delete activity
  const handleDeleteActivity = async (
    activityId: string,
    subActivityId: string
  ) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    try {
      await apiService.delete(
        `/dailyActivities/${activityId}/activity/${subActivityId}`
      );
      await fetchActivities();
    } catch (err: any) {
      setError(err.message || "Failed to delete activity");
    }
  };

  // Handle edit activity
  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityForm({
      type: activity.type,
      title: activity.title,
      description: activity.description || "",
      startTime: new Date(activity.startTime).toTimeString().slice(0, 5),
      endTime: new Date(activity.endTime).toTimeString().slice(0, 5),
      productivity: activity.productivity,
      tags: activity.tags,
      notes: activity.notes || "",
    });
    setShowActivityModal(true);
  };

  // Format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Get activity icon and color
  const getActivityConfig = (type: string) => {
    return activityTypes.find((t) => t.value === type) || activityTypes[0];
  };

  // Calculate productivity percentage
  const getProductivityPercentage = (productivity: number): number => {
    return (productivity / 5) * 100;
  };

  // Get productivity color
  const getProductivityColor = (productivity: number): string => {
    if (productivity >= 4) return "text-green-600";
    if (productivity >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Daily Activities
            </h1>
            <p className="text-gray-600">
              Track and manage your daily learning activities
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {["list", "calendar", "stats"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                    viewMode === mode
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Add Activity Button */}
            <button
              onClick={() => setShowActivityModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Study Time
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatDuration(stats.totalStudyTime)}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Activities
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {stats.totalActivities}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Productivity
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {(stats.averageProductivity || 0).toFixed(1)}/5
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Active Days
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {stats.activeDays}/{stats.totalDays}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Activity Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Activities</option>
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Privacy Toggle */}
          <button
            onClick={() => setShowPrivateActivities(!showPrivateActivities)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              showPrivateActivities
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {showPrivateActivities ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            {showPrivateActivities ? "Showing Private" : "Hiding Private"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Activities List */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No activities for this date
              </h3>
              <p className="text-gray-600 mb-4">
                Start tracking your learning activities to see your progress
              </p>
              <button
                onClick={() => setShowActivityModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Activity
              </button>
            </div>
          ) : (
            activities.map((dailyActivity) => (
              <div
                key={dailyActivity._id}
                className="bg-white rounded-lg shadow-sm border"
              >
                {/* Daily Summary Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {new Date(dailyActivity.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>
                          {dailyActivity.summary.totalActivities} activities
                        </span>
                        <span>
                          {formatDuration(dailyActivity.summary.totalStudyTime)}{" "}
                          study time
                        </span>
                        {dailyActivity.dayRating && (
                          <span>Rating: {dailyActivity.dayRating}/5</span>
                        )}
                      </div>
                    </div>

                    {dailyActivity.streakData.isActiveDay && (
                      <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Active Day
                      </div>
                    )}
                  </div>
                </div>

                {/* Activities List */}
                <div className="p-4 space-y-3">
                  {dailyActivity.activities.map((activity) => {
                    const config = getActivityConfig(activity.type);
                    const Icon = config.icon;

                    return (
                      <div
                        key={activity._id}
                        className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {/* Activity Icon */}
                        <div
                          className={`p-2 rounded-lg bg-${config.color}-100`}
                        >
                          <Icon
                            className={`w-5 h-5 text-${config.color}-600`}
                          />
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {activity.title}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
                            >
                              {config.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {formatDuration(activity.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(activity.startTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}{" "}
                              -{" "}
                              {new Date(activity.endTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                            <span
                              className={`font-medium ${getProductivityColor(
                                activity.productivity
                              )}`}
                            >
                              Productivity: {activity.productivity}/5
                            </span>
                          </div>

                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {activity.description}
                            </p>
                          )}

                          {activity.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {activity.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditActivity(activity)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteActivity(
                                dailyActivity._id,
                                activity._id
                              )
                            }
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingActivity ? "Edit Activity" : "Add New Activity"}
              </h2>
            </div>

            <form onSubmit={handleSubmitActivity} className="p-6 space-y-4">
              {/* Activity Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Type
                </label>
                <select
                  value={activityForm.type}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {activityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={activityForm.title}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Math Problem Set, Research Paper Reading"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={activityForm.description}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional description of what you worked on"
                  rows={3}
                />
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={activityForm.startTime}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={activityForm.endTime}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Productivity Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Productivity Rating: {activityForm.productivity}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={activityForm.productivity}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      productivity: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low</span>
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                  <span>Very High</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={activityForm.notes}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, notes: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional notes or reflections"
                  rows={2}
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowActivityModal(false);
                    setEditingActivity(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading
                    ? "Saving..."
                    : editingActivity
                    ? "Update Activity"
                    : "Add Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyActivities;
