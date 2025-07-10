// import asyncHandler from "express-async-handler";
// import User from "../models/user.models.js";
// import ApiResponse from "../utils/apiResponse.js";
// import ApiError from "../utils/apiError.js";
// import {
//   verifyFirebaseToken,
//   getFirebaseUser,
// } from "../services/firebase.service.js";

// /**
//  * Handle Firebase authentication
//  * @route POST /api/v1/auth/firebase
//  */
// export const handleFirebaseAuth = asyncHandler(async (request, response) => {
//   const { idToken } = request.body;

//   if (!idToken) {
//     throw new ApiError(400, "Firebase ID token is required");
//   }

//   try {
//     // Verify the ID token
//     const decodedToken = await verifyFirebaseToken(idToken);
//     const { uid, email, name, picture } = decodedToken;

//     // Check if user already exists
//     let user = await User.findOne({ userEmail: email });

//     if (user) {
//       // User exists, update login time
//       user.userLastLogin = new Date();
//       await user.save({ validateBeforeSave: false });
//     } else {
//       // Create new user
//       user = await User.create({
//         userName: name || email.split("@")[0],
//         userEmail: email,
//         userPassword:
//           Math.random().toString(36).slice(-8) +
//           Math.random().toString(36).slice(-8), // Random secure password
//         userPhoneNumber: "",
//         countryCode: "",
//         userRole: "student", // Default role
//         userLocation: {
//           homeAddress: "",
//           currentAddress: "",
//         },
//         userBio: "",
//         userProfileImage: picture || "",
//         userCoverImage: "",
//         userAcademicInformation: {},
//         userSkills: [],
//         userSocialMediaProfiles: [],
//         isActive: true,
//         authProvider: "firebase",
//       });
//     }

//     // Generate tokens
//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();
//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     // Check if profile needs completion
//     const needsProfileCompletion =
//       !user.userPhoneNumber ||
//       !user.userLocation?.homeAddress ||
//       !user.userLocation?.currentAddress;

//     // Return user data and tokens
//     return response.status(200).json(
//       new ApiResponse(
//         200,
//         {
//           user,
//           accessToken,
//           refreshToken,
//           needsProfileCompletion,
//         },
//         "Firebase authentication successful"
//       )
//     );
//   } catch (error) {
//     console.error("Firebase auth error:", error);
//     throw new ApiError(401, "Invalid or expired Firebase token");
//   }
// });

// ============================================================================================= //

import asyncHandler from "express-async-handler";
import admin from "firebase-admin";
import User from "../models/user.models.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import dotenv from "dotenv";

dotenv.config({ path: "src/.env" });

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

// Generate tokens for Firebase user
const generateTokensForFirebaseUser = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found in the database.");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens for Firebase user.");
  }
};

