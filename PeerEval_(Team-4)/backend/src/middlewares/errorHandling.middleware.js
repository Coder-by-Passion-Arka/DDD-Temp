import mongoose from "mongoose";
import ApiError from "../utils/apiError.js";

// Define the error handling middleware
const errorHandler = (err, request, response, next) => {
  let error = err;

  // Check if the error is not an instance of ApiError class
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error instanceof mongoose.Error ? 400 : 500);

    const message = error.message || "An unexpected error occurred";

    error = new ApiError(statusCode, message, error?.errors || [], error.stack);
  }

  const responseData = {
    success: false,
    message: error.message,
    statusCode: error.statusCode,
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
      errors: error.errors,
    }),
  };

  return response.status(error.statusCode || 500).json(responseData);
};

export default errorHandler;
