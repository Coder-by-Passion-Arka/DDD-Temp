// import React, { useState } from "react";
// import { ArrowLeft, User, Layers } from "lucide-react";
// import SkillSuggestionModal from "../components/SkillSuggestionModal";
// import { useSkillSuggestion } from "../hooks/useSkillSuggestion";

// interface Assignment {
//   id: number;
//   title: string;
//   subject: string;
//   date: string;
//   assignedBy: string;
//   description?: string;
//   tags?: string[];
// }

// const AssignmentPage: React.FC = () => {
//   // Mock user skills - in real app, this would come from user context/profile
//   const [userSkills, setUserSkills] = useState<string[]>([
//     "JavaScript",
//     "React",
//     "Node.js",
//     "Python",
//   ]);

//   const [submittedAssignments, setSubmittedAssignments] = useState<
//     Assignment[]
//   >([
//     {
//       id: 1,
//       title: "React Dashboard Development",
//       subject: "Web Development",
//       date: "2025-06-10",
//       assignedBy: "Dr. Sarah Johnson",
//       description:
//         "Build a responsive dashboard using React, TypeScript, and Tailwind CSS",
//       tags: ["react", "typescript", "tailwind", "dashboard"],
//     },
//     {
//       id: 2,
//       title: "Machine Learning Classification Project",
//       subject: "Data Science",
//       date: "2025-06-09",
//       assignedBy: "Prof. Michael Chen",
//       description:
//         "Implement a classification algorithm using Python and scikit-learn",
//       tags: ["python", "machine-learning", "scikit-learn", "classification"],
//     },
//   ]);

//   const [checkedAssignments, setCheckedAssignments] = useState<Assignment[]>([
//     {
//       id: 3,
//       title: "Docker Containerization Lab",
//       subject: "DevOps",
//       date: "2025-06-05",
//       assignedBy: "Dr. Emily Rodriguez",
//       description:
//         "Containerize a Node.js application using Docker and Docker Compose",
//       tags: ["docker", "nodejs", "containerization", "devops"],
//     },
//   ]);

//   // Skill suggestion hook
//   const skillSuggestion = useSkillSuggestion({
//     userSkills,
//     onSkillsAdded: (newSkills) => {
//       setUserSkills((prev) => [...prev, ...newSkills]);
//       console.log("Added skills to profile:", newSkills);
//       // Here you would typically update the user's profile in your backend
//     },
//   });

//   const handleMarkAsChecked = (assignment: Assignment) => {
//     setSubmittedAssignments((prev) =>
//       prev.filter((item) => item.id !== assignment.id)
//     );
//     setCheckedAssignments((prev) => [...prev, assignment]);

//     // Trigger skill suggestion after marking as checked (simulating assignment completion)
//     skillSuggestion.triggerSkillSuggestion({
//       id: assignment.id.toString(),
//       title: assignment.title,
//       description: assignment.description,
//       tags: assignment.tags,
//     });
//   };

//   const handleMarkAsUnchecked = (assignment: Assignment) => {
//     setCheckedAssignments((prev) =>
//       prev.filter((item) => item.id !== assignment.id)
//     );
//     setSubmittedAssignments((prev) => [...prev, assignment]);
//   };

