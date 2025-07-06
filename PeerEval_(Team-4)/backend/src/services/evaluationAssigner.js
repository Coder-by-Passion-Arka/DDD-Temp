import Evaluation from "../models/evaluation.models.js";
import Submission from "../models/submissions.models.js";
import User from "../models/user.models.js";

class EvaluationAssignmentService {
  /**
   * Advanced Graph Coloring Algorithm for Peer Evaluation Assignment
   * Ensures optimal distribution of evaluation workload while avoiding conflicts
   */
  static async assignPeerEvaluations(assignmentId, options = {}) {
    try {
      const {
        evaluationsPerSubmission = 2, // How many evaluators per submission
        maxEvaluationsPerUser = 3, // Maximum evaluations per user
        allowSelfEvaluation = false, // Whether users can evaluate their own work
        randomizeAssignment = true, // Add randomness to assignment
        balanceWorkload = true, // Balance workload across evaluators
      } = options;

      // Step 1: Get all submissions and users for this assignment
      const submissions = await Submission.find({
        assignmentId: assignmentId,
        status: "submitted",
      }).populate("userId", "_id userName userEmail");

      if (submissions.length < 2) {
        throw new Error("Need at least 2 submissions for peer evaluation");
      }

      const users = submissions.map((sub) => ({
        id: sub.userId._id.toString(),
        userName: sub.userId.userName,
        submissionId: sub._id.toString(),
      }));

      console.log(
        `Starting assignment for ${users.length} users with ${submissions.length} submissions`
      );

      // Step 2: Create conflict matrix (graph)
      const conflictMatrix = this.createConflictMatrix(users, {
        allowSelfEvaluation,
      });

      // Step 3: Apply graph coloring algorithm
      const assignments = this.graphColoringAssignment(users, conflictMatrix, {
        evaluationsPerSubmission,
        maxEvaluationsPerUser,
        randomizeAssignment,
        balanceWorkload,
      });

      // Step 4: Validate assignments
      const validatedAssignments = this.validateAssignments(
        assignments,
        users,
        options
      );

      // Step 5: Create evaluation records
      const evaluationDueDate = new Date();
      evaluationDueDate.setDate(evaluationDueDate.getDate() + 7); // 1 week deadline

      const createdEvaluations = await this.createEvaluationRecords(
        assignmentId,
        validatedAssignments,
        evaluationDueDate
      );

      // Step 6: Update submission records
      await this.updateSubmissionRecords(createdEvaluations);

      return {
        success: true,
        totalEvaluations: createdEvaluations.length,
        assignments: validatedAssignments,
        evaluations: createdEvaluations,
        statistics: this.generateAssignmentStatistics(
          validatedAssignments,
          users
        ),
      };
    } catch (error) {
      console.error("Error in assignPeerEvaluations:", error);
      throw new Error(`Failed to assign peer evaluations: ${error.message}`);
    }
  }

