import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  refreshAccessToken,
  registerUser,
  logoutUser,
  loginUser,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
} from "../controllers/user.controller.js";

const router = Router();

// Public routes (Not secured) //

// 1. Register user
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// 2. Login user
router.route("/login").post(loginUser);

// 3. Refresh access token
router.route("/refresh-token").post(refreshAccessToken);

// ======================================================================== //

// Secured Routes (Require authentication) //

// 4. Logout user
router.route("/logout").post(verifyJWT, logoutUser);

// 5. Change password
router.route("/change-password").patch(verifyJWT, changePassword);

// 6. Get the current user profile
router.route("/profile/:userId").get(verifyJWT, getCurrentUser);

// 7. Update User Profile
router.route("/update-profile").patch(
  verifyJWT,
  upload.fields([
    //TODO:
    // { name: "avatar", maxCount: 1 },
    // { name: "coverImage", maxCount: 1 },
  ]),
  updateAccountDetails
);

// 8. Get current user's own profile (without needing userId)
router.route("/me").get(verifyJWT, getCurrentUser);

export default router;