//   return (
//     <div className="p-4 sm:p-6 bg-gray-100 min-h-screen bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 border-2 dark:border-gray-500/20 rounded-xl">
//       {/* Header */}
//       <div className="mb-6 sm:mb-8">
//         <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-3 text-center ">
//           <span>
//             <Layers className="w-8 h-8
//             text-green-400 dark:text-green-500/80 inline-block" />{" "}
//             Assignments Dashboard
//           </span>
//         </div>
//         <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 text-center">
//           Manage your submitted and reviewed assignments
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//         {/* Submitted Section */}
//         <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md dark:bg-gray-800 border-2 dark:border-gray-500/20">
//           <h2 className="text-lg sm:text-xl font-semibold mb-4 dark:text-white">
//             📩 Assignments Submitted by You
//           </h2>
//           {submittedAssignments.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-gray-500 dark:text-gray-400 mb-4">
//                 No submitted assignments.
//               </p>
//               <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
//                 <span className="text-2xl">📝</span>
//               </div>
//             </div>
//           ) : (
//             <ul className="space-y-3">
//               {submittedAssignments.map((assignment) => (
//                 <li
//                   key={assignment.id}
//                   className="flex flex-col p-3 sm:p-4 border rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:dark:bg-gray-700/90 transition duration-200 space-y-3"
//                 >
//                   <div className="flex-1">
//                     <h3 className="font-medium dark:text-white text-sm sm:text-base">
//                       {assignment.title}
//                     </h3>
//                     <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
//                       {assignment.subject} — {assignment.date}
//                     </p>
//                     {assignment.description && (
//                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                         {assignment.description}
//                       </p>
//                     )}
//                     <div className="flex items-center space-x-1 mt-1">
//                       <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
//                       <p className="text-xs text-gray-500 dark:text-gray-400">
//                         Assigned by: {assignment.assignedBy}
//                       </p>
//                     </div>
//                     {assignment.tags && (
//                       <div className="flex flex-wrap gap-1 mt-2">
//                         {assignment.tags.map((tag, index) => (
//                           <span
//                             key={index}
//                             className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs"
//                           >
//                             {tag}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                   <button
//                     onClick={() => handleMarkAsChecked(assignment)}
//                     className="bg-blue-500 px-3 py-2 rounded hover:bg-blue-600 text-sm text-white transition-colors duration-200 w-full"
//                   >
//                     Mark as Checked
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         {/* Checked Section */}
//         <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md dark:bg-gray-800 border-2 dark:border-gray-500/20">
//           <h2 className="text-lg sm:text-xl font-semibold mb-4 dark:text-white">
//             ✅ Assignments You Checked
//           </h2>
//           {checkedAssignments.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-gray-500 dark:text-gray-400 mb-4">
//                 No checked assignments.
//               </p>
//               <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
//                 <span className="text-2xl">✅</span>
//               </div>
//             </div>
//           ) : (
//             <ul className="space-y-3">
//               {checkedAssignments.map((assignment) => (
//                 <li
//                   key={assignment.id}
//                   className="flex flex-col p-3 sm:p-4 border rounded-lg bg-green-50 dark:bg-green-900/30 dark:border-green-500/50 space-y-3"
//                 >
//                   <div className="flex-1">
//                     <h3 className="font-medium dark:text-white text-sm sm:text-base">
//                       {assignment.title}
//                     </h3>
//                     <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
//                       {assignment.subject} — {assignment.date}
//                     </p>
//                     {assignment.description && (
//                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                         {assignment.description}
//                       </p>
//                     )}
//                     <div className="flex items-center space-x-1 mt-1">
//                       <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
//                       <p className="text-xs text-gray-500 dark:text-gray-400">
//                         Assigned by: {assignment.assignedBy}
//                       </p>
//                     </div>
//                     {assignment.tags && (
//                       <div className="flex flex-wrap gap-1 mt-2">
//                         {assignment.tags.map((tag, index) => (
//                           <span
//                             key={index}
//                             className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full text-xs"
//                           >
//                             {tag}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
//                     <span className="text-green-700 font-semibold text-sm dark:text-green-300 text-center sm:text-left flex-1">
//                       ✅ Checked
//                     </span>
//                     <button
//                       onClick={() => handleMarkAsUnchecked(assignment)}
//                       className="flex items-center justify-center space-x-1 bg-gray-500 hover:bg-gray-600 px-3 py-2 rounded text-sm text-white transition-colors duration-200 w-full sm:w-auto"
//                     >
//                       <ArrowLeft className="w-3 h-3" />
//                       <span>Move Back</span>
//                     </button>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>

//       {/* Skill Suggestion Modal */}
//       <SkillSuggestionModal
//         isOpen={skillSuggestion.isModalOpen}
//         onClose={skillSuggestion.handleCloseModal}
//         suggestedSkills={
//           skillSuggestion.currentSuggestion?.suggestedSkills || []
//         }
//         assignmentTitle={
//           skillSuggestion.currentSuggestion?.assignmentTitle || ""
//         }
//         onAddSkills={skillSuggestion.handleAddSkills}
//       />
//     </div>
//   );
// };

