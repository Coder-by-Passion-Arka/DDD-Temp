import asyncHandler from "express-async-handler";
import User from "../models/user.models.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: "src/.env" });

// Valid user roles
const VALID_ROLES = ["student", "teacher", "admin"];

// Access and Refresh Token Generator
const generateAccessTokenAndRefreshToken = asyncHandler(async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found in the database.");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    const isSaved = await user.save();
    // while (!isSaved) {
    //   isSaved = await user.save();
    // }
    console.log(`User deatils have been saved to the database ${isSaved}`);

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Error in generating access token and refresh token while finding the user from the database."
    );
  }
});

// Helper function to validate user role
const validateUserRole = (role) => {
  if (!role) {
    return false;
  }
  return VALID_ROLES.includes(role.toLowerCase());
};

// User Registration
const registerUser = asyncHandler(async (request, response) => {
  let {
    userName = "",
    userEmail = "",
    userPhoneNumber = "",
    countryCode = "",
    userPassword = "",
    userRole = "student", // Default role
    userLocation = {
      homeAddress: "",
      currentAddress: "",
    },
  } = request.body;

  // Handle userLocation if it comes as a string (from form data)
  if (typeof userLocation === "string") {
    try {
      userLocation = JSON.parse(userLocation);
    } catch (parseError) {
      // Fallback: Extract using regex if JSON parsing fails
      const homeAddressMatch = userLocation.match(
        /"homeAddress"\s*:\s*"([^"]+)"/
      );
      const currentAddressMatch = userLocation.match(
        /"currentAddress"\s*:\s*"([^"]+)"/
      );

      userLocation = {
        homeAddress: homeAddressMatch ? homeAddressMatch[1] : "",
        currentAddress: currentAddressMatch ? currentAddressMatch[1] : "",
      };
    }
  }

  // Validate and normalize user role
  if (!validateUserRole(userRole)) {
    throw new ApiError(
      400,
      "Invalid user role. Must be student, teacher, or admin."
    );
  }
  userRole = userRole.toLowerCase();

  // DEBUG: Log each extracted field
  console.log("🔍 Extracted fields:");
  console.log("  userName:", `"${userName}"`);
  console.log("  userEmail:", `"${userEmail}"`);
  console.log("  userPhoneNumber:", `"${userPhoneNumber}"`);
  console.log("  countryCode:", `"${countryCode}"`);
  console.log("  userRole:", `"${userRole}"`);
  console.log(
    "  userPassword:",
    userPassword ? "***provided***" : "***MISSING***"
  );
  console.log("  userLocation:", JSON.stringify(userLocation, null, 2));
  console.log("  userLocation.homeAddress:", `"${userLocation?.homeAddress}"`);
  console.log(
    "  userLocation.currentAddress:",
    `"${userLocation?.currentAddress}"`
  );

  // Enhanced Validation
  const validationErrors = [];

  if (!userName?.trim()) {
    validationErrors.push("Full name is required");
  }

  if (!userEmail?.trim()) {
    validationErrors.push("Email is required");
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      validationErrors.push("Please provide a valid email address");
    }
  }

  if (!userPhoneNumber?.trim()) {
    validationErrors.push("Phone number is required");
  }

  if (!countryCode?.trim()) {
    validationErrors.push("Country code is required");
  }

  if (!userPassword?.trim()) {
    validationErrors.push("Password is required");
  } else if (userPassword.length < 8) {
    validationErrors.push("Password must be at least 8 characters long");
    // TODO: Add more strong password rules
  }

  if (!userLocation?.homeAddress?.trim()) {
    validationErrors.push("Home address is required");
  }

  if (!userLocation?.currentAddress?.trim()) {
    validationErrors.push("Current address is required");
  }

  if (validationErrors.length > 0) {
    throw new ApiError(
      400,
      `Validation failed: ${validationErrors.join(", ")}`
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { userEmail: userEmail.toLowerCase() },
      { userName: userName.trim() },
    ],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User with this email or username already exists. Please try to Login"
    );
  }

  // Handle file uploads
  let userProfileImagePath = "";
  let userCoverImagePath = "";

  if (req.files?.avatar?.[0]) {
    const avatarResult = await uploadOnCloudinary(req.files.avatar[0].path);
    userProfileImagePath = avatarResult?.url || "";
  }

  if (req.files?.coverImage?.[0]) {
    const coverImageResult = await uploadOnCloudinary(
      req.files.coverImage[0].path
    );
    userCoverImagePath = coverImageResult?.url || "";
  }

  // // Create user object
  // const userData = {
  //   userName: userName.trim(),
  //   userEmail: userEmail.toLowerCase().trim(),
  //   userPhoneNumber: userPhoneNumber.trim(),
  //   countryCode: countryCode.trim(),
  //   userPassword,
  //   userRole,
  //   userLocation: {
  //     homeAddress: userLocation.homeAddress.trim(),
  //     currentAddress: userLocation.currentAddress.trim(),
  //   },
  // };

  // Create user
  const userData = await User.create({
    userName: userName.trim(),
    userEmail: userEmail.trim().toLowerCase(),
    userPassword,
    userPhoneNumber: userPhoneNumber.trim(),
    countryCode: countryCode.trim(),
    userRole: userRole || "student",
    userLocation: parsedUserLocation,
    userBio: userBio?.trim() || "",
    userProfileImage: userProfileImagePath,
    userCoverImage: userCoverImagePath,
    userAcademicInformation: parsedUserAcademicInformation || {},
    userSkills: Array.isArray(parsedUserSkills) ? parsedUserSkills : [],
    userSocialMediaProfiles: Array.isArray(parsedUserSocialMediaProfiles)
      ? parsedUserSocialMediaProfiles
      : [],
  });

  // // Add file paths if available (OPTIONAL - only add if files were uploaded)
  // if (avatarLocalPath) {
  //   userData.userProfileImage = avatarLocalPath;
  // }
  // if (coverImageLocalPath) {
  //   userData.userCoverImage = coverImageLocalPath;
  // }

  // Create a new user instance
  const newUser = await User.create(userData);

  // Generate tokens
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(newUser._id);

  // Being extra sure the user instance has been created and has a valid id
  const createdUser = await User.findById(newUser._id).select(
    "-userPassword -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Error occurred while creating a new user and saving to the database. User registration failed!!!"
    );
  }

  // Finally we can say that the user has been registered successfully
  return response
    .status(201)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: process.env.refreshToken_EXPIRY || 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User has been registered successfully."
      )
    );
});

