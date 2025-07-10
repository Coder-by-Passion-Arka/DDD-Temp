// import jwt from "jsonwebtoken";
// import asyncHandler from "express-async-handler";
// import User from "../models/user.models.js";
// import ApiResponse from "../utils/apiResponse.js";
// import ApiError from "../utils/apiError.js";
// import dotenv from "dotenv";

// dotenv.config({ path: "src/.env" });

// // Access and Refresh Token Generator
// const generateAccessTokenAndRefreshToken = asyncHandler(async (userId) => {
//   try {
//     const user = await User.findById(userId);

//     if (!user) {
//       throw new ApiError(404, "User not found in the database.");
//     }

//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();

//     user.refreshToken = refreshToken;
//     await user.save();
//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new ApiError(
//       500,
//       "Error in generating access token and refresh token while finding the user from the database."
//     );
//   }
// });

// // User Registration
// const registerUser = asyncHandler(async (request, response) => {
//   let {
//     userName = "", // Name uploaded by the user
//     userEmail = "", // Email uploaded by the user
//     userPhoneNumber = "", // Username uploaded by the user
//     countryCode = "", // Country code uploaded by the user
//     userPassword = "", // Password uploaded by the user
//     userLocation = {
//       homeAddress: "" | "TODO: Cannot get this field for some reason", // Home address uploaded by the user
//       currentAddress: "" | "TODO: Cannot get this field for some reason", // Current address uploaded by the user
//     }, // Location uploaded by the user
//   } = request.body;

//   // let parsedUserLocation = userLocation;

//   if (typeof userLocation === "string") {
//     // Extract homeAddress and currentAddress from the userLocation string
//     const homeAddressMatch = userLocation.match(
//       /"homeAddress"\s*:\s*"([^"]+)"/
//     );
//     const currentAddressMatch = userLocation.match(
//       /"currentAddress"\s*:\s*"([^"]+)"/
//     );

//     userLocation = {
//       homeAddress: homeAddressMatch ? homeAddressMatch[1] : "",
//       currentAddress: currentAddressMatch ? currentAddressMatch[1] : "",
//     };
//   }

//   // DEBUG: Log each extracted field
//   console.log("🔍 Extracted fields:");
//   console.log("  userName:", `"${userName}"`);
//   console.log("  userEmail:", `"${userEmail}"`);
//   console.log("  userPhoneNumber:", `"${userPhoneNumber}"`);
//   console.log("  countryCode:", `"${countryCode}"`);
//   console.log(
//     "  userPassword:",
//     userPassword ? "***provided***" : "***MISSING***"
//   );
//   console.log("  userLocation:", JSON.stringify(userLocation, null, 2));
//   console.log("  userLocation.homeAddress:", `"${userLocation?.homeAddress}"`);
//   console.log(
//     "  userLocation.currentAddress:",
//     `"${userLocation?.currentAddress}"`
//   );

//   // Validation
//   if (
//     !userName?.trim() ||
//     !userEmail?.trim() ||
//     !userPhoneNumber?.trim() ||
//     !countryCode?.trim() ||
//     !userPassword?.trim() ||
//     !userLocation?.homeAddress?.trim() ||
//     !userLocation?.currentAddress?.trim()
//   ) {
//     throw new ApiError(400, "All required fields must be provided");
//   }

//   // Check if user already exists
//   const existingUser = await User.findOne({
//     $or: [{ userEmail }, { userName }],
//   });

//   if (existingUser) {
//     throw new ApiError(
//       409,
//       "User with this email or username already exists. Please try to Login"
//     );
//   }

//   // Handle file uploads (OPTIONAL - images are not required for registration)
//   const avatarLocalPath = request.files?.avatar?.[0]?.path;
//   const coverImageLocalPath = request.files?.coverImage?.[0]?.path;

//   // Create user object
//   const userData = {
//     userName,
//     userEmail: userEmail.toLowerCase(),
//     userPhoneNumber,
//     countryCode,
//     userPassword,
//     userLocation,
//   };

//   // Add file paths if available (OPTIONAL - only add if files were uploaded)
//   if (avatarLocalPath) {
//     userData.userProfileImage = avatarLocalPath;
//   }
//   if (coverImageLocalPath) {
//     userData.userCoverImage = coverImageLocalPath;
//   }

//   // Create a new user instance
//   const newUser = await User.create(userData);

//   // Being extra sure the user instance has been created and has a valid id
//   const createdUser = await User.findById(newUser._id).select(
//     "-userPassword -refreshToken" // FIXED: Changed from "-password" to "-userPassword"
//   );

//   if (!createdUser) {
//     throw new ApiError(
//       500,
//       "Error occurred while creating a new user and saving to the database. User registration failed!!!"
//     );
//   }

//   // Finally we can say that the user has been registered successfully
//   return response.json(
//     new ApiResponse(201, createdUser, "User has been registered successfully.")
//   );
// });

// // User Login
// const loginUser = asyncHandler(async (request, response) => {
//   const { userEmail = "", userPassword = "" } = request.body;

//   // Validation
//   if (userEmail?.trim() === "" || userPassword?.trim() === "") {
//     throw new ApiError(400, "All fields are required. User login failed!!!");
//   }

//   const user = await User.findOne({
//     userEmail: userEmail.toLowerCase(), // FIXED: Removed undefined userName reference
//   });

//   if (!user) {
//     throw new ApiError(404, "User not found. User login failed!!!");
//   }

//   // Validate password
//   const isPasswordCorrect = await user.isPasswordCorrect(userPassword);

//   if (!isPasswordCorrect) {
//     throw new ApiError(401, "Password is incorrect. User login failed!!!");
//   }

//   // Generate tokens
//   const { accessToken, refreshToken } =
//     await generateAccessTokenAndRefreshToken(user._id);

//   // Update last login
//   user.userLastLogin = new Date();
//   await user.save({ validateBeforeSave: false });

//   // Get user data without sensitive fields
//   const loggedInUser = await User.findById(user._id).select(
//     "-userPassword -refreshToken"
//   );

//   // Cookie options
//   const options = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//   };

//   // Returning response with cookies set
//   return response
//     .status(200)
//     .cookie("access_token", accessToken, options)
//     .cookie("refresh_token", refreshToken, options)
//     .json(
//       new ApiResponse(
//         200,
//         { user: loggedInUser, accessToken, refreshToken },
//         "User has been logged in successfully."
//       )
//     );
// });

// // User automatic login using Refresh Token
// const refreshAccessToken = asyncHandler(async (request, response) => {
//   const incomingRefreshToken =
//     request.cookies.refresh_token || request.body.refreshToken;

//   if (!incomingRefreshToken) {
//     throw new ApiError(401, "Need to Login Again. Refresh Token has expired.");
//   }

//   try {
//     const decodedToken = jwt.verify(
//       incomingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );

//     const tokenUser = await User.findById(decodedToken?._id);

//     if (!tokenUser) {
//       throw new ApiError(401, "Invalid refresh token.");
//     }

//     if (incomingRefreshToken !== tokenUser?.refreshToken) {
//       throw new ApiError(401, "Need to Login Again. User has been long gone!");
//     }

//     const options = {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//     };

//     const { accessToken, refreshToken: newRefreshToken } =
//       await generateAccessTokenAndRefreshToken(tokenUser._id);

//     return response
//       .status(200)
//       .cookie("access_token", accessToken, options)
//       .cookie("refresh_token", newRefreshToken, options)
//       .json(
//         new ApiResponse(
//           200,
//           { accessToken, refreshToken: newRefreshToken },
//           "Access token has been refreshed successfully."
//         )
//       );
//   } catch (error) {
//     throw new ApiError(500, "Error occurred while refreshing access token.");
//   }
// });