// export default AssignmentPage;

// ================================================== //
 
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  // ArrowLeft,
  User,
  Layers,
  Loader2,
  Plus,
  BookOpen,
  Users,
  // Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Target,
  Eye,
  // Upload,
  Calendar,
  BarChart3,
  // Award,
  Shuffle,
} from "lucide-react";
import SkillSuggestionModal from "../components/SkillSuggestionModal";
import { useSkillSuggestion } from "../hooks/useSkillSuggestion";
import { useAuth } from "../contexts/AuthContext";
// import { apiService } from "../services/api";

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  createdAt: string;
  status: "draft" | "published" | "closed" | "evaluation_phase" | "completed";
  tags: string[];
  maxScore: number;
  instructorId: string;
  instructor?: {
    userName: string;
    userEmail: string;
  };

  // Submission tracking
  submissionStats: {
    totalSubmissions: number;
    submittedCount: number;
    pendingCount: number;
    lateCount: number;
  };

  // Evaluation tracking
  evaluationStats: {
    totalEvaluations: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    averageScore?: number;
  };

  // User-specific data
  userSubmission?: {
    _id: string;
    status:
      | "draft"
      | "submitted"
      | "under_evaluation"
      | "evaluated"
      | "finalized";
    submittedAt?: string;
    score?: number;
    grade?: string;
    feedback?: string;
  };

  userEvaluations?: Array<{
    _id: string;
    status: "assigned" | "in_progress" | "submitted" | "reviewed";
    dueDate: string;
    submitterName: string;
  }>;
}

interface AssignmentData {
  myAssignments: Assignment[]; // Student view
  createdAssignments: Assignment[]; // Teacher view
  evaluationQueue: Assignment[]; // Assignments needing evaluation setup
}

