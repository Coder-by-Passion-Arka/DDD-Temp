// import React from 'react';
// import { motion } from 'framer-motion';
// import {BookOpenCheck  } from "lucide-react";

// const evaluations = [
//   { subject: 'Mathematics', score: 92, grade: 'A+', feedback: 'Excellent problem-solving skills.' },
//   { subject: 'Physics', score: 85, grade: 'A', feedback: 'Very good understanding of concepts.' },
//   { subject: 'English', score: 78, grade: 'B+', feedback: 'Good writing skills but improve grammar.' },
// ];

// const Evaluation: React.FC = () => {
//   return (
//     <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-purple-100 dark:from-purple-600 dark:to-slate-800 min-h-screen rounded-xl">
//       {/* Header */}
//       <div className="mb-6 sm:mb-8 lg:mb-10">
//         <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-indigo-800 dark:text-blue-300 mb-2 sm:mb-3">
//           <BookOpenCheck  className="w-6 h-6 sm:w-7 sm:h-7 inline-block mr-2"/> Evaluation Report
//         </div>
//         <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 text-center">
//           Review your academic performance and feedback
//         </p>
//       </div>
//       {/* Performance Cards */}
//       <div className="grid gap-4 sm:gap-6 max-w-5xl mx-auto">
//         {evaluations.map((evaluation, idx) => (
//           <motion.div
//             key={idx}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: idx * 0.2 }}
//             className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border-l-4 border-indigo-500 dark:border-white hover:shadow-xl transition ease-in-out delay-150 duration-300 dark:bg-indigo-100/30 hover:border-slate-500/30 dark:hover:shadow-lg dark:hover:shadow-gray-900/50"
//           >
//             <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
//               <div className="flex-1">
//                 <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 dark:text-white mb-2">
//                   {evaluation.subject}
//                 </h2>
//                 <div className="space-y-1 sm:space-y-2">
//                   <p className="text-sm sm:text-base text-gray-600 dark:text-white">
//                     Grade:{" "}
//                     <span className="font-semibold text-lg">
//                       {evaluation.grade}
//                     </span>
//                   </p>
//                   <p className="text-sm sm:text-base text-gray-600 dark:text-white">
//                     Score:{" "}
//                     <span className="font-semibold text-lg">
//                       {evaluation.score}/100
//                     </span>
//                   </p>
//                 </div>
//               </div>

//               {/* Score Circle */}
//               <div className="flex-shrink-0 self-center sm:self-start">
//                 <div className="relative w-16 h-16 sm:w-20 sm:h-20">
//                   <svg
//                     className="w-full h-full transform -rotate-90"
//                     viewBox="0 0 36 36"
//                   >
//                     <path
//                       className="text-gray-200 dark:text-gray-600"
//                       stroke="currentColor"
//                       strokeWidth="3"
//                       fill="none"
//                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                     />
//                     <path
//                       className="text-indigo-500"
//                       stroke="currentColor"
//                       strokeWidth="3"
//                       strokeDasharray={`${evaluation.score}, 100`}
//                       strokeLinecap="round"
//                       fill="none"
//                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                     />
//                   </svg>
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
//                       {evaluation.score}%
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
//               <p className="text-sm sm:text-base text-gray-700 italic dark:text-white">
//                 <span className="font-medium">Feedback:</span> "
//                 {evaluation.feedback}"
//               </p>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Evaluation;

