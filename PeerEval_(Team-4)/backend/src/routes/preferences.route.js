// import { Router } from "express";
// import {
//   getMyPreferences,
//   updateMyPreferences,
// } from "../controllers/preferences.controller.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";

// const router = Router();

// router.use(verifyJWT);

// // Get current user's preferences
// router.get("/me", getMyPreferences);

// // Update current user's preferences
// router.patch("/me", updateMyPreferences);

// export default router;

// ================================================================================== //

import { Router } from "express";
import {
  getMyPreferences,
  updateMyPreferences,
  updatePreferenceSection,
  getPreferenceSection,
  resetMyPreferences,
  getThemePreference,
  updateThemePreference,
  getNotificationPreferences,
  exportMyPreferences,
  importMyPreferences,
} from "../controllers/preferences.controller.js";
import {
  verifyJWT,
  validateRequiredFields,
  rateLimit,
} from "../middlewares/auth.middleware.js";
const router = Router();
// All routes require authentication
router.use(verifyJWT);
// Main preferences routes
router.route("/me").get(getMyPreferences).patch(updateMyPreferences);
// Section-specific routes
router
  .route("/me/:section")
  .get(getPreferenceSection)
  .patch(updatePreferenceSection);
// Quick access routes
router
  .route("/me/theme")
  .get(getThemePreference)
  .patch(validateRequiredFields(["theme"]), updateThemePreference);
router.route("/me/notifications").get(getNotificationPreferences);
// Utility routes
router.route("/me/reset").post(resetMyPreferences);
router.route("/me/export").get(exportMyPreferences);
router
  .route("/me/import")
  .post(validateRequiredFields(["preferences"]), importMyPreferences);
  
// Rate limiting for sensitive operations
router.use("/me/reset", rateLimit({ max: 3, windowMs: 60 * 60 * 1000 })); // 3 resets per hour
router.use("/me/import", rateLimit({ max: 5, windowMs: 60 * 60 * 1000 })); // 5 imports per hour

export default router;