// User Login
const loginUser = asyncHandler(async (request, response) => {
  const { userEmail = "", userPassword = "" } = request.body;

  console.log("🔍 Login attempt for:", userEmail);

  // Validation
  if (userEmail?.trim() === "" || userPassword?.trim() === "") {
    throw new ApiError(
      400,
      "Email and password are required. User login failed!!!"
    );
  }

  const user = await User.findOne({
    userEmail: userEmail.toLowerCase().trim(),
  });

  if (!user) {
    throw new ApiError(
      404,
      "User not found. Please check your email or register first."
    );
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(
      403,
      "Your account has been deactivated. Please contact support."
    );
  }

  // Validate password
  const isPasswordCorrect = await user.isPasswordCorrect(userPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials. Please check your password.");
  }

  // Generate tokens
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  // Update last login
  user.userLastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Get user data without sensitive fields
  const loggedInUser = await User.findById(user._id).select(
    "-userPassword -refreshToken"
  );

  // Cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Returning response with cookies set
  return response
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User has been logged in successfully."
      )
    );
});

// User Logout
const logoutUser = asyncHandler(async (request, response) => {
  await User.findByIdAndUpdate(
    request.user._id,
    { $set: { refreshToken: null } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return response
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User has been logged out successfully."));
});

// User automatic login using Refresh Token
const refreshAccessToken = asyncHandler(async (request, response) => {
  const incomingRefreshToken =
    request.cookies.refreshToken || request.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Need to Login Again. Refresh Token has expired.");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.refreshToken_SECRET
    );

    const tokenUser = await User.findById(decodedToken?._id);

    if (!tokenUser) {
      throw new ApiError(401, "Invalid refresh token.");
    }

    if (incomingRefreshToken !== tokenUser?.refreshToken) {
      throw new ApiError(
        401,
        "Need to Login Again. Refresh token is invalid or expired!"
      );
    }

    // Check if user is still active
    if (!tokenUser.isActive) {
      throw new ApiError(
        403,
        "Your account has been deactivated. Please contact support."
      );
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessTokenAndRefreshToken(tokenUser._id);

    return response
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token has been refreshed successfully."
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error occurred while refreshing access token.");
  }
});

// Change password
const changePassword = asyncHandler(async (request, response) => {
  const { oldPassword, newPassword } = request.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters long");
  }

  const findUser = await User.findById(request.user?._id);

  if (!findUser) {
    throw new ApiError(404, "User not found.");
  }

  const isOldPasswordCorrect = await findUser.isPasswordCorrect(oldPassword);

  if (!isOldPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect.");
  }

  findUser.userPassword = newPassword;

  isSaved = await findUser.save({
    validateBeforeSave: false,
  });

  console.log(`User deatils have been saved to the database ${isSaved}`);

  return response
    .status(200)
    .json(new ApiResponse(200, {}, "Password has been changed successfully."));
});

// Get current User details
const getCurrentUser = asyncHandler(async (request, response) => {
  const userId = request?.params.userId || request?.user?._id;

  if (!userId) {
    throw new ApiError(400, "User ID is required.");
  }

  const getUser = await User.findById(userId).select(
    "-userPassword -refreshToken"
  );

  if (!getUser) {
    throw new ApiError(404, "User not found.");
  }

  // Check if the requesting user has permission to view this profile
  const requestingUser = request.user;
  const isOwnProfile = userId === requestingUser._id.toString();
  const isTeacherOrAdmin = ["teacher", "admin"].includes(
    requestingUser.userRole
  );

  // Students can only view their own profile, teachers and admins can view any profile
  if (!isOwnProfile && !isTeacherOrAdmin) {
    throw new ApiError(403, "You don't have permission to view this profile.");
  }

  return response
    .status(200)
    .json(new ApiResponse(200, getUser, "User details fetched successfully."));
});

