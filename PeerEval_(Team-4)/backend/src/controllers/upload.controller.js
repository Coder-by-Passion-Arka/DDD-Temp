/**
 * Upload Controller for PeerEval Platform
 *
 * This controller handles file uploads for the peer evaluation platform.
 * It supports various file types including PDFs, images, GIFs, Word documents,
 * Excel files, PowerPoint presentations, videos, and more.
 *
 * Features:
 * - Single and multiple file uploads
 * - File type validation based on multer middleware configuration
 * - File size validation (50MB per file, 10 files max)
 * - Cloudinary integration for cloud storage
 * - Assignment-specific file uploads
 * - Profile image uploads with automatic resizing
 * - File deletion and information retrieval
 * - Upload statistics for administrators
 *
 * Supported file types:
 * - Images: JPEG, PNG, GIF
 * - Documents: PDF, DOC, DOCX, TXT
 * - Spreadsheets: XLS, XLSX
 * - Presentations: PPT, PPTX
 * - Archives: ZIP
 * - Videos: MP4
 *
 * All uploads are processed through the multer middleware for initial validation
 * and then uploaded to Cloudinary for permanent storage.
 */

import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Upload single file
const uploadFile = asyncHandler(async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    const file = req.file;

    // Validate file size (additional check beyond multer)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      // Clean up the uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new ApiError(400, "File size exceeds 50MB limit");
    }

    // Validate file type based on multer middleware configuration
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/zip",
      "video/mp4",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      // Clean up the uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new ApiError(400, `File type ${file.mimetype} is not allowed`);
    }

    // Upload to Cloudinary
    const uploadResult = await uploadOnCloudinary(file.path);

    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload file to cloud storage");
    }

    // Prepare response data
    const fileData = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      format: uploadResult.format,
      resourceType: uploadResult.resource_type,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      metadata: {
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        etag: uploadResult.etag,
        version: uploadResult.version,
        versionId: uploadResult.version_id,
      },
    };

    return res
      .status(200)
      .json(new ApiResponse(200, fileData, "File uploaded successfully"));
  } catch (error) {
    // Clean up file if it exists and upload failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw error;
  }
});

// Upload multiple files
const uploadMultipleFiles = asyncHandler(async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "No files uploaded");
    }

    const files = req.files;
    const maxFiles = 10; // Maximum 10 files as per multer config

    if (files.length > maxFiles) {
      // Clean up uploaded files
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      throw new ApiError(400, `Maximum ${maxFiles} files allowed`);
    }

    const uploadPromises = [];
    const uploadResults = [];
    const errors = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Validate file size
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          errors.push({
            filename: file.originalname,
            error: "File size exceeds 50MB limit",
          });
          // Clean up this file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          continue;
        }

        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "application/zip",
          "video/mp4",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          errors.push({
            filename: file.originalname,
            error: `File type ${file.mimetype} is not allowed`,
          });
          // Clean up this file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          continue;
        }

        // Upload to Cloudinary
        const uploadResult = await uploadOnCloudinary(file.path);

        if (uploadResult) {
          uploadResults.push({
            publicId: uploadResult.public_id,
            url: uploadResult.secure_url,
            originalName: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            format: uploadResult.format,
            resourceType: uploadResult.resource_type,
            uploadedBy: req.user._id,
            uploadedAt: new Date(),
            metadata: {
              width: uploadResult.width,
              height: uploadResult.height,
              bytes: uploadResult.bytes,
              etag: uploadResult.etag,
              version: uploadResult.version,
              versionId: uploadResult.version_id,
            },
          });
        } else {
          errors.push({
            filename: file.originalname,
            error: "Failed to upload to cloud storage",
          });
        }
      } catch (fileError) {
        errors.push({
          filename: file.originalname,
          error: fileError.message || "Upload failed",
        });
        // Clean up this file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    // Prepare response
    const responseData = {
      successful: uploadResults,
      failed: errors,
      summary: {
        totalFiles: files.length,
        successfulUploads: uploadResults.length,
        failedUploads: errors.length,
      },
    };

    const statusCode = uploadResults.length > 0 ? 200 : 400;
    const message =
      uploadResults.length > 0
        ? `${uploadResults.length} file(s) uploaded successfully`
        : "All file uploads failed";

    return res
      .status(statusCode)
      .json(new ApiResponse(statusCode, responseData, message));
  } catch (error) {
    // Clean up all files if they exist
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    throw error;
  }
});

