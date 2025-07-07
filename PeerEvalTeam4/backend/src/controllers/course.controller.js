import Course from "../models/course.models.js";
import User from "../models/user.models.js";
import Assignment from "../models/assignment.models.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";

// Create a new course
const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    courseCode,
    instructor,
    schedule,
    settings,
    tags,
    syllabus,
    materials,
  } = req.body;

  // Validation
  if (!title || !description || !courseCode) {
    throw new ApiError(400, "Title, description, and course code are required");
  }

  if (!schedule?.startDate || !schedule?.endDate) {
    throw new ApiError(400, "Start date and end date are required");
  }

  // Validate course code format
  const courseCodeRegex = /^[A-Z]{2,4}\d{3,4}$/;
  if (!courseCodeRegex.test(courseCode.toUpperCase())) {
    throw new ApiError(
      400,
      "Invalid course code format. Use format like 'CS101' or 'MATH2001'"
    );
  }

  // Check if course code already exists
  const existingCourse = await Course.findOne({
    courseCode: courseCode.toUpperCase(),
  });

  if (existingCourse) {
    throw new ApiError(409, "Course code already exists");
  }

  // Determine instructor
  let instructorId = instructor || req.user._id;

  // Only admins can assign different instructors
  if (
    instructor &&
    instructor !== req.user._id.toString() &&
    req.user.userRole !== "admin"
  ) {
    throw new ApiError(
      403,
      "Only admins can assign courses to other instructors"
    );
  }

  // Validate instructor exists and has teacher role
  if (instructor && instructor !== req.user._id.toString()) {
    const instructorUser = await User.findById(instructor);
    if (!instructorUser) {
      throw new ApiError(404, "Instructor not found");
    }
    if (
      instructorUser.userRole !== "teacher" &&
      instructorUser.userRole !== "admin"
    ) {
      throw new ApiError(
        400,
        "Assigned instructor must have teacher or admin role"
      );
    }
  }

  // Validate dates
  const startDate = new Date(schedule.startDate);
  const endDate = new Date(schedule.endDate);

  if (endDate <= startDate) {
    throw new ApiError(400, "End date must be after start date");
  }

  // Parse arrays if they come as strings
  let parsedTags = tags;
  let parsedMaterials = materials;

  try {
    if (typeof tags === "string") {
      parsedTags = JSON.parse(tags);
    }
    if (typeof materials === "string") {
      parsedMaterials = JSON.parse(materials);
    }
  } catch (parseError) {
    throw new ApiError(400, "Invalid JSON format in tags or materials");
  }

  // Create course
  const course = await Course.create({
    title: title.trim(),
    description: description.trim(),
    courseCode: courseCode.toUpperCase().trim(),
    instructor: instructorId,
    createdBy: req.user._id,
    schedule: {
      startDate,
      endDate,
      meetingDays: schedule.meetingDays || [],
      meetingTime: schedule.meetingTime || { start: "", end: "" },
    },
    settings: {
      maxStudents: settings?.maxStudents || 50,
      allowSelfEnrollment: settings?.allowSelfEnrollment || false,
      isPublic: settings?.isPublic || false,
      enablePeerEvaluation: settings?.enablePeerEvaluation || true,
      gradingScale: settings?.gradingScale || "letter",
    },
    tags: Array.isArray(parsedTags) ? parsedTags : [],
    syllabus: syllabus?.trim() || "",
    materials: Array.isArray(parsedMaterials) ? parsedMaterials : [],
  });

  const createdCourse = await Course.findById(course._id)
    .populate("instructor", "userName userEmail")
    .populate("createdBy", "userName userEmail");

  return res
    .status(201)
    .json(new ApiResponse(201, createdCourse, "Course created successfully"));
});

// Get all courses (with filters)
const getCourses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    instructor = "",
    tags = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query based on user role
  let baseQuery = {};

  switch (req.user.userRole) {
    case "admin":
      // Admins can see all courses
      break;
    case "teacher":
      // Teachers can see courses they created or instruct
      baseQuery = {
        $or: [{ instructor: req.user._id }, { createdBy: req.user._id }],
      };
      break;
    case "student":
      // Students can see courses they're enrolled in or public courses
      baseQuery = {
        $or: [
          {
            "enrolledStudents.student": req.user._id,
            "enrolledStudents.status": "active",
          },
          {
            "settings.isPublic": true,
            status: { $in: ["active", "starting_soon"] },
          },
        ],
      };
      break;
    default:
      throw new ApiError(403, "Access denied");
  }

  // Apply additional filters
  const query = { ...baseQuery };

  if (search) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { courseCode: { $regex: search, $options: "i" } },
      ],
    });
  }

  if (status) {
    query.status = status;
  }

  if (instructor) {
    query.instructor = instructor;
  }

  if (tags) {
    const tagArray = tags.split(",").map((tag) => tag.trim());
    query.tags = { $in: tagArray };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const courses = await Course.find(query)
    .populate("instructor", "userName userEmail")
    .populate("createdBy", "userName userEmail")
    .populate("enrolledStudents.student", "userName userEmail")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const totalCourses = await Course.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCourses / parseInt(limit)),
          totalCourses,
          coursesPerPage: parseInt(limit),
        },
      },
      "Courses fetched successfully"
    )
  );
});