  /**
   * Create conflict matrix representing who cannot evaluate whom
   */
  static createConflictMatrix(users, options = {}) {
    const { allowSelfEvaluation = false } = options;
    const n = users.length;
    const matrix = Array(n)
      .fill(null)
      .map(() => Array(n).fill(false));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // Self-evaluation conflict
        if (i === j && !allowSelfEvaluation) {
          matrix[i][j] = true;
        }

        // Add other conflict rules here if needed
        // e.g., users from same group, previous evaluation history, etc.
      }
    }

    return matrix;
  }

  /**
   * Graph coloring algorithm for optimal assignment
   */
  static graphColoringAssignment(users, conflictMatrix, options = {}) {
    const {
      evaluationsPerSubmission = 2,
      maxEvaluationsPerUser = 3,
      randomizeAssignment = true,
      balanceWorkload = true,
    } = options;

    const n = users.length;
    const assignments = [];
    const userWorkload = new Map(); // Track assignments per user

    // Initialize workload tracking
    users.forEach((user) => {
      userWorkload.set(user.id, 0);
    });

    // For each submission, assign evaluators
    for (let submissionIndex = 0; submissionIndex < n; submissionIndex++) {
      const submission = users[submissionIndex];
      const submissionAssignments = [];

      // Find potential evaluators (no conflicts)
      const potentialEvaluators = [];
      for (let evaluatorIndex = 0; evaluatorIndex < n; evaluatorIndex++) {
        if (!conflictMatrix[submissionIndex][evaluatorIndex]) {
          const evaluator = users[evaluatorIndex];
          const currentWorkload = userWorkload.get(evaluator.id);

          if (currentWorkload < maxEvaluationsPerUser) {
            potentialEvaluators.push({
              ...evaluator,
              index: evaluatorIndex,
              currentWorkload: currentWorkload,
            });
          }
        }
      }

      // Sort potential evaluators by workload (for balancing)
      if (balanceWorkload) {
        potentialEvaluators.sort(
          (a, b) => a.currentWorkload - b.currentWorkload
        );
      }

      // Randomize if requested (but keep workload balance as secondary sort)
      if (randomizeAssignment) {
        // Group by workload level and randomize within groups
        const workloadGroups = new Map();
        potentialEvaluators.forEach((evaluator) => {
          const workload = evaluator.currentWorkload;
          if (!workloadGroups.has(workload)) {
            workloadGroups.set(workload, []);
          }
          workloadGroups.get(workload).push(evaluator);
        });

        // Shuffle within each workload group
        for (const [workload, group] of workloadGroups) {
          this.shuffleArray(group);
        }

        // Rebuild the array maintaining workload priority but with randomness within groups
        potentialEvaluators.length = 0;
        const sortedWorkloads = Array.from(workloadGroups.keys()).sort(
          (a, b) => a - b
        );
        sortedWorkloads.forEach((workload) => {
          potentialEvaluators.push(...workloadGroups.get(workload));
        });
      }

      // Assign the required number of evaluators
      const evaluatorsToAssign = Math.min(
        evaluationsPerSubmission,
        potentialEvaluators.length
      );

      for (let i = 0; i < evaluatorsToAssign; i++) {
        const evaluator = potentialEvaluators[i];

        submissionAssignments.push({
          submissionId: submission.submissionId,
          submitterId: submission.id,
          evaluatorId: evaluator.id,
          evaluatorName: evaluator.userName,
          submitterName: submission.userName,
          colorGroup: submissionIndex,
          priority: i, // Lower number = higher priority
          assignmentRound: 1,
        });

        // Update workload
        userWorkload.set(evaluator.id, userWorkload.get(evaluator.id) + 1);
      }

      if (submissionAssignments.length < evaluationsPerSubmission) {
        console.warn(
          `Could only assign ${submissionAssignments.length} evaluators for submission by ${submission.userName} (requested ${evaluationsPerSubmission})`
        );
      }

      assignments.push(...submissionAssignments);
    }

    return assignments;
  }

  /**
   * Validate assignments to ensure they meet requirements
   */
  static validateAssignments(assignments, users, options = {}) {
    const { evaluationsPerSubmission = 2, maxEvaluationsPerUser = 3 } = options;

    // Check workload distribution
    const workloadMap = new Map();
    assignments.forEach((assignment) => {
      const evaluatorId = assignment.evaluatorId;
      workloadMap.set(evaluatorId, (workloadMap.get(evaluatorId) || 0) + 1);
    });

    // Validate no user exceeds maximum evaluations
    for (const [userId, workload] of workloadMap) {
      if (workload > maxEvaluationsPerUser) {
        throw new Error(
          `User ${userId} assigned ${workload} evaluations, exceeds maximum of ${maxEvaluationsPerUser}`
        );
      }
    }

    // Check that no user evaluates their own submission
    const invalidAssignments = assignments.filter(
      (assignment) => assignment.submitterId === assignment.evaluatorId
    );

    if (invalidAssignments.length > 0) {
      throw new Error(
        `Found ${invalidAssignments.length} self-evaluation assignments`
      );
    }

    console.log("Assignment validation passed");
    return assignments;
  }

  /**
   * Create evaluation records in database
   */
  static async createEvaluationRecords(assignmentId, assignments, dueDate) {
    try {
      const evaluations = assignments.map((assignment) => ({
        assignmentId: assignmentId,
        submitterId: assignment.submitterId,
        evaluatorId: assignment.evaluatorId,
        submissionId: assignment.submissionId,
        scores: [],
        totalScore: 0,
        maxTotalScore: 100,
        overallFeedback: "",
        evaluationType: "peer",
        status: "assigned",
        dueDate: dueDate,
        assignmentMetadata: {
          colorGroup: assignment.colorGroup,
          assignmentRound: assignment.assignmentRound,
          priority: assignment.priority,
        },
      }));

      const createdEvaluations = await Evaluation.insertMany(evaluations);
      console.log(`Created ${createdEvaluations.length} evaluation records`);

      return createdEvaluations;
    } catch (error) {
      throw new Error(`Failed to create evaluation records: ${error.message}`);
    }
  }

  /**
   * Update submission records with evaluation assignments
   */
  static async updateSubmissionRecords(evaluations) {
    try {
      const submissionUpdates = new Map();

      // Group evaluations by submission
      evaluations.forEach((evaluation) => {
        const submissionId = evaluation.submissionId.toString();
        if (!submissionUpdates.has(submissionId)) {
          submissionUpdates.set(submissionId, []);
        }
        submissionUpdates.get(submissionId).push({
          evaluationId: evaluation._id,
          evaluatorId: evaluation.evaluatorId,
          status: "assigned",
          assignedAt: new Date(),
        });
      });

      // Update each submission
      const updatePromises = Array.from(submissionUpdates.entries()).map(
        ([submissionId, evaluationAssignments]) => {
          return Submission.findByIdAndUpdate(
            submissionId,
            {
              $push: {
                evaluationAssignments: { $each: evaluationAssignments },
              },
              status: "under_evaluation",
            },
            { new: true }
          );
        }
      );

      await Promise.all(updatePromises);
      console.log(`Updated ${submissionUpdates.size} submission records`);
    } catch (error) {
      throw new Error(`Failed to update submission records: ${error.message}`);
    }
  }

  /**
   * Generate statistics about the assignment
   */
  static generateAssignmentStatistics(assignments, users) {
    const userWorkload = new Map();
    const submissionCoverage = new Map();

    assignments.forEach((assignment) => {
      // Count evaluations per user
      const evaluatorId = assignment.evaluatorId;
      userWorkload.set(evaluatorId, (userWorkload.get(evaluatorId) || 0) + 1);

      // Count evaluators per submission
      const submissionId = assignment.submissionId;
      submissionCoverage.set(
        submissionId,
        (submissionCoverage.get(submissionId) || 0) + 1
      );
    });

    const workloadValues = Array.from(userWorkload.values());
    const coverageValues = Array.from(submissionCoverage.values());

    return {
      totalAssignments: assignments.length,
      usersInvolved: userWorkload.size,
      submissionsCovered: submissionCoverage.size,
      workloadDistribution: {
        min: Math.min(...workloadValues, 0),
        max: Math.max(...workloadValues, 0),
        average:
          workloadValues.length > 0
            ? (
                workloadValues.reduce((a, b) => a + b, 0) /
                workloadValues.length
              ).toFixed(2)
            : 0,
      },
      coverageDistribution: {
        min: Math.min(...coverageValues, 0),
        max: Math.max(...coverageValues, 0),
        average:
          coverageValues.length > 0
            ? (
                coverageValues.reduce((a, b) => a + b, 0) /
                coverageValues.length
              ).toFixed(2)
            : 0,
      },
    };
  }

  /**
   * Utility function to shuffle array in place
   */
  static shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Get evaluation assignments for a specific user
   */
  static async getUserEvaluationAssignments(userId, status = null) {
    try {
      const query = { evaluatorId: userId };
      if (status) {
        query.status = status;
      }

      const evaluations = await Evaluation.find(query)
        .populate("submissionId", "content attachments userId")
        .populate("submitterId", "userName userEmail")
        .populate("assignmentId", "title description")
        .sort({ dueDate: 1, createdAt: -1 });

      return evaluations;
    } catch (error) {
      throw new Error(
        `Failed to get user evaluation assignments: ${error.message}`
      );
    }
  }

  /**
   * Get evaluation status for a specific assignment
   */
  static async getAssignmentEvaluationStatus(assignmentId) {
    try {
      const evaluations = await Evaluation.find({ assignmentId })
        .populate("evaluatorId", "userName")
        .populate("submitterId", "userName");

      const statusCounts = evaluations.reduce((counts, evaluation) => {
        counts[evaluation.status] = (counts[evaluation.status] || 0) + 1;
        return counts;
      }, {});

      const totalEvaluations = evaluations.length;
      const completedEvaluations =
        (statusCounts.submitted || 0) +
        (statusCounts.reviewed || 0) +
        (statusCounts.finalized || 0);

      return {
        totalEvaluations,
        completedEvaluations,
        progressPercentage:
          totalEvaluations > 0
            ? Math.round((completedEvaluations / totalEvaluations) * 100)
            : 0,
        statusBreakdown: statusCounts,
        evaluations: evaluations,
      };
    } catch (error) {
      throw new Error(
        `Failed to get assignment evaluation status: ${error.message}`
      );
    }
  }

  /**
   * Reassign evaluation if needed (e.g., if evaluator drops out)
   */
  static async reassignEvaluation(evaluationId, newEvaluatorId, reason = "") {
    try {
      const evaluation = await Evaluation.findById(evaluationId);
      if (!evaluation) {
        throw new Error("Evaluation not found");
      }

      if (
        evaluation.status !== "assigned" &&
        evaluation.status !== "in_progress"
      ) {
        throw new Error(
          "Can only reassign evaluations that are assigned or in progress"
        );
      }

      // Check if new evaluator is not the submitter
      if (evaluation.submitterId.toString() === newEvaluatorId.toString()) {
        throw new Error("Cannot assign user to evaluate their own submission");
      }

      const oldEvaluatorId = evaluation.evaluatorId;

      // Update evaluation record
      evaluation.evaluatorId = newEvaluatorId;
      evaluation.status = "assigned";
      evaluation.assignedAt = new Date();
      evaluation.startedAt = null;
      evaluation.qualityFlags.needsReview = true;
      evaluation.qualityFlags.reviewNotes = `Reassigned from ${oldEvaluatorId} to ${newEvaluatorId}. Reason: ${reason}`;

      await evaluation.save();

      // Update submission record
      await Submission.findOneAndUpdate(
        {
          _id: evaluation.submissionId,
          "evaluationAssignments.evaluationId": evaluationId,
        },
        {
          $set: {
            "evaluationAssignments.$.evaluatorId": newEvaluatorId,
            "evaluationAssignments.$.status": "assigned",
            "evaluationAssignments.$.assignedAt": new Date(),
          },
        }
      );

      console.log(
        `Reassigned evaluation ${evaluationId} from ${oldEvaluatorId} to ${newEvaluatorId}`
      );

      return evaluation;
    } catch (error) {
      throw new Error(`Failed to reassign evaluation: ${error.message}`);
    }
  }
}

export default EvaluationAssignmentService;