// Delete file from Cloudinary
const deleteFile = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  if (!publicId) {
    throw new ApiError(400, "Public ID is required");
  }

  try {
    // Delete from Cloudinary
    const deleteResult = await deleteFromCloudinary(publicId);

    if (!deleteResult) {
      throw new ApiError(500, "Failed to delete file from cloud storage");
    }

    if (deleteResult.result === "not found") {
      throw new ApiError(404, "File not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { publicId, result: deleteResult.result },
          "File deleted successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to delete file");
  }
});

// Get file information
const getFileInfo = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  if (!publicId) {
    throw new ApiError(400, "Public ID is required");
  }

  try {
    // Get file info from Cloudinary
    const fileInfo = await cloudinary.api.resource(publicId);

    if (!fileInfo) {
      throw new ApiError(404, "File not found");
    }

    const responseData = {
      publicId: fileInfo.public_id,
      url: fileInfo.secure_url,
      format: fileInfo.format,
      resourceType: fileInfo.resource_type,
      size: fileInfo.bytes,
      width: fileInfo.width,
      height: fileInfo.height,
      createdAt: fileInfo.created_at,
      metadata: {
        etag: fileInfo.etag,
        version: fileInfo.version,
        versionId: fileInfo.version_id,
      },
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseData,
          "File information retrieved successfully"
        )
      );
  } catch (error) {
    if (error.http_code === 404) {
      throw new ApiError(404, "File not found");
    }
    throw new ApiError(
      500,
      error.message || "Failed to retrieve file information"
    );
  }
});

// Upload file for specific assignment submission
const uploadAssignmentFile = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  if (!assignmentId) {
    throw new ApiError(400, "Assignment ID is required");
  }

  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  try {
    const file = req.file;

    // Upload to Cloudinary with assignment-specific folder
    const uploadResult = await uploadOnCloudinary(file.path, {
      folder: `assignments/${assignmentId}`,
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
    });

    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload file to cloud storage");
    }

    const fileData = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      format: uploadResult.format,
      resourceType: uploadResult.resource_type,
      assignmentId,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      metadata: {
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        etag: uploadResult.etag,
        version: uploadResult.version,
        versionId: uploadResult.version_id,
      },
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, fileData, "Assignment file uploaded successfully")
      );
  } catch (error) {
    // Clean up file if it exists and upload failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw error;
  }
});

// Upload profile image
const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No image file uploaded");
  }

  try {
    const file = req.file;

    // Validate that it's an image
    if (!file.mimetype.startsWith("image/")) {
      // Clean up the uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new ApiError(
        400,
        "Only image files are allowed for profile pictures"
      );
    }

    // Upload to Cloudinary with profile-specific folder
    const uploadResult = await uploadOnCloudinary(file.path, {
      folder: `profiles/${req.user._id}`,
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload profile image");
    }

    const imageData = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      originalName: file.originalname,
      size: file.size,
      format: uploadResult.format,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      metadata: {
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
      },
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, imageData, "Profile image uploaded successfully")
      );
  } catch (error) {
    // Clean up file if it exists and upload failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw error;
  }
});

// Get upload statistics (admin only)
const getUploadStatistics = asyncHandler(async (req, res) => {
  // This would typically query a database for upload statistics
  // For now, returning mock data structure

  if (req.user.userRole !== "admin") {
    throw new ApiError(403, "Access denied. Admin privileges required.");
  }

  const stats = {
    totalUploads: 0,
    totalSize: 0,
    uploadsByType: {
      images: 0,
      documents: 0,
      videos: 0,
      others: 0,
    },
    uploadsByMonth: [],
    topUploaders: [],
    storageUsage: {
      used: 0,
      limit: 1000000000, // 1GB limit example
      percentage: 0,
    },
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Upload statistics retrieved successfully")
    );
});

export {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getFileInfo,
  uploadAssignmentFile,
  uploadProfileImage,
  getUploadStatistics,
};
