// import Preferences from "../models/preferences.models.js";
// import ApiError from "../utils/apiError.js";

// // Get current user's preferences
// export const getMyPreferences = async (request, response, next) => {
//   try {
//     const userId = request.user._id;
//     let preference = await Preferences.findOne({ userId });
//     if (!preference) {
//       // Create default preferences if not exist
//       preference = await Preferences.create({ userId });
//     }
//     response.json({
//       success: true,
//       preferences: preference,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // Update current user's preferences
// export const updateMyPreferences = async (request, response, next) => {
//   try {
//     const userId = request.user._id;
//     const update = request.body;
//     const preference = await Preferences.findOneAndUpdate(
//       { userId },
//       { $set: update },
//       { new: true, upsert: true }
//     );
//     response.json({ success: true, preferences: preference });
//   } catch (err) {
//     next(err);
//   }
// };

// ========================================================================================= //

import Preferences from "../models/preferences.models.js";
import User from "../models/user.models.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
// Get current user's preferences
const getMyPreferences = asyncHandler(async (request, response) => {
const userId = request.user._id;
try {
const preferences = await Preferences.getUserPreferences(userId);
return response.status(200).json(
  new ApiResponse(
    200,
    {
      preferences: preferences.toObject(),
      version: preferences.version,
      lastModified: preferences.lastModified,
    },
    "Preferences retrieved successfully"
  )
);
} catch (error) {
console.error("Error fetching preferences:", error);
throw new ApiError(500, "Failed to fetch preferences");
}
});
// Update current user's preferences
const updateMyPreferences = asyncHandler(async (request, response) => {
const userId = request.user._id;
const updates = request.body;
// Validate updates structure
if (!updates || typeof updates !== "object") {
throw new ApiError(400, "Invalid preferences data");
}
try {
const updatedPreferences = await Preferences.updateUserPreferences(userId, updates);
return response.status(200).json(
  new ApiResponse(
    200,
    {
      preferences: updatedPreferences.toObject(),
      version: updatedPreferences.version,
      lastModified: updatedPreferences.lastModified,
    },
    "Preferences updated successfully"
  )
);
} catch (error) {
console.error("Error updating preferences:", error);
throw new ApiError(500, "Failed to update preferences");
}
});
// Update specific preference section
const updatePreferenceSection = asyncHandler(async (request, response) => {
const userId = request.user._id;
const { section } = request.params;
const updates = request.body;
const validSections = [
"appearance",
"notifications",
"privacy",
"security",
"dashboard",
"academic",
"accessibility",
"integrations",
"dataManagement"
];
if (!validSections.includes(section)) {
throw new ApiError(400, `Invalid preference section: ${section}`);
}
try {
const sectionUpdate = { [section]: updates };
const updatedPreferences = await Preferences.updateUserPreferences(userId, sectionUpdate);
return response.status(200).json(
  new ApiResponse(
    200,
    {
      preferences: updatedPreferences.toObject(),
      section: section,
      updatedData: updatedPreferences[section],
    },
    `${section} preferences updated successfully`
  )
);
} catch (error) {
console.error(`Error updating ${section} preferences:`, error);
throw new ApiError(500, `Failed to update ${section} preferences`);
}
});
// Get specific preference section
const getPreferenceSection = asyncHandler(async (request, response) => {
const userId = request.user._id;
const { section } = request.params;
const validSections = [
"appearance",
"notifications",
"privacy",
"security",
"dashboard",
"academic",
"accessibility",
"integrations",
"dataManagement"
];
if (!validSections.includes(section)) {
throw new ApiError(400, `Invalid preference section: ${section}`);
}
try {
const preferences = await Preferences.getUserPreferences(userId);
return response.status(200).json(
  new ApiResponse(
    200,
    {
      section: section,
      preferences: preferences[section],
      lastModified: preferences.lastModified,
    },
    `${section} preferences retrieved successfully`
  )
);
} catch (error) {
console.error(`Error fetching ${section} preferences:`, error);
throw new ApiError(500, `Failed to fetch ${section} preferences`);
}
});
// Reset user preferences to default
const resetMyPreferences = asyncHandler(async (request, response) => {
const userId = request.user._id;
try {
const defaultPreferences = await Preferences.resetUserPreferences(userId);
return response.status(200).json(
  new ApiResponse(
    200,
    {
      preferences: defaultPreferences.toObject(),
      version: defaultPreferences.version,
    },
    "Preferences reset to default successfully"
  )
);
} catch (error) {
console.error("Error resetting preferences:", error);
throw new ApiError(500, "Failed to reset preferences");
}
});
// Get theme preference (quick access)
const getThemePreference = asyncHandler(async (request, response) => {
const userId = request.user._id;
try {
const preferences = await Preferences.getUserPreferences(userId);
const theme = preferences.getThemePreference();
return response.status(200).json(
  new ApiResponse(
    200,
    {
      theme: theme,
      systemTheme: preferences.appearance.theme,
    },
    "Theme preference retrieved successfully"
  )
);
} catch (error) {
console.error("Error fetching theme preference:", error);
throw new ApiError(500, "Failed to fetch theme preference");
}
});
// Update theme preference (quick access)
const updateThemePreference = asyncHandler(async (request, response) => {
const userId = request.user._id;
const { theme } = request.body;
if (!["light", "dark", "system"].includes(theme)) {
throw new ApiError(400, "Invalid theme. Must be 'light', 'dark', or 'system'");
}
try {
const updatedPreferences = await Preferences.updateUserPreferences(userId, {
appearance: { theme }
});
return response.status(200).json(
  new ApiResponse(
    200,
    {
      theme: theme,
      preferences: updatedPreferences.appearance,
    },
    "Theme preference updated successfully"
  )
);
} catch (error) {
console.error("Error updating theme preference:", error);
throw new ApiError(500, "Failed to update theme preference");
}
});
// Get notification preferences (quick access)
const getNotificationPreferences = asyncHandler(async (request, response) => {
const userId = request.user._id;
const { type } = request.query; // email, push, inApp, or all
try {
const preferences = await Preferences.getUserPreferences(userId);
const notifications = preferences.getNotificationPreferences(type);
return response.status(200).json(
  new ApiResponse(
    200,
    {
      notifications: notifications,
      type: type || "all",
    },
    "Notification preferences retrieved successfully"
  )
);
} catch (error) {
console.error("Error fetching notification preferences:", error);
throw new ApiError(500, "Failed to fetch notification preferences");
}
});
// Export user preferences
const exportMyPreferences = asyncHandler(async (request, response) => {
const userId = request.user._id;
const { format = "json" } = request.query;
try {
const preferences = await Preferences.getUserPreferences(userId);
const user = await User.findById(userId).select("userName userEmail");
const exportData = {
  user: {
    id: userId,
    name: user.userName,
    email: user.userEmail,
  },
  preferences: preferences.toObject(),
  exportedAt: new Date().toISOString(),
  version: preferences.version,
};

// Set appropriate headers for download
response.setHeader("Content-Type", "application/json");
response.setHeader(
  "Content-Disposition", 
  `attachment; filename="preferences-${user.userName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json"`
);

return response.status(200).json(exportData);
} catch (error) {
console.error("Error exporting preferences:", error);
throw new ApiError(500, "Failed to export preferences");
}
});
// Import user preferences
const importMyPreferences = asyncHandler(async (request, response) => {
const userId = request.user._id;
const { preferences, overwrite = false } = request.body;
if (!preferences || typeof preferences !== "object") {
throw new ApiError(400, "Invalid preferences data for import");
}
try {
let updatedPreferences;
if (overwrite) {
  // Complete replacement
  await Preferences.deleteOne({ userId });
  updatedPreferences = await Preferences.create({
    userId,
    ...preferences,
  });
} else {
  // Merge with existing preferences
  updatedPreferences = await Preferences.updateUserPreferences(userId, preferences);
}

return response.status(200).json(
  new ApiResponse(
    200,
    {
      preferences: updatedPreferences.toObject(),
      imported: true,
      overwrite: overwrite,
    },
    "Preferences imported successfully"
  )
);
} catch (error) {
console.error("Error importing preferences:", error);
throw new ApiError(500, "Failed to import preferences");
}
});
export {
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
};