// ========================================================== // 

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
// import { BookOpenCheck } from "lucide-react";
import {
  BookOpenCheck,
  Loader2,
  Clock,
  User,
  Star,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Calendar,
  Target,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";  
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

interface EvaluationScore {
  criteriaName: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

interface Evaluation {
  _id: string;
  assignmentId: string;
  submitterId: string;
  evaluatorId: string;
  submissionId: string;
  scores: EvaluationScore[];
  totalScore: number;
  maxTotalScore: number;
  overallFeedback: string;
  grade?: string;
  evaluationType: "peer" | "instructor" | "self";
  status: "assigned" | "in_progress" | "submitted" | "reviewed" | "finalized";
  assignedAt: string;
  startedAt?: string;
  submittedAt?: string;
  dueDate: string;
  isAnonymous: boolean;
  assignmentMetadata: {
    colorGroup: number;
    assignmentRound: number;
    priority: number;
  };
  // Populated fields
  assignment?: {
    title: string;
    subject: string;
    description: string;
  };
  submitter?: {
    userName: string;
    userEmail: string;
  };
  evaluator?: {
    userName: string;
    userEmail: string;
  };
  submission?: {
    content: string;
    attachments: Array<{
      filename: string;
      url: string;
      mimetype: string;
    }>;
  };
}

interface EvaluationData {
  toEvaluate: Evaluation[];
  completed: Evaluation[];
  received: Evaluation[];
}

const EvaluationPage: React.FC = () => {
  const { state } = useAuth();
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    toEvaluate: [],
    completed: [],
    received: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "to_evaluate" | "completed" | "received"
  >("to_evaluate");
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<Evaluation | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  const userRole = state.user?.userRole || "student";

  useEffect(() => {
    fetchEvaluations();
  }, [state.user]);

  const fetchEvaluations = async () => {
    if (!state.user) return;

    try {
      setIsLoading(true);

      // Mock data for demonstration
      const mockData: EvaluationData = {
        toEvaluate: [
          {
            _id: "eval1",
            assignmentId: "assign1",
            submitterId: "user2",
            evaluatorId: state.user._id,
            submissionId: "sub1",
            scores: [],
            totalScore: 0,
            maxTotalScore: 100,
            overallFeedback: "",
            evaluationType: "peer",
            status: "assigned",
            assignedAt: "2025-07-01T10:00:00Z",
            dueDate: "2025-07-08T23:59:59Z",
            isAnonymous: true,
            assignmentMetadata: {
              colorGroup: 1,
              assignmentRound: 1,
              priority: 0,
            },
            assignment: {
              title: "React Component Architecture",
              subject: "Web Development",
              description:
                "Design and implement a scalable React component system",
            },
            submitter: {
              userName: "Anonymous Student",
              userEmail: "anonymous@example.com",
            },
            submission: {
              content:
                "This is a comprehensive analysis of React component architecture patterns...",
              attachments: [
                {
                  filename: "component-diagram.png",
                  url: "/uploads/component-diagram.png",
                  mimetype: "image/png",
                },
              ],
            },
          },
          {
            _id: "eval2",
            assignmentId: "assign2",
            submitterId: "user3",
            evaluatorId: state.user._id,
            submissionId: "sub2",
            scores: [],
            totalScore: 0,
            maxTotalScore: 100,
            overallFeedback: "",
            evaluationType: "peer",
            status: "in_progress",
            assignedAt: "2025-06-28T14:30:00Z",
            startedAt: "2025-07-02T09:15:00Z",
            dueDate: "2025-07-05T23:59:59Z",
            isAnonymous: true,
            assignmentMetadata: {
              colorGroup: 2,
              assignmentRound: 1,
              priority: 1,
            },
            assignment: {
              title: "Database Optimization Strategies",
              subject: "Database Systems",
              description:
                "Analyze and propose optimization strategies for large-scale databases",
            },
            submitter: {
              userName: "Anonymous Student",
              userEmail: "anonymous@example.com",
            },
            submission: {
              content:
                "Database optimization is crucial for performance in enterprise applications...",
              attachments: [],
            },
          },
        ],
        completed: [
          {
            _id: "eval3",
            assignmentId: "assign3",
            submitterId: "user4",
            evaluatorId: state.user._id,
            submissionId: "sub3",
            scores: [
              {
                criteriaName: "Technical Accuracy",
                score: 85,
                maxScore: 100,
                feedback:
                  "Good understanding of concepts with minor technical errors.",
              },
              {
                criteriaName: "Code Quality",
                score: 90,
                maxScore: 100,
                feedback:
                  "Well-structured and readable code with good practices.",
              },
            ],
            totalScore: 87,
            maxTotalScore: 100,
            overallFeedback:
              "Excellent work overall with good attention to detail. Consider adding more error handling.",
            grade: "A-",
            evaluationType: "peer",
            status: "submitted",
            assignedAt: "2025-06-20T10:00:00Z",
            startedAt: "2025-06-22T14:30:00Z",
            submittedAt: "2025-06-25T16:45:00Z",
            dueDate: "2025-06-27T23:59:59Z",
            isAnonymous: true,
            assignmentMetadata: {
              colorGroup: 3,
              assignmentRound: 1,
              priority: 0,
            },
            assignment: {
              title: "API Design Best Practices",
              subject: "Software Engineering",
              description:
                "Design and document a RESTful API following industry best practices",
            },
            submitter: {
              userName: "Anonymous Student",
              userEmail: "anonymous@example.com",
            },
          },
        ],
        received: [
          {
            _id: "eval4",
            assignmentId: "assign1",
            submitterId: state.user._id,
            evaluatorId: "user5",
            submissionId: "sub4",
            scores: [
              {
                criteriaName: "Innovation",
                score: 92,
                maxScore: 100,
                feedback:
                  "Creative approach to the problem with innovative solutions.",
              },
              {
                criteriaName: "Implementation",
                score: 88,
                maxScore: 100,
                feedback: "Solid implementation with room for optimization.",
              },
            ],
            totalScore: 90,
            maxTotalScore: 100,
            overallFeedback:
              "Outstanding work! Your innovative approach really stands out.",
            grade: "A",
            evaluationType: "peer",
            status: "finalized",
            assignedAt: "2025-06-15T10:00:00Z",
            submittedAt: "2025-06-20T14:30:00Z",
            dueDate: "2025-06-22T23:59:59Z",
            isAnonymous: false,
            assignmentMetadata: {
              colorGroup: 1,
              assignmentRound: 1,
              priority: 0,
            },
            assignment: {
              title: "Machine Learning Model Implementation",
              subject: "Data Science",
              description:
                "Implement and evaluate a machine learning model for classification",
            },
            evaluator: {
              userName:
                userRole === "teacher" || userRole === "admin"
                  ? "Jane Smith"
                  : "Anonymous Peer",
              userEmail: "evaluator@example.com",
            },
          },
        ],
      };

      // TODO: Replace with actual API call
      const response = await apiService.get('/evaluations/user');
      const actualData: EvaluationData = response.data;

      await new Promise((resolve) => setTimeout(resolve, 800));
      setEvaluationData(mockData);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      setError("Failed to load evaluations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEvaluation = async (evaluation: Evaluation) => {
    try {
      // TODO: Update status to in_progress

      await apiService.patch(`/evaluations/${evaluation._id}/start`);

      setSelectedEvaluation(evaluation);
      setShowEvaluationModal(true);

      // Update local state
      setEvaluationData((prev) => ({
              ...prev,
              toEvaluate: prev.toEvaluate.map((evaluationItem) =>
                evaluationItem._id === evaluation._id
                  ? {
                      ...evaluationItem,
                      status: "in_progress",
                      startedAt: new Date().toISOString(),
                    }
                  : evaluationItem
              ),
            }));
    } catch (error) {
      console.error("Error starting evaluation:", error);
      setError("Failed to start evaluation");
    }
  };

  const handleSubmitEvaluation = async (evaluationData: any) => {
    try {
      // TODO: Submit evaluation
      await apiService.patch(`/evaluations/${selectedEvaluation._id}/submit`, evaluationData);

      console.log("Submitting evaluation:", evaluationData);

      // Move evaluation to completed
      if (selectedEvaluation) {
        const updatedEvaluation = {
          ...selectedEvaluation,
          ...evaluationData,
          status: "submitted" as const,
          submittedAt: new Date().toISOString(),
        };

        setEvaluationData((prev) => ({
          ...prev,
          toEvaluate: prev.toEvaluate.filter(
            (evaluationItem) => evaluationItem._id !== selectedEvaluation._id
          ),
          completed: [...prev.completed, updatedEvaluation],
        }));
      }

      setShowEvaluationModal(false);
      setSelectedEvaluation(null);
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      setError("Failed to submit evaluation");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "in_progress":
        return <Edit className="w-5 h-5 text-blue-500" />;
      case "submitted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "reviewed":
        return <Eye className="w-5 h-5 text-purple-500" />;
      case "finalized":
        return <Award className="w-5 h-5 text-emerald-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      assigned:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      in_progress:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      submitted:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      reviewed:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      finalized:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
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

  const renderEvaluationCard = (
    evaluation: Evaluation,
    type: "to_evaluate" | "completed" | "received"
  ) => {
    const daysRemaining = getDaysRemaining(evaluation.dueDate);
    const isOverdue = daysRemaining < 0;
    const isUrgent = daysRemaining <= 2 && daysRemaining >= 0;

    return (
      <motion.div
        key={evaluation._id}
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
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {evaluation.assignment?.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {evaluation.assignment?.subject}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>
                  {type === "received"
                    ? evaluation.evaluator?.userName || "Anonymous Peer"
                    : evaluation.submitter?.userName || "Anonymous Student"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Due: {new Date(evaluation.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(evaluation.status)}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  evaluation.status
                )}`}
              >
                {evaluation.status.replace("_", " ").toUpperCase()}
              </span>
            </div>

            {daysRemaining >= 0 && type === "to_evaluate" && (
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

            {isOverdue && type === "to_evaluate" && (
              <div className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {Math.abs(daysRemaining)} days overdue
              </div>
            )}
          </div>
        </div>

        {evaluation.assignment?.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {evaluation.assignment.description}
          </p>
        )}

        {type === "completed" || type === "received" ? (
          <div className="space-y-3">
            {evaluation.scores.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Evaluation Scores
                </h4>
                <div className="space-y-1">
                  {evaluation.scores.map((score, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {score.criteriaName}
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {score.score}/{score.maxScore}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Score
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {evaluation.totalScore}/{evaluation.maxTotalScore}
                      </span>
                      {evaluation.grade && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 rounded text-sm font-medium">
                          {evaluation.grade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {evaluation.overallFeedback && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Feedback
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 italic">
                  "{evaluation.overallFeedback}"
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {type === "completed" ? "Submitted" : "Received"}:{" "}
                {evaluation.submittedAt
                  ? new Date(evaluation.submittedAt).toLocaleDateString()
                  : "N/A"}
              </span>
              <button className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-sm font-medium">
                View Details →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Assigned: {new Date(evaluation.assignedAt).toLocaleDateString()}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setSelectedEvaluation(evaluation)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                View Submission
              </button>
              <button
                onClick={() => handleStartEvaluation(evaluation)}
                className={`px-4 py-2 text-sm text-white rounded transition-colors ${
                  evaluation.status === "assigned"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {evaluation.status === "assigned"
                  ? "Start Evaluation"
                  : "Continue Evaluation"}
              </button>
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
            Loading evaluations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-purple-100 dark:from-purple-600 dark:to-slate-800 min-h-screen rounded-xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-indigo-800 dark:text-blue-300 mb-2 sm:mb-3">
          <BookOpenCheck className="w-6 h-6 sm:w-7 sm:h-7 inline-block mr-2" />
          Peer Evaluation Dashboard
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 text-center">
          Manage your evaluation assignments and view feedback from peers
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                To Evaluate
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {evaluationData.toEvaluate.length}
              </p>
            </div>
            <Target className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {evaluationData.completed.length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Received
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {evaluationData.received.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg. Score
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {evaluationData.received.length > 0
                  ? Math.round(
                      evaluationData.received.reduce(
                        (sum, evaluations) =>
                          sum + (evaluations.totalScore / evaluations.maxTotalScore) * 100,
                        0
                      ) / evaluationData.received.length
                    )
                  : 0}
                %
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            {
              key: "to_evaluate",
              label: "📝 To Evaluate",
              count: evaluationData.toEvaluate.length,
            },
            {
              key: "completed",
              label: "✅ Completed",
              count: evaluationData.completed.length,
            },
            {
              key: "received",
              label: "📊 Received",
              count: evaluationData.received.length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
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

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "to_evaluate" && (
          <>
            {evaluationData.toEvaluate.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Evaluations Assigned
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any peer evaluations to complete at the moment.
                </p>
              </div>
            ) : (
              evaluationData.toEvaluate.map((evaluation) =>
                renderEvaluationCard(evaluation, "to_evaluate")
              )
            )}
          </>
        )}

        {activeTab === "completed" && (
          <>
            {evaluationData.completed.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Completed Evaluations
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your completed evaluations will appear here.
                </p>
              </div>
            ) : (
              evaluationData.completed.map((evaluation) =>
                renderEvaluationCard(evaluation, "completed")
              )
            )}
          </>
        )}

        {activeTab === "received" && (
          <>
            {evaluationData.received.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Evaluations Received
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Evaluations from your peers will appear here once completed.
                </p>
              </div>
            ) : (
              evaluationData.received.map((evaluation) =>
                renderEvaluationCard(evaluation, "received")
              )
            )}
          </>
        )}
      </div>

      {/* Evaluation Modal */}
      {showEvaluationModal && selectedEvaluation && (
        <EvaluationModal
          evaluation={selectedEvaluation}
          onSubmit={handleSubmitEvaluation}
          onClose={() => {
            setShowEvaluationModal(false);
            setSelectedEvaluation(null);
          }}
        />
      )}
    </div>
  );
};

// Evaluation Modal Component
const EvaluationModal: React.FC<{
  evaluation: Evaluation;
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ evaluation, onSubmit, onClose }) => {
  const [scores, setScores] = useState<EvaluationScore[]>([
    {
      criteriaName: "Technical Accuracy",
      score: 0,
      maxScore: 100,
      feedback: "",
    },
    { criteriaName: "Code Quality", score: 0, maxScore: 100, feedback: "" },
    { criteriaName: "Innovation", score: 0, maxScore: 100, feedback: "" },
    { criteriaName: "Documentation", score: 0, maxScore: 100, feedback: "" },
  ]);
  const [overallFeedback, setOverallFeedback] = useState("");

  const handleScoreChange = (
    index: number,
    field: keyof EvaluationScore,
    value: any
  ) => {
    setScores((prev) =>
      prev.map((score, i) =>
        i === index ? { ...score, [field]: value } : score
      )
    );
  };

  const calculateTotalScore = () => {
    return scores.reduce((sum, score) => sum + score.score, 0);
  };

  const calculateGrade = () => {
    const totalScore = calculateTotalScore();
    const maxTotal = scores.reduce((sum, score) => sum + score.maxScore, 0);
    const percentage = (totalScore / maxTotal) * 100;

    if (percentage >= 97) return "A+";
    if (percentage >= 93) return "A";
    if (percentage >= 90) return "A-";
    if (percentage >= 87) return "B+";
    if (percentage >= 83) return "B";
    if (percentage >= 80) return "B-";
    if (percentage >= 77) return "C+";
    if (percentage >= 73) return "C";
    if (percentage >= 70) return "C-";
    if (percentage >= 67) return "D+";
    if (percentage >= 60) return "D";
    return "F";
  };

  const handleSubmit = () => {
    const totalScore = calculateTotalScore();
    const maxTotalScore = scores.reduce(
      (sum, score) => sum + score.maxScore,
      0
    );

    onSubmit({
      scores,
      totalScore,
      maxTotalScore,
      overallFeedback,
      grade: calculateGrade(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Evaluate Submission
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {evaluation.assignment?.title}
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
          {/* Submission Content */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Submission Content
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {evaluation.submission?.content}
            </p>

            {evaluation.submission?.attachments &&
              evaluation.submission.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Attachments
                  </h4>
                  <div className="space-y-2">
                    {evaluation.submission.attachments.map(
                      (attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <span className="text-blue-600 dark:text-blue-400">
                            {attachment.filename}
                          </span>
                          <span className="text-gray-500">
                            ({attachment.mimetype})
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Evaluation Criteria */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Evaluation Criteria
            </h3>
            <div className="space-y-4">
              {scores.map((score, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {score.criteriaName}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max={score.maxScore}
                        value={score.score}
                        onChange={(e) =>
                          handleScoreChange(
                            index,
                            "score",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center text-sm dark:bg-gray-700 dark:text-white"
                      />
                      <span className="text-gray-500 dark:text-gray-400">
                        / {score.maxScore}
                      </span>
                    </div>
                  </div>
                  <textarea
                    placeholder={`Feedback for ${score.criteriaName.toLowerCase()}...`}
                    value={score.feedback}
                    onChange={(e) =>
                      handleScoreChange(index, "feedback", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Overall Feedback */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Overall Feedback
            </h3>
            <textarea
              placeholder="Provide comprehensive feedback on the overall submission..."
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
              rows={4}
              required
            />
          </div>

          {/* Summary */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
              Evaluation Summary
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-indigo-700 dark:text-indigo-400">
                Total Score: {calculateTotalScore()}/400
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 rounded font-medium">
                Grade: {calculateGrade()}
              </span>
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
            onClick={handleSubmit}
            disabled={!overallFeedback.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Evaluation
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationPage;