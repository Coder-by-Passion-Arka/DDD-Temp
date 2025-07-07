import asyncHandler from "express-async-handler";
import User from "../models/user.models.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { verifyFirebaseToken, getFirebaseUser } from "../services/firebase.service.js";

/**
 * Handle Firebase authentication
 * @route POST /api/v1/auth/firebase
 */
export const handleFirebaseAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, "Firebase ID token is required");
  }

  try {
    // Verify the ID token
    const decodedToken = await verifyFirebaseToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user already exists
    let user = await User.findOne({ userEmail: email });

    if (user) {
      // User exists, update login time
      user.userLastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    } else {
      // Create new user
      user = await User.create({
        userName: name || email.split('@')[0],
        userEmail: email,
        userPassword: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random secure password
        userPhoneNumber: "",
        countryCode: "",
        userRole: "student", // Default role
        userLocation: {
          homeAddress: "",
          currentAddress: ""
        },
        userBio: "",
        userProfileImage: picture || "",
        userCoverImage: "",
        userAcademicInformation: {},
        userSkills: [],
        userSocialMediaProfiles: [],
        isActive: true,
        authProvider: "firebase"
      });
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Check if profile needs completion
    const needsProfileCompletion = !user.userPhoneNumber || 
                                  !user.userLocation?.homeAddress || 
                                  !user.userLocation?.currentAddress;

    // Return user data and tokens
    return res.status(200).json(
      new ApiResponse(
        200, 
        { 
          user, 
          accessToken, 
          refreshToken,
          needsProfileCompletion
        }, 
        "Firebase authentication successful"
      )
    );
  } catch (error) {
    console.error("Firebase auth error:", error);
    throw new ApiError(401, "Invalid or expired Firebase token");
  }
});