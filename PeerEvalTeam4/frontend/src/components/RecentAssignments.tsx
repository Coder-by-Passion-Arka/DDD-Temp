// import React from 'react';
// import {
//   Calendar,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   Users,
//   FileText,
//   ArrowRight
// } from 'lucide-react';

// interface Assignment {
//   id: string;
//   title: string;
//   course: string;
//   dueDate: string;
//   status: 'pending' | 'in-progress' | 'completed' | 'overdue';
//   peersCount: number;
//   submissionsReceived: number;
// }

// const RecentAssignments: React.FC = () => {
//   const assignments: Assignment[] = [
//     {
//       id: '1',
//       title: 'Data Structures Implementation',
//       course: 'CS 301',
//       dueDate: '2024-01-15',
//       status: 'pending',
//       peersCount: 5,
//       submissionsReceived: 3
//     },
//     {
//       id: '2',
//       title: 'UI/UX Design Analysis',
//       course: 'DES 205',
//       dueDate: '2024-01-12',
//       status: 'in-progress',
//       peersCount: 4,
//       submissionsReceived: 4
//     },
//     {
//       id: '3',
//       title: 'Machine Learning Project',
//       course: 'CS 401',
//       dueDate: '2024-01-10',
//       status: 'completed',
//       peersCount: 6,
//       submissionsReceived: 6
//     },
//     {
//       id: '4',
//       title: 'Database Design Review',
//       course: 'CS 350',
//       dueDate: '2024-01-08',
//       status: 'overdue',
//       peersCount: 3,
//       submissionsReceived: 2
//     }
//   ];

//   const getStatusConfig = (status: Assignment['status']) => {
//     switch (status) {
//       case 'completed':
//         return {
//           icon: CheckCircle,
//           color: 'text-emerald-600 dark:text-emerald-400',
//           bg: 'bg-emerald-50 dark:bg-emerald-900/20',
//           border: 'border-emerald-200 dark:border-emerald-800',
//           label: 'Completed'
//         };
//       case 'in-progress':
//         return {
//           icon: Clock,
//           color: 'text-blue-600 dark:text-blue-400',
//           bg: 'bg-blue-50 dark:bg-blue-900/20',
//           border: 'border-blue-200 dark:border-blue-800',
//           label: 'In Progress'
//         };
//       case 'overdue':
//         return {
//           icon: AlertCircle,
//           color: 'text-red-600 dark:text-red-400',
//           bg: 'bg-red-50 dark:bg-red-900/20',
//           border: 'border-red-200 dark:border-red-800',
//           label: 'Overdue'
//         };
//       default:
//         return {
//           icon: FileText,
//           color: 'text-amber-600 dark:text-amber-400',
//           bg: 'bg-amber-50 dark:bg-amber-900/20',
//           border: 'border-amber-200 dark:border-amber-800',
//           label: 'Pending'
//         };
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
//         <div className="flex items-center space-x-3">
//           <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
//             <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//           </div>
//           <div>
//             <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Assignments</h3>
//             <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Peer evaluation tasks</p>
//           </div>
//         </div>
//         <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-xs sm:text-sm flex items-center space-x-1 hover:space-x-2 transition-all duration-200">
//           <span>View all</span>
//           <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
//         </button>
//       </div>

//       <div className="space-y-3 sm:space-y-4">
//         {assignments.map((assignment) => {
//           const statusConfig = getStatusConfig(assignment.status);
//           const StatusIcon = statusConfig.icon;

//           return (
//             <div
//               key={assignment.id}
//               className="p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/30 transition-all duration-200 cursor-pointer group"
//             >
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <div className="flex items-start space-x-2 sm:space-x-3">
//                     <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${statusConfig.bg} ${statusConfig.border} border flex items-center justify-center mt-0.5`}>
//                       <StatusIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${statusConfig.color}`} />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 text-sm sm:text-base">
//                         {assignment.title}
//                       </h4>
//                       <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">{assignment.course}</p>

//                       <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs text-gray-500 dark:text-gray-400">
//                         <div className="flex items-center space-x-1">
//                           <Calendar className="w-3 h-3" />
//                           <span>Due {formatDate(assignment.dueDate)}</span>
//                         </div>
//                         <div className="flex items-center space-x-1">
//                           <Users className="w-3 h-3" />
//                           <span>{assignment.submissionsReceived}/{assignment.peersCount} peers</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border} ml-2`}>
//                   {statusConfig.label}
//                 </div>
//               </div>

