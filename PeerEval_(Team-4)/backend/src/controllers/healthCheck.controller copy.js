import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "express-async-handler";

const healthCheck = asyncHandler(async (request, response) => {
  const healthStatus = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: "OK",
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  };

  response
    .status(200)
    .json(
      new ApiResponse(
        200,
        healthStatus,
        "Health Check passed - All systems operational"
      )
    );
});

export default healthCheck;