// // User Logout
// const logoutUser = asyncHandler(async (request, response) => {
//   await User.findByIdAndUpdate(
//     request.user._id,
//     { $set: { refreshToken: null } },
//     { new: true }
//   );

//   const options = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//   };

//   return response
//     .status(200)
//     .clearCookie("access_token", options)
//     .clearCookie("refresh_token", options)
//     .json(new ApiResponse(200, {}, "User has been logged out successfully."));
// });

// // Change password
// const changePassword = asyncHandler(async (request, response) => {
//   const { oldPassword, newPassword } = request.body;

//   if (!oldPassword || !newPassword) {
//     throw new ApiError(400, "Old password and new password are required");
//   }

//   const findUser = await User.findById(request.user?._id);

//   if (!findUser) {
//     throw new ApiError(404, "User not found.");
//   }

//   const isOldPasswordCorrect = await findUser.isPasswordCorrect(oldPassword);

//   if (!isOldPasswordCorrect) {
//     throw new ApiError(401, "Old password is incorrect.");
//   }

//   findUser.userPassword = newPassword; // FIXED: Changed from "password" to "userPassword"

//   await findUser.save({
//     validateBeforeSave: false,
//   });

//   return response.status(200).json(
//     new ApiResponse(
//       200,
//       {}, // FIXED: Removed undefined "success" variable
//       "Password has been changed successfully."
//     )
//   );
// });

// // Get current User details
// const getCurrentUser = asyncHandler(async (request, response) => {
//   const userId = request?.params.userId || request?.user?._id;

//   const getUser = await User.findById(userId).select(
//     "-userPassword -refreshToken"
//   );

//   if (!getUser) {
//     throw new ApiError(404, "User not found.");
//   }

//   return response
//     .status(200)
//     .json(new ApiResponse(200, getUser, "User details fetched successfully."));
// });

// // Update account details
// const updateAccountDetails = asyncHandler(async (request, response) => {
//   const userId = request.user?._id || request.userId || request.body.userId;

//   if (!userId) {
//     throw new ApiError(400, "User ID is required.");
//   }

//   const {
//     userName,
//     userEmail,
//     userPhoneNumber,
//     userLocation,
//     userBio,
//     userProfileImage,
//     userAcademicInformation,
//     userSkills,
//     userSocialMediaProfiles,
//   } = request.body;

//   // Build update object with only provided fields
//   const fieldsToUpdate = {};

//   if (userName) fieldsToUpdate.userName = userName;
//   if (userEmail) fieldsToUpdate.userEmail = userEmail;
//   if (userPhoneNumber) fieldsToUpdate.userPhoneNumber = userPhoneNumber;
//   if (userBio) fieldsToUpdate.userBio = userBio;
//   if (userLocation) fieldsToUpdate.userLocation = userLocation;
//   if (userAcademicInformation)
//     fieldsToUpdate.userAcademicInformation = userAcademicInformation;
//   if (userSkills) fieldsToUpdate.userSkills = userSkills;
//   if (userSocialMediaProfiles)
//     fieldsToUpdate.userSocialMediaProfiles = userSocialMediaProfiles;

//   // Handle file uploads
//   if (request.files?.avatar?.[0]) {
//     fieldsToUpdate.userProfileImage = request.files.avatar[0].path;
//   }

//   // Update user in Database
//   const updatedUser = await User.findByIdAndUpdate(
//     userId,
//     { $set: fieldsToUpdate }, // FIXED: Changed from "updateFields" to "fieldsToUpdate"
//     { new: true, runValidators: true }
//   ).select("-userPassword -refreshToken");

//   if (!updatedUser) {
//     throw new ApiError(404, "User not found.");
//   }

//   return response
//     .status(200)
//     .json(
//       new ApiResponse(200, updatedUser, "User details updated successfully.")
//     );
// });

// export {
//   registerUser,
//   loginUser,
//   refreshAccessToken,
//   logoutUser,
//   changePassword,
//   getCurrentUser,
//   updateAccountDetails,
// };
