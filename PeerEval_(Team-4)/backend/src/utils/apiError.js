// This file is responsible for handling API errors using the standardized Error Class of Node.js //

class ApiError extends Error {
  // Error is a built-in class in Node.js that represents an error //
  constructor(
    statusCode, // FIXED: statusCode should be first parameter
    message = "An unexpected error occurred!!!",
    errors = [], 
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors; 
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