//               {assignment.submissionsReceived < assignment.peersCount && (
//                 <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
//                   <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
//                     <span>Progress</span>
//                     <span>{assignment.submissionsReceived} of {assignment.peersCount} evaluations</span>
//                   </div>
//                   <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
//                     <div
//                       className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
//                       style={{ width: `${(assignment.submissionsReceived / assignment.peersCount) * 100}%` }}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default RecentAssignments;

// ============================================================================//

import React, { useState, useEffect } from "react";
import { Calendar, User, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { BrowserRouter as Router, Route } from "react-router-dom";
import AssignmentPage from "../pages/Assignments";
import { apiService } from "../services/api";

interface RecentAssignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  assignedBy: string;
  status: "pending" | "submitted" | "evaluated" | "overdue";
  priority: "low" | "medium" | "high";
  description?: string;
  submittedAt?: string;
  evaluatedAt?: string;
}

const RecentAssignments: React.FC = () => {
  const { state } = useAuth();
  const [assignments, setAssignments] = useState<RecentAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentAssignments = async () => {
      if (!state.user) return;

      try {
        setIsLoading(true);

        // For now, we'll use empty array since backend endpoints might not exist yet
        // In production, replace this with actual API calls
        const mockAssignments: RecentAssignment[] = [];

        // Simulate API call delay
        // await new Promise((resolve) => setTimeout(resolve, 300));

        // TODO: Replace with actual API call when backend endpoint is ready
        /*
        const response = await apiService.get('/user/assignments/recent?limit=5');
        const actualAssignments: RecentAssignment[] = response.data;
        */

        setAssignments(mockAssignments);
      } catch (error) {
        console.error("Error fetching recent assignments:", error);
        setError("Failed to load recent assignments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentAssignments();
  }, [state.user]);

  const getStatusColor = (status: RecentAssignment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "evaluated":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: RecentAssignment["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading assignments...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Recent Assignments
        </h2>
        <button
          onClick={() => (window.location.href = "/assignments")}
          className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Recent Assignments
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You don't have any recent assignments. Check back later or contact
              your instructor.
            </p>
            <button
              // onClick={() => (window.location.href = "/assignments")}
              onClick={() => {
                <Router>
                  <Route path="/assignments" element={<AssignmentPage />} />
                </Router>;
              }}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Go to Assignments
            </button>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className={`p-4 border-l-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${getPriorityColor(
                assignment.priority
              )}`}
              onClick={() => (window.location.href = "/assignments")}
            >
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                      {assignment.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        assignment.status
                      )}`}
                    >
                      {assignment.status.charAt(0).toUpperCase() +
                        assignment.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {assignment.subject}
                  </p>

                  {assignment.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{assignment.assignedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span
                        className={
                          assignment.status === "overdue"
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        }
                      >
                        {formatDueDate(assignment.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                    {assignment.priority === "high" && (
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                        High Priority
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick stats for assignments */}
      {assignments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {assignments.filter((a) => a.status === "pending").length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Pending
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {assignments.filter((a) => a.status === "submitted").length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Submitted
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {assignments.filter((a) => a.status === "evaluated").length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Evaluated
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {assignments.filter((a) => a.status === "overdue").length}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">
                Overdue
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User guidance for new users */}
      {assignments.length === 0 && state.user?.userRole === "student" && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="md:text-xl font-medium text-blue-900 dark:text-blue-100 mb-2">
            Getting Started with Assignments
          </h4>
          <ul className="md:text-md text-blue-800 dark:text-blue-200 space-y-1 ">
            <li>• Your instructors will assign tasks that appear here</li>
            <li>
              • Complete assignments to earn points and improve your skills
            </li>
            <li>• Participate in peer evaluations to help others and learn</li>
          </ul>
        </div>
      )}

      {state.user?.userRole === "teacher" && assignments.length === 0 && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            Teacher Dashboard
          </h4>
          <p className="text-xs text-green-800 dark:text-green-200">
            Create and manage assignments for your students. Use the assignment
            creation tools to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentAssignments;