// Get single course by ID
const getCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid course ID");
  }

  const course = await Course.findById(courseId)
    .populate("instructor", "userName userEmail userProfileImage")
    .populate("createdBy", "userName userEmail")
    .populate("enrolledStudents.student", "userName userEmail userProfileImage")
    .populate("assignments");

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Check if user can access this course
  if (!course.canUserAccess(req.user._id, req.user.userRole)) {
    throw new ApiError(403, "Access denied to this course");
  }

  // Get course statistics
  await Course.updateCourseStatistics(courseId);
  const updatedCourse = await Course.findById(courseId)
    .populate("instructor", "userName userEmail userProfileImage")
    .populate("createdBy", "userName userEmail")
    .populate(
      "enrolledStudents.student",
      "userName userEmail userProfileImage"
    );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Course fetched successfully"));
});

// Update course
const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const {
    title,
    description,
    courseCode,
    instructor,
    schedule,
    settings,
    tags,
    syllabus,
    materials,
    status,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid course ID");
  }

  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Check permissions
  const isOwner = course.createdBy.toString() === req.user._id.toString();
  const isInstructor = course.instructor.toString() === req.user._id.toString();
  const isAdmin = req.user.userRole === "admin";

  if (!isOwner && !isInstructor && !isAdmin) {
    throw new ApiError(403, "Not authorized to update this course");
  }

  // Validate course code if being changed
  if (courseCode && courseCode !== course.courseCode) {
    const courseCodeRegex = /^[A-Z]{2,4}\d{3,4}$/;
    if (!courseCodeRegex.test(courseCode.toUpperCase())) {
      throw new ApiError(400, "Invalid course code format");
    }

    const existingCourse = await Course.findOne({
      courseCode: courseCode.toUpperCase(),
      _id: { $ne: courseId },
    });

    if (existingCourse) {
      throw new ApiError(409, "Course code already exists");
    }
  }

  // Validate instructor if being changed
  if (instructor && instructor !== course.instructor.toString()) {
    if (!isAdmin) {
      throw new ApiError(403, "Only admins can change course instructor");
    }

    const instructorUser = await User.findById(instructor);
    if (!instructorUser) {
      throw new ApiError(404, "Instructor not found");
    }
    if (
      instructorUser.userRole !== "teacher" &&
      instructorUser.userRole !== "admin"
    ) {
      throw new ApiError(
        400,
        "Assigned instructor must have teacher or admin role"
      );
    }
  }

  // Parse arrays if they come as strings
  let parsedTags = tags;
  let parsedMaterials = materials;

  try {
    if (typeof tags === "string") {
      parsedTags = JSON.parse(tags);
    }
    if (typeof materials === "string") {
      parsedMaterials = JSON.parse(materials);
    }
  } catch (parseError) {
    throw new ApiError(400, "Invalid JSON format in tags or materials");
  }

  // Build update object
  const updateFields = {};

  if (title) updateFields.title = title.trim();
  if (description) updateFields.description = description.trim();
  if (courseCode) updateFields.courseCode = courseCode.toUpperCase().trim();
  if (instructor) updateFields.instructor = instructor;
  if (schedule) {
    updateFields.schedule = {
      ...course.schedule,
      ...schedule,
    };

    // Validate dates if being changed
    if (schedule.startDate || schedule.endDate) {
      const startDate = new Date(
        schedule.startDate || course.schedule.startDate
      );
      const endDate = new Date(schedule.endDate || course.schedule.endDate);

      if (endDate <= startDate) {
        throw new ApiError(400, "End date must be after start date");
      }
    }
  }
  if (settings) {
    updateFields.settings = {
      ...course.settings,
      ...settings,
    };
  }
  if (Array.isArray(parsedTags)) updateFields.tags = parsedTags;
  if (syllabus !== undefined) updateFields.syllabus = syllabus.trim();
  if (Array.isArray(parsedMaterials)) updateFields.materials = parsedMaterials;
  if (
    status &&
    ["draft", "starting_soon", "active", "completed", "archived"].includes(
      status
    )
  ) {
    updateFields.status = status;
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    { $set: updateFields },
    { new: true, runValidators: true }
  )
    .populate("instructor", "userName userEmail")
    .populate("createdBy", "userName userEmail")
    .populate("enrolledStudents.student", "userName userEmail");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
});

