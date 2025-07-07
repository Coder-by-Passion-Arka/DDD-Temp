import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ClipboardList,
  CheckCircle2,
  UserCircle2,
  CalendarDays,
  Plus,
  Users,
  TrendingUp,
  Calendar,
  Book,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { useToast } from "../hooks/useToast";

// TypeScript interfaces for type safety
interface Course {
  _id: string;
  title: string;
  description: string;
  courseCode?: string;
  instructor: {
    _id: string;
    userName: string;
    userEmail: string;
  };
  assignments: number;
  completedBy: number;
  totalStudents: number;
  averageScore: number;
  status: "draft" | "starting_soon" | "active" | "completed" | "archived";
  schedule: {
    startDate: string;
    endDate: string;
    meetingDays?: string[];
    meetingTime?: { start: string; end: string };
  };
  enrolledStudents: Array<{
    student: string;
    enrolledAt: string;
    status: "active" | "dropped" | "completed";
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CreateCourseData {
  title: string;
  description: string;
  courseCode: string;
  instructor?: string; // Optional for admin use
  schedule: {
    startDate: string;
    endDate: string;
    meetingDays: string[];
    meetingTime: { start: string; end: string };
  };
  settings: {
    maxStudents: number;
    allowSelfEnrollment: boolean;
    isPublic: boolean;
  };
}

const CoursesPage: React.FC = () => {
  const { state } = useAuth();
  const toast = useToast();

  // State management
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateCourseData>({
    title: "",
    description: "",
    courseCode: "",
    schedule: {
      startDate: "",
      endDate: "",
      meetingDays: [],
      meetingTime: { start: "", end: "" },
    },
    settings: {
      maxStudents: 50,
      allowSelfEnrollment: false,
      isPublic: false,
    },
  });

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [state.user]);

  const fetchCourses = async () => {
    if (!state.user) return;

    try {
      setIsLoading(true);

      // TODO: Replace with actual API call when backend routes are ready
      // const response = await apiService.get('/courses');
      // setCourses(response.data);

      // Mock data for now
      const mockCourses: Course[] = [
        {
          _id: "1",
          title: "Data Structures",
          description: "Comprehensive study of data structures and algorithms",
          courseCode: "CS301",
          instructor: {
            _id: "inst1",
            userName: "Prof. Nisha Verma",
            userEmail: "nisha.verma@university.edu",
          },
          assignments: 6,
          completedBy: 20,
          totalStudents: 25,
          averageScore: 86,
          status: "active",
          schedule: {
            startDate: "2025-01-10",
            endDate: "2025-05-25",
            meetingDays: ["Monday", "Wednesday", "Friday"],
            meetingTime: { start: "09:00", end: "10:30" },
          },
          enrolledStudents: [],
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
        {
          _id: "2",
          title: "Operating Systems",
          description: "Study of operating system concepts and design",
          courseCode: "CS401",
          instructor: {
            _id: "inst2",
            userName: "Dr. Rajat Kulkarni",
            userEmail: "rajat.kulkarni@university.edu",
          },
          assignments: 5,
          completedBy: 18,
          totalStudents: 30,
          averageScore: 78,
          status: "active",
          schedule: {
            startDate: "2025-02-01",
            endDate: "2025-06-01",
            meetingDays: ["Tuesday", "Thursday"],
            meetingTime: { start: "14:00", end: "15:30" },
          },
          enrolledStudents: [],
          createdAt: "2025-01-15T00:00:00Z",
          updatedAt: "2025-01-15T00:00:00Z",
        },
      ];

      setCourses(mockCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validation
      if (!formData.title.trim() || !formData.description.trim()) {
        toast.error("Title and description are required");
        return;
      }

      if (!formData.schedule.startDate || !formData.schedule.endDate) {
        toast.error("Start date and end date are required");
        return;
      }

      // TODO: Replace with actual API call
      // const response = await apiService.post('/courses', formData);

      toast.success("Course created successfully!");
      setShowCreateForm(false);

      // Reset form
      setFormData({
        title: "",
        description: "",
        courseCode: "",
        schedule: {
          startDate: "",
          endDate: "",
          meetingDays: [],
          meetingTime: { start: "", end: "" },
        },
        settings: {
          maxStudents: 50,
          allowSelfEnrollment: false,
          isPublic: false,
        },
      });

      // Refresh courses list
      await fetchCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateCourseData] as any),
          [child]:
            type === "checkbox"
              ? (e.target as HTMLInputElement).checked
              : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 dark:text-green-400";
      case "starting_soon":
        return "text-blue-600 dark:text-blue-400";
      case "completed":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Courses
        </h2>

        {/* Create Course Button for Teachers and Admins */}
        {(state?.user?.userRole === "teacher" ||
          state?.user?.userRole === "admin") && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        )}
      </div>

      {/* Create Course Form Modal */}
      {showCreateForm &&
        (state?.user?.userRole === "teacher" ||
          state?.user?.userRole === "admin") && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create New Course
                  </h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Course Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Data Structures and Algorithms"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="courseCode"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Course Code *
                    </label>
                    <input
                      type="text"
                      id="courseCode"
                      name="courseCode"
                      value={formData.courseCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., CS301"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Brief description of the course..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="schedule.startDate"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="schedule.startDate"
                      name="schedule.startDate"
                      value={formData.schedule.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="schedule.endDate"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="schedule.endDate"
                      name="schedule.endDate"
                      value={formData.schedule.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="settings.maxStudents"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Maximum Students
                  </label>
                  <input
                    type="number"
                    id="settings.maxStudents"
                    name="settings.maxStudents"
                    value={formData.settings.maxStudents}
                    onChange={handleInputChange}
                    min="1"
                    max="200"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Courses Grid */}
      {state?.user?.userRole === "student" ? (
        // Student View - Course Cards
        <div>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <Book className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Courses Enrolled
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't enrolled in any courses yet. Contact your instructor
                to get enrolled.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const percent =
                  course.totalStudents > 0
                    ? Math.round(
                        (course.completedBy / course.totalStudents) * 100
                      )
                    : 0;
                const statusColor = getStatusColor(course.status);

                return (
                  <div
                    key={course._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => {
                      /* Navigate to course details */
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {course.courseCode}
                        </p>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <UserCircle2 className="w-4 h-4 text-blue-500" />
                        <span>{course.instructor.userName}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <CalendarDays className="w-4 h-4 text-purple-500" />
                        <span>
                          {formatDate(course.schedule.startDate)} →{" "}
                          {formatDate(course.schedule.endDate)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <ClipboardList className="w-4 h-4 text-green-500" />
                        <span>{course.assignments} Assignments</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span>Course Progress</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Avg Score: {course.averageScore}%
                      </span>
                      <span className={`font-medium capitalize ${statusColor}`}>
                        {course.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Teacher/Admin View - Course Management
        <div>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <Book className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Courses Created
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start by creating your first course to manage students and
                assignments.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {course.description}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                        course.status
                      )}`}
                    >
                      {course.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {course.totalStudents}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Students
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {course.assignments}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Assignments
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {course.averageScore}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Avg Score
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {course.completedBy}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Completed
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(course.schedule.startDate)} -{" "}
                      {formatDate(course.schedule.endDate)}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
                        View Details
                      </button>
                      <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Unauthorized Access */}
      {!state?.user && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <UserCircle2 className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to access your courses.
          </p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