const AssignmentPage: React.FC = () => {
  const { state, updateProfile } = useAuth();
  const [userSkills, setUserSkills] = useState<string[]>(
    state.user?.userSkills || []
  );
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    myAssignments: [],
    createdAssignments: [],
    evaluationQueue: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("my_assignments");
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showEvaluationSetup, setShowEvaluationSetup] = useState(false);

  const userRole = state.user?.userRole || "student";

  // Skill suggestion hook
  const skillSuggestion = useSkillSuggestion({
    userSkills,
    onSkillsAdded: async (newSkills) => {
      const updatedSkills = [...userSkills, ...newSkills];
      setUserSkills(updatedSkills);

      try {
        await updateProfile({ userSkills: updatedSkills });
        console.log("Added skills to profile:", newSkills);
      } catch (error) {
        console.error("Failed to update skills in profile:", error);
      }
    },
  });

  useEffect(() => {
    if (state.user?.userSkills) {
      setUserSkills(state.user.userSkills);
    }
  }, [state.user]);

  useEffect(() => {
    fetchAssignments();
  }, [state.user, userRole]);

  const fetchAssignments = async () => {
    if (!state.user) return;

    try {
      setIsLoading(true);

      // Mock data based on user role
      let mockData: AssignmentData;

      switch (userRole) {
        case "teacher":
          mockData = {
            myAssignments: [],
            createdAssignments: [
              {
                _id: "assign1",
                title: "React Component Architecture",
                subject: "Web Development",
                description:
                  "Design and implement a scalable React component system with proper state management and performance optimization.",
                dueDate: "2025-07-20T23:59:59Z",
                createdAt: "2025-07-01T10:00:00Z",
                status: "evaluation_phase",
                tags: ["react", "javascript", "frontend", "architecture"],
                maxScore: 100,
                instructorId: state.user._id,
                instructor: {
                  userName: state.user.userName,
                  userEmail: state.user.userEmail,
                },
                submissionStats: {
                  totalSubmissions: 25,
                  submittedCount: 23,
                  pendingCount: 2,
                  lateCount: 1,
                },
                evaluationStats: {
                  totalEvaluations: 46,
                  completedEvaluations: 18,
                  pendingEvaluations: 28,
                  averageScore: 85.2,
                },
              },
              {
                _id: "assign2",
                title: "Database Optimization Strategies",
                subject: "Database Systems",
                description:
                  "Analyze and propose optimization strategies for large-scale database systems.",
                dueDate: "2025-07-25T23:59:59Z",
                createdAt: "2025-07-05T14:30:00Z",
                status: "published",
                tags: ["database", "sql", "performance", "optimization"],
                maxScore: 100,
                instructorId: state.user._id,
                submissionStats: {
                  totalSubmissions: 30,
                  submittedCount: 15,
                  pendingCount: 15,
                  lateCount: 0,
                },
                evaluationStats: {
                  totalEvaluations: 0,
                  completedEvaluations: 0,
                  pendingEvaluations: 0,
                },
              },
            ],
            evaluationQueue: [
              {
                _id: "assign1",
                title: "React Component Architecture",
                subject: "Web Development",
                description: "Ready for peer evaluation assignment",
                dueDate: "2025-07-20T23:59:59Z",
                createdAt: "2025-07-01T10:00:00Z",
                status: "closed",
                tags: ["react", "javascript"],
                maxScore: 100,
                instructorId: state.user._id,
                submissionStats: {
                  totalSubmissions: 25,
                  submittedCount: 23,
                  pendingCount: 0,
                  lateCount: 2,
                },
                evaluationStats: {
                  totalEvaluations: 0,
                  completedEvaluations: 0,
                  pendingEvaluations: 0,
                },
              },
            ],
          };
          break;

        case "admin":
          mockData = {
            myAssignments: [],
            createdAssignments: [
              {
                _id: "admin1",
                title: "Platform Usage Analysis",
                subject: "System Administration",
                description:
                  "Comprehensive analysis of platform usage metrics and user engagement patterns.",
                dueDate: "2025-07-30T23:59:59Z",
                createdAt: "2025-07-10T09:00:00Z",
                status: "published",
                tags: ["analytics", "reporting", "admin"],
                maxScore: 100,
                instructorId: state.user._id,
                submissionStats: {
                  totalSubmissions: 10,
                  submittedCount: 3,
                  pendingCount: 7,
                  lateCount: 0,
                },
                evaluationStats: {
                  totalEvaluations: 0,
                  completedEvaluations: 0,
                  pendingEvaluations: 0,
                },
              },
            ],
            evaluationQueue: [],
          };
          break;

        default: // student
          mockData = {
            myAssignments: [
              {
                _id: "assign1",
                title: "React Component Architecture",
                subject: "Web Development",
                description:
                  "Design and implement a scalable React component system with proper state management.",
                dueDate: "2025-07-20T23:59:59Z",
                createdAt: "2025-07-01T10:00:00Z",
                status: "evaluation_phase",
                tags: ["react", "javascript", "frontend", "architecture"],
                maxScore: 100,
                instructorId: "teacher1",
                instructor: {
                  userName: "Dr. Sarah Johnson",
                  userEmail: "sarah.johnson@university.edu",
                },
                submissionStats: {
                  totalSubmissions: 25,
                  submittedCount: 23,
                  pendingCount: 2,
                  lateCount: 1,
                },
                evaluationStats: {
                  totalEvaluations: 46,
                  completedEvaluations: 18,
                  pendingEvaluations: 28,
                },
                userSubmission: {
                  _id: "sub1",
                  status: "under_evaluation",
                  submittedAt: "2025-07-18T16:30:00Z",
                },
                userEvaluations: [
                  {
                    _id: "eval1",
                    status: "assigned",
                    dueDate: "2025-07-22T23:59:59Z",
                    submitterName: "Anonymous Student A",
                  },
                  {
                    _id: "eval2",
                    status: "in_progress",
                    dueDate: "2025-07-22T23:59:59Z",
                    submitterName: "Anonymous Student B",
                  },
                ],
              },
              {
                _id: "assign2",
                title: "Database Optimization Strategies",
                subject: "Database Systems",
                description:
                  "Analyze and propose optimization strategies for large-scale database systems.",
                dueDate: "2025-07-25T23:59:59Z",
                createdAt: "2025-07-05T14:30:00Z",
                status: "published",
                tags: ["database", "sql", "performance", "optimization"],
                maxScore: 100,
                instructorId: "teacher2",
                instructor: {
                  userName: "Prof. Michael Chen",
                  userEmail: "michael.chen@university.edu",
                },
                submissionStats: {
                  totalSubmissions: 30,
                  submittedCount: 15,
                  pendingCount: 15,
                  lateCount: 0,
                },
                evaluationStats: {
                  totalEvaluations: 0,
                  completedEvaluations: 0,
                  pendingEvaluations: 0,
                },
                userSubmission: {
                  _id: "sub2",
                  status: "draft",
                },
                userEvaluations: [],
              },
              {
                _id: "assign3",
                title: "Machine Learning Model Implementation",
                subject: "Data Science",
                description:
                  "Implement and evaluate a machine learning model for classification tasks.",
                dueDate: "2025-07-15T23:59:59Z",
                createdAt: "2025-06-20T12:00:00Z",
                status: "completed",
                tags: [
                  "machine-learning",
                  "python",
                  "classification",
                  "data-science",
                ],
                maxScore: 100,
                instructorId: "teacher3",
                instructor: {
                  userName: "Dr. Emily Rodriguez",
                  userEmail: "emily.rodriguez@university.edu",
                },
                submissionStats: {
                  totalSubmissions: 22,
                  submittedCount: 22,
                  pendingCount: 0,
                  lateCount: 3,
                },
                evaluationStats: {
                  totalEvaluations: 44,
                  completedEvaluations: 44,
                  pendingEvaluations: 0,
                  averageScore: 87.5,
                },
                userSubmission: {
                  _id: "sub3",
                  status: "finalized",
                  submittedAt: "2025-07-14T20:15:00Z",
                  score: 92,
                  grade: "A",
                  feedback:
                    "Excellent implementation with innovative approaches to the classification problem.",
                },
                userEvaluations: [
                  {
                    _id: "eval3",
                    status: "submitted",
                    dueDate: "2025-07-18T23:59:59Z",
                    submitterName: "Anonymous Student C",
                  },
                ],
              },
            ],
            createdAssignments: [],
            evaluationQueue: [],
          };
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setAssignmentData(mockData);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError("Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAssignment = async (
    assignmentId: string,
    submissionData: any
  ) => {
    try {
      // TODO: Submit assignment
      /*
      await apiService.post(`/assignments/${assignmentId}/submit`, submissionData);
      */

      console.log("Submitting assignment:", submissionData);

      // Update local state
      setAssignmentData((prev) => ({
        ...prev,
        myAssignments: prev.myAssignments.map((assignment) =>
          assignment._id === assignmentId
            ? {
                ...assignment,
                userSubmission: {
                  _id: "new_sub",
                  status: "submitted",
                  submittedAt: new Date().toISOString(),
                },
              }
            : assignment
        ),
      }));

      // Trigger skill suggestion
      const assignment = assignmentData.myAssignments.find(
        (a) => a._id === assignmentId
      );
      if (assignment) {
        skillSuggestion.triggerSkillSuggestion({
          id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          tags: assignment.tags,
        });
      }

      setShowSubmissionModal(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setError("Failed to submit assignment");
    }
  };

  const handleTriggerEvaluations = async (assignmentId: string) => {
    try {
      // TODO: Trigger peer evaluation assignment
      /*
      await apiService.post(`/assignments/${assignmentId}/trigger-evaluations`);
      */

      console.log("Triggering peer evaluations for assignment:", assignmentId);

      // Update local state
      setAssignmentData((prev) => ({
        ...prev,
        createdAssignments: prev.createdAssignments.map((assignment) =>
          assignment._id === assignmentId
            ? { ...assignment, status: "evaluation_phase" }
            : assignment
        ),
        evaluationQueue: prev.evaluationQueue.filter(
          (assignment) => assignment._id !== assignmentId
        ),
      }));

      setShowEvaluationSetup(false);
    } catch (error) {
      console.error("Error triggering evaluations:", error);
      setError("Failed to trigger peer evaluations");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText className="w-5 h-5 text-gray-500" />;
      case "published":
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case "closed":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "evaluation_phase":
        return <Users className="w-5 h-5 text-purple-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      published:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      closed:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      evaluation_phase:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    );
  };

  const getDaysRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderAssignmentCard = (
    assignment: Assignment,
    type: "student" | "teacher" | "admin"
  ) => {
    const daysRemaining = getDaysRemaining(assignment.dueDate);
    const isOverdue = daysRemaining < 0;
    const isUrgent = daysRemaining <= 2 && daysRemaining >= 0;

    return (
      <motion.div
        key={assignment._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl shadow-md p-6 border-l-4 hover:shadow-xl transition-all duration-300 dark:bg-gray-800 ${
          isOverdue
            ? "border-red-500"
            : isUrgent
            ? "border-amber-500"
            : "border-indigo-500"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {assignment.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {assignment.subject}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              {type === "student" && assignment.instructor && (
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{assignment.instructor.userName}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{assignment.maxScore} points</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(assignment.status)}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  assignment.status
                )}`}
              >
                {assignment.status.replace("_", " ").toUpperCase()}
              </span>
            </div>

            {daysRemaining >= 0 && assignment.status === "published" && (
              <div
                className={`text-xs px-2 py-1 rounded ${
                  isUrgent
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {daysRemaining === 0
                  ? "Due today"
                  : `${daysRemaining} days left`}
              </div>
            )}

            {isOverdue && assignment.status === "published" && (
              <div className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {Math.abs(daysRemaining)} days overdue
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {assignment.description}
        </p>

        {/* Tags */}
        {assignment.tags && assignment.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {assignment.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Student-specific content */}
        {type === "student" && (
          <div className="space-y-3">
            {/* Submission Status */}
            {assignment.userSubmission && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Submission
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      assignment.userSubmission.status
                    )}`}
                  >
                    {assignment.userSubmission.status
                      .replace("_", " ")
                      .toUpperCase()}
                  </span>
                </div>

                {assignment.userSubmission.submittedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Submitted:{" "}
                    {new Date(
                      assignment.userSubmission.submittedAt
                    ).toLocaleDateString()}
                  </p>
                )}

                {assignment.userSubmission.score !== undefined && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Score:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {assignment.userSubmission.score}/{assignment.maxScore}
                      </span>
                      {assignment.userSubmission.grade && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 rounded text-xs font-medium">
                          {assignment.userSubmission.grade}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {assignment.userSubmission.feedback && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                    "{assignment.userSubmission.feedback}"
                  </p>
                )}
              </div>
            )}

            {/* Evaluation Assignments */}
            {assignment.userEvaluations &&
              assignment.userEvaluations.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                    Your Evaluation Tasks ({assignment.userEvaluations.length})
                  </h4>
                  <div className="space-y-1">
                    {assignment.userEvaluations.map((evaluation, index) => (
                      <div
                        key={evaluation._id}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="text-purple-600 dark:text-purple-400">
                          {evaluation.submitterName}
                        </span>
                        <span
                          className={`px-2 py-1 rounded ${getStatusColor(
                            evaluation.status
                          )}`}
                        >
                          {evaluation.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created: {new Date(assignment.createdAt).toLocaleDateString()}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setSelectedAssignment(assignment)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  View Details
                </button>

                {assignment.status === "published" &&
                  (!assignment.userSubmission ||
                    assignment.userSubmission.status === "draft") && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmissionModal(true);
                      }}
                      className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Submit Assignment
                    </button>
                  )}

                {assignment.userEvaluations &&
                  assignment.userEvaluations.some(
                    (evaluations) =>
                      evaluations.status === "assigned" ||
                      evaluations.status === "in_progress"
                  ) && (
                    <button
                      onClick={() => (window.location.href = "/evaluations")}
                      className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Complete Evaluations
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Teacher-specific content */}
        {(type === "teacher" || type === "admin") && (
          <div className="space-y-3">
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Submissions
                </h4>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <div>
                    Total: {assignment.submissionStats.totalSubmissions}
                  </div>
                  <div>
                    Submitted: {assignment.submissionStats.submittedCount}
                  </div>
                  <div>Pending: {assignment.submissionStats.pendingCount}</div>
                  {assignment.submissionStats.lateCount > 0 && (
                    <div className="text-red-600 dark:text-red-400">
                      Late: {assignment.submissionStats.lateCount}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Evaluations
                </h4>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  <div>
                    Total: {assignment.evaluationStats.totalEvaluations}
                  </div>
                  <div>
                    Completed: {assignment.evaluationStats.completedEvaluations}
                  </div>
                  <div>
                    Pending: {assignment.evaluationStats.pendingEvaluations}
                  </div>
                  {assignment.evaluationStats.averageScore && (
                    <div className="font-medium">
                      Avg: {assignment.evaluationStats.averageScore.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created: {new Date(assignment.createdAt).toLocaleDateString()}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setSelectedAssignment(assignment)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  View Details
                </button>

                <button
                  onClick={() =>
                    (window.location.href = `/assignments/${assignment._id}/manage`)
                  }
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Manage
                </button>

                {assignment.status === "closed" &&
                  assignment.submissionStats.submittedCount >= 2 && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowEvaluationSetup(true);
                      }}
                      className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                    >
                      <Shuffle className="w-4 h-4 inline mr-1" />
                      Setup Evaluations
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading assignments...
          </p>
        </div>
      </div>
    );
  }

  const renderRoleSpecificContent = () => {
    switch (userRole) {
      case "teacher":
        return renderTeacherView();
      case "admin":
        return renderAdminView();
      default:
        return renderStudentView();
    }
  };

  const renderStudentView = () => (
    <div className="space-y-6">
      {assignmentData.myAssignments.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Assignments Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your assignments will appear here once your instructors create them.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignmentData.myAssignments.map((assignment) =>
            renderAssignmentCard(assignment, "student")
          )}
        </div>
      )}
    </div>
  );

  const renderTeacherView = () => (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            {
              key: "created",
              label: "📚 My Assignments",
              count: assignmentData.createdAssignments.length,
            },
            {
              key: "evaluation_queue",
              label: "⚡ Setup Evaluations",
              count: assignmentData.evaluationQueue.length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Teacher Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => (window.location.href = "/assignments/create")}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
          <button
            onClick={() => (window.location.href = "/evaluations")}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Review Evaluations</span>
          </button>
          <button
            onClick={() => (window.location.href = "/students")}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Student Analytics</span>
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "created" && (
        <div className="space-y-6">
          {assignmentData.createdAssignments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Assignments Created
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start by creating your first assignment for students.
              </p>
              <button
                onClick={() => (window.location.href = "/assignments/create")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Assignment
              </button>
            </div>
          ) : (
            assignmentData.createdAssignments.map((assignment) =>
              renderAssignmentCard(assignment, "teacher")
            )
          )}
        </div>
      )}

      {activeTab === "evaluation_queue" && (
        <div className="space-y-6">
          {assignmentData.evaluationQueue.length === 0 ? (
            <div className="text-center py-12">
              <Shuffle className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Assignments Ready for Evaluation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Assignments will appear here when the submission deadline has
                passed and peer evaluations can be set up.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <h4 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
                  Ready for Peer Evaluation Setup
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  These assignments have closed for submissions and are ready
                  for peer evaluation assignment using our graph coloring
                  algorithm.
                </p>
              </div>
              {assignmentData.evaluationQueue.map((assignment) =>
                renderAssignmentCard(assignment, "teacher")
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAdminView = () => (
    <div className="space-y-6">
      {/* Admin Overview */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">
          Administrator Assignment Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 dark:text-white">
              System Assignments
            </h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {assignmentData.createdAssignments.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Active Evaluations
            </h4>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              156
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Platform Health
            </h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              98%
            </p>
          </div>
        </div>
      </div>

      {/* Admin Assignments */}
      <div className="space-y-6">
        {assignmentData.createdAssignments.map((assignment) =>
          renderAssignmentCard(assignment, "admin")
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 border-2 dark:border-gray-500/20 rounded-xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-3 text-center">
          <span>
            <Layers className="w-8 h-8 text-green-400 dark:text-green-500/80 inline-block" />{" "}
            {userRole === "teacher"
              ? "Assignment Management Dashboard"
              : userRole === "admin"
              ? "System Assignment Overview"
              : "My Assignments & Peer Evaluations"}
          </span>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 text-center">
          {userRole === "teacher"
            ? "Create assignments and manage peer evaluation workflows"
            : userRole === "admin"
            ? "Monitor platform-wide assignment and evaluation activities"
            : "Complete assignments and participate in peer evaluations"}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {renderRoleSpecificContent()}

      {/* Submission Modal */}
      {showSubmissionModal && selectedAssignment && (
        <SubmissionModal
          assignment={selectedAssignment}
          onSubmit={handleSubmitAssignment}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedAssignment(null);
          }}
        />
      )}

      {/* Evaluation Setup Modal */}
      {showEvaluationSetup && selectedAssignment && (
        <EvaluationSetupModal
          assignment={selectedAssignment}
          onSetup={handleTriggerEvaluations}
          onClose={() => {
            setShowEvaluationSetup(false);
            setSelectedAssignment(null);
          }}
        />
      )}

      {/* Skill Suggestion Modal (for students only) */}
      {userRole === "student" && (
        <SkillSuggestionModal
          isOpen={skillSuggestion.isModalOpen}
          onClose={skillSuggestion.handleCloseModal}
          suggestedSkills={
            skillSuggestion.currentSuggestion?.suggestedSkills || []
          }
          assignmentTitle={
            skillSuggestion.currentSuggestion?.assignmentTitle || ""
          }
          onAddSkills={skillSuggestion.handleAddSkills}
        />
      )}
    </div>
  );
};

// Submission Modal Component
const SubmissionModal: React.FC<{
  assignment: Assignment;
  onSubmit: (assignmentId: string, data: any) => void;
  onClose: () => void;
}> = ({ assignment, onSubmit, onClose }) => {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("Please provide submission content");
      return;
    }

    onSubmit(assignment._id, {
      content,
      attachments: attachments.map((file) => ({
        filename: file.name,
        size: file.size,
        mimetype: file.type,
      })),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Submit Assignment
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {assignment.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Submission Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your assignment submission content..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attachments (Optional)
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setAttachments(Array.from(e.target.files || []))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

// Evaluation Setup Modal Component
const EvaluationSetupModal: React.FC<{
  assignment: Assignment;
  onSetup: (assignmentId: string) => void;
  onClose: () => void;
}> = ({ assignment, onSetup, onClose }) => {
  const [settings, setSettings] = useState({
    evaluationsPerSubmission: 2,
    maxEvaluationsPerUser: 3,
    evaluationDeadlineDays: 7,
    allowSelfEvaluation: false,
    randomizeAssignment: true,
    balanceWorkload: true,
  });

  const handleSetup = () => {
    onSetup(assignment._id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Setup Peer Evaluations
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {assignment.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Graph Coloring Assignment
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Our advanced algorithm will automatically assign peer evaluations
              using graph coloring theory to ensure optimal distribution while
              avoiding conflicts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Evaluations per Submission
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.evaluationsPerSubmission}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    evaluationsPerSubmission: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Evaluations per User
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxEvaluationsPerUser}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maxEvaluationsPerUser: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Evaluation Deadline (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.evaluationDeadlineDays}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    evaluationDeadlineDays: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.randomizeAssignment}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    randomizeAssignment: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Randomize assignment within workload groups
              </span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.balanceWorkload}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    balanceWorkload: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Balance workload across evaluators
              </span>
            </label>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Assignment Summary
            </h4>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <div>
                • {assignment.submissionStats.submittedCount} submissions ready
                for evaluation
              </div>
              <div>
                •{" "}
                {assignment.submissionStats.submittedCount *
                  settings.evaluationsPerSubmission}{" "}
                total evaluations will be created
              </div>
              <div>
                • Each student will evaluate {settings.evaluationsPerSubmission}{" "}
                peers (max {settings.maxEvaluationsPerUser})
              </div>
              <div>
                • Evaluations due in {settings.evaluationDeadlineDays} days
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSetup}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Setup Peer Evaluations
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assignment;