// Delete course
const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid course ID");
  }

  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Check permissions - only course creator or admin can delete
  const isOwner = course.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.userRole === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Not authorized to delete this course");
  }

  // Check if course has active assignments or enrollments
  const hasAssignments = await Assignment.countDocuments({ courseId });
  const hasActiveEnrollments = course.enrolledStudents.filter(
    (enrollment) => enrollment.status === "active"
  ).length;

  if (hasAssignments > 0 || hasActiveEnrollments > 0) {
    throw new ApiError(
      400,
      "Cannot delete course with active assignments or enrollments. Archive it instead."
    );
  }

  await Course.findByIdAndDelete(courseId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Course deleted successfully"));
});

// Enroll student in course
const enrollStudent = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { studentId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid course ID");
  }

  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Determine student to enroll
  let targetStudentId = studentId || req.user._id;

  // Only instructors/admins can enroll other students
  if (studentId && studentId !== req.user._id.toString()) {
    const isInstructor =
      course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.userRole === "admin";

    if (!isInstructor && !isAdmin) {
      throw new ApiError(403, "Not authorized to enroll other students");
    }
  }

  // For self-enrollment, check if it's allowed
  if (!studentId && !course.settings.allowSelfEnrollment) {
    const isInstructor =
      course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.userRole === "admin";

    if (!isInstructor && !isAdmin) {
      throw new ApiError(403, "Self-enrollment is not allowed for this course");
    }
  }

  // Validate student exists and has student role
  const student = await User.findById(targetStudentId);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (student.userRole !== "student") {
    throw new ApiError(400, "User must have student role to enroll in course");
  }

  // Enroll student using course method
  try {
    await course.enrollStudent(targetStudentId);

    const updatedCourse = await Course.findById(courseId).populate(
      "enrolledStudents.student",
      "userName userEmail"
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedCourse, "Student enrolled successfully")
      );
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

// Unenroll student from course
const unenrollStudent = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { studentId, reason = "dropped" } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid course ID");
  }

  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Determine student to unenroll
  let targetStudentId = studentId || req.user._id;

  // Only instructors/admins can unenroll other students
  if (studentId && studentId !== req.user._id.toString()) {
    const isInstructor =
      course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.userRole === "admin";

    if (!isInstructor && !isAdmin) {
      throw new ApiError(403, "Not authorized to unenroll other students");
    }
  }

  // Unenroll student using course method
  try {
    await course.unenrollStudent(targetStudentId, reason);

    const updatedCourse = await Course.findById(courseId).populate(
      "enrolledStudents.student",
      "userName userEmail"
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedCourse, "Student unenrolled successfully")
      );
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

// Get course enrollments
const getCourseEnrollments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { status = "active" } = req.query;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid course ID");
  }

  const course = await Course.findById(courseId).populate(
    "enrolledStudents.student",
    "userName userEmail userProfileImage userAcademicInformation"
  );

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Check permissions
  if (!course.canUserAccess(req.user._id, req.user.userRole)) {
    throw new ApiError(403, "Access denied to this course");
  }

  // Filter enrollments by status
  const enrollments = course.enrolledStudents.filter(
    (enrollment) => !status || enrollment.status === status
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { enrollments, totalCount: enrollments.length },
        "Enrollments fetched successfully"
      )
    );
});

// Get courses for user (based on role)
const getUserCourses = asyncHandler(async (req, res) => {
  const { status } = req.query;

  try {
    const courses = await Course.getCoursesForUser(
      req.user._id,
      req.user.userRole,
      { status }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, courses, "User courses fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching user courses");
  }
});

// Update course statistics (admin/instructor only)
const updateCourseStatistics = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid course ID");
  }

  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Check permissions
  const isInstructor = course.instructor.toString() === req.user._id.toString();
  const isAdmin = req.user.userRole === "admin";

  if (!isInstructor && !isAdmin) {
    throw new ApiError(403, "Not authorized to update course statistics");
  }

  try {
    const updatedCourse = await Course.updateCourseStatistics(courseId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedCourse,
          "Course statistics updated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error updating course statistics");
  }
});

export {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getCourseEnrollments,
  getUserCourses,
  updateCourseStatistics,
};
