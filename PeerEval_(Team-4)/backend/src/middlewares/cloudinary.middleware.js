// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,  
// });

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;

//     // Upload the file on cloudinary
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//       folder: "peer-evaluation-platform",
//       use_filename: true,
//       unique_filename: false,
//     });

//     // File has been uploaded successfully
//     console.log("File uploaded on Cloudinary:", response.url);

//     // Remove the locally saved temporary file
//     if (fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }

//     return response;
//   } catch (error) {
//     console.error("Cloudinary upload error:", error);

//     // Remove the locally saved temporary file as the upload operation failed
//     if (fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }

//     return null;
//   }
// };

// const deleteFromCloudinary = async (publicId) => {
//   try {
//     if (!publicId) return null;

//     const response = await cloudinary.uploader.destroy(publicId);
//     console.log("File deleted from Cloudinary:", response);
//     return response;
//   } catch (error) {
//     console.error("Cloudinary delete error:", error);
//     return null;
//   }
// };

// export { uploadOnCloudinary, deleteFromCloudinary };

// ======================================= // 

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: "src/.env" });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {string} localFilePath - Local file path
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result
 */
const uploadOnCloudinary = async (localFilePath, options = {}) => {
  try {
    if (!localFilePath) {
      console.error("No file path provided for Cloudinary upload");
      return null;
    }

    // Check if file exists
    if (!fs.existsSync(localFilePath)) {
      console.error("File does not exist:", localFilePath);
      return null;
    }

    // Default upload options
    const defaultOptions = {
      resource_type: "auto", // Automatically detect file type
      folder: "peer-evaluation", // Organize uploads in folders
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      quality: "auto", // Automatic quality optimization
      fetch_format: "auto", // Automatic format optimization
    };

    // Merge with custom options
    const uploadOptions = { ...defaultOptions, ...options };

    // Determine folder based on file type
    const fileExtension = path.extname(localFilePath).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(fileExtension)) {
      uploadOptions.folder = "peer-evaluation/images";
    } else if ([".pdf", ".doc", ".docx", ".txt"].includes(fileExtension)) {
      uploadOptions.folder = "peer-evaluation/documents";
    } else if ([".mp4", ".avi", ".mov", ".wmv"].includes(fileExtension)) {
      uploadOptions.folder = "peer-evaluation/videos";
    }

    console.log("Uploading file to Cloudinary:", localFilePath);

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(
      localFilePath,
      uploadOptions
    );

    console.log("Cloudinary upload successful:", response.public_id);

    // Clean up local file after successful upload
    try {
      fs.unlinkSync(localFilePath);
      console.log("Local file cleaned up:", localFilePath);
    } catch (cleanupError) {
      console.warn("Failed to cleanup local file:", cleanupError.message);
    }

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // Clean up local file even if upload failed
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        console.log(
          "Local file cleaned up after failed upload:",
          localFilePath
        );
      }
    } catch (cleanupError) {
      console.warn(
        "Failed to cleanup local file after error:",
        cleanupError.message
      );
    }

    return null;
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<object>} - Deletion result
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) {
      console.error("No public ID provided for Cloudinary deletion");
      return null;
    }

    console.log("Deleting from Cloudinary:", publicId);

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log("Cloudinary deletion result:", response);
    return response;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    return null;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array<string>} filePaths - Array of local file paths
 * @param {object} options - Upload options
 * @returns {Promise<Array>} - Array of upload results
 */
const uploadMultipleToCloudinary = async (filePaths, options = {}) => {
  try {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      console.error("No file paths provided for multiple upload");
      return [];
    }

    console.log("Uploading multiple files to Cloudinary:", filePaths.length);

    const uploadPromises = filePaths.map((filePath) =>
      uploadOnCloudinary(filePath, options)
    );

    const results = await Promise.allSettled(uploadPromises);

    const successfulUploads = [];
    const failedUploads = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        successfulUploads.push(result.value);
      } else {
        failedUploads.push({
          filePath: filePaths[index],
          error: result.reason || "Upload failed",
        });
      }
    });

    console.log(
      `Multiple upload completed: ${successfulUploads.length} successful, ${failedUploads.length} failed`
    );

    if (failedUploads.length > 0) {
      console.warn("Failed uploads:", failedUploads);
    }

    return successfulUploads;
  } catch (error) {
    console.error("Multiple upload error:", error);
    return [];
  }
};

/**
 * Generate a signed URL for secure access
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Transformation options
 * @returns {string} - Signed URL
 */
const generateSignedUrl = (publicId, options = {}) => {
  try {
    if (!publicId) {
      console.error("No public ID provided for signed URL generation");
      return null;
    }

    const defaultOptions = {
      sign_url: true,
      expire_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
    };

    const urlOptions = { ...defaultOptions, ...options };

    return cloudinary.url(publicId, urlOptions);
  } catch (error) {
    console.error("Signed URL generation error:", error);
    return null;
  }
};

/**
 * Get optimized URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Image transformations
 * @returns {string} - Optimized URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
  try {
    if (!publicId) {
      return null;
    }

    const defaultTransformations = {
      quality: "auto",
      fetch_format: "auto",
    };

    const finalTransformations = {
      ...defaultTransformations,
      ...transformations,
    };

    return cloudinary.url(publicId, finalTransformations);
  } catch (error) {
    console.error("Optimized URL generation error:", error);
    return null;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {string} - Public ID
 */
const extractPublicId = (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl || typeof cloudinaryUrl !== "string") {
      return null;
    }

    // Handle different Cloudinary URL formats
    const urlPattern =
      /\/v\d+\/(.+?)\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|mp4|avi|mov)$/i;
    const match = cloudinaryUrl.match(urlPattern);

    if (match) {
      return match[1]; // Return the public ID without extension
    }

    // Alternative pattern for other formats
    const altPattern = /\/([^\/]+)\.[^.]+$/;
    const altMatch = cloudinaryUrl.match(altPattern);

    if (altMatch) {
      return altMatch[1];
    }

    return null;
  } catch (error) {
    console.error("Public ID extraction error:", error);
    return null;
  }
};

/**
 * Validate Cloudinary configuration
 * @returns {boolean} - Configuration validity
 */
const validateCloudinaryConfig = () => {
  const requiredFields = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missingFields = requiredFields.filter((field) => !process.env[field]);

  if (missingFields.length > 0) {
    console.error("Missing Cloudinary configuration:", missingFields);
    return false;
  }

  return true;
};

// Initialize validation
if (!validateCloudinaryConfig()) {
  console.warn("Cloudinary is not properly configured. File uploads may fail.");
}

export {
  uploadOnCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
  generateSignedUrl,
  getOptimizedUrl,
  extractPublicId,
  validateCloudinaryConfig,
  cloudinary,
};