// Update account details
const updateAccountDetails = asyncHandler(async (request, response) => {
  const userId = request.user?._id || request.userId || request.body.userId;

  if (!userId) {
    throw new ApiError(400, "User ID is required.");
  }

  const {
    userName,
    userEmail,
    userPhoneNumber,
    userBio,
    userRole, // Unchangeable by anyone below admin level
    countryCode,
    userLocation,
    userAcademicInformation,
    userSkills,
    userSocialMediaProfiles,
  } = request.body;

  // Build update object with only provided fields
  const fieldsToUpdate = {};

  if (userName) fieldsToUpdate.userName = userName.trim();
  if (userEmail) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      throw new ApiError(400, "Please provide a valid email address");
    }
    fieldsToUpdate.userEmail = userEmail.toLowerCase().trim();
  }
  if (userPhoneNumber) fieldsToUpdate.userPhoneNumber = userPhoneNumber.trim();
  if (userBio) fieldsToUpdate.userBio = userBio.trim();
  if (userLocation) fieldsToUpdate.userLocation = userLocation;
  if (userAcademicInformation)
    fieldsToUpdate.userAcademicInformation = userAcademicInformation;
  if (userSkills) fieldsToUpdate.userSkills = userSkills;
  if (userSocialMediaProfiles)
    fieldsToUpdate.userSocialMediaProfiles = userSocialMediaProfiles;

  // Handle role updates (only admins can change roles)
  if (userRole) {
    if (request.user.userRole !== "admin") {
      throw new ApiError(403, "Only administrators can change user roles.");
    }
    if (!validateUserRole(userRole)) {
      throw new ApiError(
        400,
        "Invalid user role. Must be student, teacher, or admin."
      );
    }
    fieldsToUpdate.userRole = userRole.toLowerCase();
  }

  // Handle file uploads
  if (request.files?.avatar?.[0]) {
    fieldsToUpdate.userProfileImage = request.files.avatar[0].path;
  }

  if (request.files?.coverImage?.[0]) {
    fieldsToUpdate.userCoverImage = request.files.coverImage[0].path;
  }

  // Check if email is being changed and if it's already taken
  if (fieldsToUpdate.userEmail) {
    const existingUser = await User.findOne({
      userEmail: fieldsToUpdate.userEmail,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new ApiError(409, "Email is already in use by another account.");
    }
  }

  // Update user in Database
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: fieldsToUpdate },
    { new: true, runValidators: true }
  ).select("-userPassword -refreshToken");

  if (!updatedUser) {
    throw new ApiError(404, "User not found.");
  }

  return response
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User details updated successfully.")
    );
});

// Update user cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        userCoverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-userPassword -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

// Get user profile by ID (public profile)
const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findById(userId).select(
    "-userPassword -refreshToken -userEmail -userPhoneNumber"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(404, "User profile not available");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

// Admin: Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user?.userRole !== "admin") {
    throw new ApiError(403, "Access denied. Admin privileges required.");
  }

  const {
    page = 1,
    limit = 10,
    search = "",
    userRole = "",
    isActive = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query
  const query = {};

  if (search) {
    query.$or = [
      { userName: { $regex: search, $options: "i" } },
      { userEmail: { $regex: search, $options: "i" } },
    ];
  }

  if (userRole) {
    query.userRole = userRole;
  }

  if (isActive !== "") {
    query.isActive = isActive === "true";
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const users = await User.find(query)
    .select("-userPassword -refreshToken")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const totalUsers = await User.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          usersPerPage: parseInt(limit),
        },
      },
      "Users fetched successfully"
    )
  );
});

// Admin: Update user status
const updateUserStatus = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user?.userRole !== "admin") {
    throw new ApiError(403, "Access denied. Admin privileges required.");
  }

  const { userId } = req.params;
  const { isActive, userRole } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const updateFields = {};
  if (typeof isActive === "boolean") {
    updateFields.isActive = isActive;
  }
  if (userRole && ["student", "teacher", "admin"].includes(userRole)) {
    updateFields.userRole = userRole;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No valid update fields provided");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true }
  ).select("-userPassword -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User status updated successfully"));
});

// Forgot password (placeholder - implement with email service)
const forgotPassword = asyncHandler(async (req, res) => {
  const { userEmail } = req.body;

  if (!userEmail) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ userEmail });

  if (!user) {
    // Don't reveal if user exists or not for security
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If the email exists, a reset link has been sent"
        )
      );
  }

  // TODO: Implement email service to send password reset link
  // For now, just return success message

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset link sent to your email"));
});

// Reset password (placeholder - implement with email tokens)
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  // TODO: Implement token verification logic
  // For now, just return success message

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserCoverImage,
  getUserProfile,
  getAllUsers,
  updateUserStatus,
  forgotPassword,
  resetPassword,
};
