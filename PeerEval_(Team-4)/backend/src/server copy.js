import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import logger from "./logger.js";
import { fileURLToPath } from "url";
import path from "path";

// // Import routes
// import healthCheckRouter from "./routes/healthCheck.route.js";
// import userRouter from "./routes/user.route.js";
// import errorHandler from "./middlewares/errorHandling.middleware.js";
// import goalsRouter from "./routes/goals.route.js";

dotenv.config({
  path: "src/.env",
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

// Column names for the Logs
const morganFormat =
  ":method :url :status :res[content-length] - :response-time ms";

// Enable CORS for cross-origin requests
// CORS configuration
const corsOptions = {
  origin: [
    // Allowed origins
    "http://localhost:3000", // Listen to port 3000 for frontend
    "http://localhost:5173",  // Listen to port 5173 for frontend
    "*", // Allow all origins (for testing purposes, remove in production)
  ],
  credentials: true,
  methods: [
    // Permissions the Frontend is allowed to use
    "GET", // Allow GET requests
    "POST", // Allow POST requests
    "PUT", // Allow PUT requests
    "DELETE", // Allow DELETE requests
    "PATCH", // Allow PATCH requests
    "OPTIONS" // Allow OPTIONS requests
  ], 
  allowedHeaders: [
    // Headers the Frontend is allowed to use
    "Content-Type", 
    "Authorization", 
    "X-Requested-With"
  ],
};

server.use(
  cors({
    ...corsOptions,
  })
);

// Middleware to parse JSON data
server.use(express.json({ 
  limit: "1mb" 
}));

// Parse URL-encoded data
server.use(express.urlencoded({ 
  extended: true, 
  limit: "1mb" 
}));

// Serve static files from public folder
server.use(express.static(
  path.join(__dirname, "../public")
));

// Cookie parser middleware
server.use(cookieParser());

// Serve static files
server.use(express.static("../public"));

// Morgan logging middleware setup (for development)
server.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[4],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

// Import routes all the routes for cleaner code
import apiRoutes from "./routes/allRoutes.routes.js";
import { errorHandler, notFound } from "./middlewares/auth.middleware.js";

// API routes
server.use("/api/v1", apiRoutes);

// Error handling middleware (should be last)
server.use(notFound);
server.use(errorHandler);

export default server;


// ================================ //

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import morgan from "morgan";
// import cookieParser from "cookie-parser";
// import logger from "./logger.js";

// // Import routes
// import healthCheckRouter from "./routes/healthCheck.routes.js";
// import userRouter from "./routes/user.routes.js";
// import dashboardRouter from "./routes/dashboard.routes.js";
// import assignmentsRouter from "./routes/assignments.routes.js";
// import evaluationsRouter from "./routes/evaluations.routes.js";
// import achievementsRouter from "./routes/achievements.routes.js";
// import settingsRouter from "./routes/settings.routes.js";
// import errorHandler from "./middlewares/errorHandling.middleware.js";

// dotenv.config({
//   path: "src/.env",
// });

// const server = express();

// // Column names for the Logs
// const morganFormat =
//   ":method :url :status :res[content-length] - :response-time ms";

// // Enable CORS for cross-origin requests
// server.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//     optionsSuccessStatus: 200,
//     allowedHeaders: ["Content-Type", "Authorization"],
//     exposedHeaders: ["Authorization"],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   })
// );

// // Middleware to parse JSON data
// server.use(express.json({ limit: "1mb" }));

// // Parse URL-encoded data
// server.use(express.urlencoded({ extended: true, limit: "1mb" }));

// // Cookie parser middleware
// server.use(cookieParser());

// // Serve static files
// server.use(express.static("./public"));

// // Morgan logging middleware
// server.use(
//   morgan(morganFormat, {
//     stream: {
//       write: (message) => {
//         const logObject = {
//           method: message.split(" ")[0],
//           url: message.split(" ")[1],
//           status: message.split(" ")[2],
//           responseTime: message.split(" ")[4],
//         };
//         logger.info(JSON.stringify(logObject));
//       },
//     },
//   })
// );

// // API Routes
// server.use("/api/healthCheck", healthCheckRouter);
// server.use("/api/user", userRouter);
// server.use("/api/dashboard", dashboardRouter);
// server.use("/api/assignments", assignmentsRouter);
// server.use("/api/evaluations", evaluationsRouter);
// server.use("/api/achievements", achievementsRouter);
// server.use("/api/settings", settingsRouter);

// // Admin routes (commented out until proper admin interface is implemented)
// // TODO: Implement proper admin interface and routes
// // server.use("/api/admin", adminRouter);

// // Health check for the API
// server.get("/api", (req, res) => {
//   res.json({
//     success: true,
//     message: "Peer Evaluation System API is running!",
//     version: "1.0.0",
//     timestamp: new Date().toISOString(),
//   });
// });

// // 404 handler for unmatched routes
// server.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//     path: req.originalUrl,
//   });
// });

// // Error handling middleware (should be last)
// server.use(errorHandler);

// export default server;
