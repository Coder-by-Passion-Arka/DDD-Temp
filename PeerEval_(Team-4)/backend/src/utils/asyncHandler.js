// // Higher order function that wraps async functions to handle errors automatically
// const asyncHandler = (requestHandler) => {
//   return (request, response, next) => {
//     Promise.resolve(requestHandler(request, response, next)).catch((err) => next(err));
//   };
// };

// export { asyncHandler };
