// This file contains the controllers for social platform authentication like Google and GitHub
import asyncHandler from "express-async-handler";
import User from "../models/user.models.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";

// Generate tokens for social login users
const generateTokensForSocialUser = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found in the database.");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens for social login user.");
  }
};

// Google authentication callback
export const googleCallback = asyncHandler(async (request, response) => {
  try {
    if (!request.user) {
      return response.redirect("/login?error=Google authentication failed");
    }

    const { accessToken, refreshToken } = await generateTokensForSocialUser(
      request.user._id
    );

    // Set cookies
    response.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: process.env.refreshToken_EXPIRY || 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with success
    return response.redirect("/dashboard");
  } catch (error) {
    console.error("Google auth error:", error);
    return response.redirect(
      "/login?error=Internal server error during Google authentication"
    );
  }
});

// GitHub authentication callback
export const githubCallback = asyncHandler(async (request, response) => {
  try {
    if (!request.user) {
      return response.redirect("/login?error=GitHub authentication failed");
    }

    const { accessToken, refreshToken } = await generateTokensForSocialUser(
      request.user._id
    );

    // Set cookies
    response.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: process.env.refreshToken_EXPIRY || 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with success
    return response.redirect("/dashboard");
  } catch (error) {
    console.error("GitHub auth error:", error);
    return response.redirect(
      "/login?error=Internal server error during GitHub authentication"
    );
  }
});

// Get current user's social profile
export const getSocialProfile = asyncHandler(async (request, response) => {
  try {
    const user = await User.findById(request.user._id).select(
      "-userPassword -refreshToken"
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return response
      .status(200)
      .json(new ApiResponse(200, user, "Social profile fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching social profile");
  }
});

// Complete social profile (for first-time social login users)
export const completeSocialProfile = asyncHandler(async (request, response) => {
  try {
    const { userPhoneNumber, countryCode, userLocation, userRole } =
      request.body;

    // Validate required fields
    if (!userPhoneNumber || !countryCode || !userLocation || !userRole) {
      throw new ApiError(400, "Missing required fields");
    }

    // Update user profile
    const user = await User.findByIdAndUpdate(
      request.user._id,
      {
        userPhoneNumber,
        countryCode,
        userLocation,
        userRole,
      },
      { new: true }
    ).select("-userPassword -refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return response
      .status(200)
      .json(
        new ApiResponse(200, user, "Social profile completed successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Error completing social profile");
  }
});