// Handle Firebase Authentication
export const handleFirebaseAuth = asyncHandler(async (request, response) => {
  try {
    const { idToken } = request.body;

    if (!idToken) {
      throw new ApiError(400, "Firebase ID token is required");
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken) {
      throw new ApiError(401, "Invalid Firebase token");
    }

    const { uid, email, name, picture, email_verified } = decodedToken;

    if (!email_verified) {
      throw new ApiError(
        400,
        "Email not verified. Please verify your email and try again."
      );
    }

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ userEmail: email.toLowerCase() }, { firebaseUid: uid }],
    });

    let needsProfileCompletion = false;

    if (!user) {
      // Create new user from Firebase data
      const userData = {
        userName: name || email.split("@")[0],
        userEmail: email.toLowerCase(),
        firebaseUid: uid,
        userProfileImage: picture || "",
        userRole: "student", // Default role
        isActive: true,
        emailVerified: email_verified,
        // Set temporary values that will need to be completed
        userPhoneNumber: "",
        countryCode: "+1",
        userLocation: {
          homeAddress: "",
          currentAddress: "",
        },
        userBio: "",
        userAcademicInformation: {},
        userSkills: [],
        userSocialMediaProfiles: [],
      };

      user = await User.create(userData);
      needsProfileCompletion = true;
    } else {
      // Update existing user with Firebase data if needed
      const updateFields = {};

      if (!user.firebaseUid) {
        updateFields.firebaseUid = uid;
      }

      if (!user.userProfileImage && picture) {
        updateFields.userProfileImage = picture;
      }

      if (!user.emailVerified && email_verified) {
        updateFields.emailVerified = email_verified;
      }

      // Update last login
      updateFields.userLastLogin = new Date();

      if (Object.keys(updateFields).length > 0) {
        await User.findByIdAndUpdate(user._id, { $set: updateFields });
        user = await User.findById(user._id);
      }

      // Check if profile completion is needed
      needsProfileCompletion =
        !user.userPhoneNumber ||
        !user.userLocation?.homeAddress ||
        !user.userLocation?.currentAddress;
    }

    if (!user.isActive) {
      throw new ApiError(
        403,
        "Your account has been deactivated. Please contact support."
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokensForFirebaseUser(
      user._id
    );

    // Get user data without sensitive fields
    const userData = await User.findById(user._id).select(
      "-userPassword -refreshToken"
    );

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return response
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            user: userData,
            accessToken,
            refreshToken,
            needsProfileCompletion,
            isNewUser: needsProfileCompletion,
          },
          needsProfileCompletion
            ? "Firebase authentication successful. Please complete your profile."
            : "Firebase authentication successful."
        )
      );
  } catch (error) {
    console.error("Firebase auth error:", error);

    if (error.code === "auth/id-token-expired") {
      throw new ApiError(
        401,
        "Firebase token has expired. Please sign in again."
      );
    } else if (error.code === "auth/id-token-revoked") {
      throw new ApiError(
        401,
        "Firebase token has been revoked. Please sign in again."
      );
    } else if (error.code === "auth/invalid-id-token") {
      throw new ApiError(401, "Invalid Firebase token format.");
    }

    throw new ApiError(500, error.message || "Firebase authentication failed");
  }
});

// Complete Firebase user profile
export const completeFirebaseProfile = asyncHandler(
  async (request, response) => {
    try {
      const { userPhoneNumber, countryCode, userLocation, userRole, userBio } =
        request.body;

      // Validate required fields
      if (!userPhoneNumber || !countryCode || !userLocation) {
        throw new ApiError(
          400,
          "Phone number, country code, and location are required"
        );
      }

      if (!userLocation.homeAddress || !userLocation.currentAddress) {
        throw new ApiError(
          400,
          "Both home address and current address are required"
        );
      }

      // Validate role if provided (only admin can set role to admin)
      if (userRole && userRole !== "student" && userRole !== "teacher") {
        if (userRole === "admin" && request.user.userRole !== "admin") {
          throw new ApiError(403, "Only administrators can assign admin role");
        }
      }

      // Update user profile
      const updateFields = {
        userPhoneNumber: userPhoneNumber.trim(),
        countryCode: countryCode.trim(),
        userLocation: {
          homeAddress: userLocation.homeAddress.trim(),
          currentAddress: userLocation.currentAddress.trim(),
        },
      };

      if (userBio) {
        updateFields.userBio = userBio.trim();
      }

      if (userRole && ["student", "teacher"].includes(userRole)) {
        updateFields.userRole = userRole;
      }

      const user = await User.findByIdAndUpdate(
        request.user._id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select("-userPassword -refreshToken");

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      return response
        .status(200)
        .json(new ApiResponse(200, user, "Profile completed successfully"));
    } catch (error) {
      console.error("Profile completion error:", error);
      throw new ApiError(500, "Failed to complete profile");
    }
  }
);

// Get Firebase user info
export const getFirebaseUserInfo = asyncHandler(async (request, response) => {
  try {
    const user = await User.findById(request.user._id).select(
      "-userPassword -refreshToken"
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const needsProfileCompletion =
      !user.userPhoneNumber ||
      !user.userLocation?.homeAddress ||
      !user.userLocation?.currentAddress;

    return response.status(200).json(
      new ApiResponse(
        200,
        {
          user,
          needsProfileCompletion,
        },
        "User information retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Get user info error:", error);
    throw new ApiError(500, "Failed to retrieve user information");
  }
});

export default {
  handleFirebaseAuth,
  completeFirebaseProfile,
  getFirebaseUserInfo,
};