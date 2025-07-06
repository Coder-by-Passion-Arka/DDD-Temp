import server from "./server.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "src/.env", // If firing npm start from backend/
});

// Connect to MongoDB and start server //
connectDB()
  .then(() => {
    const port = process.env.PORT || 8024;
    server.listen(port, () => {
      console.log(`Server running on https://localhost:${port}`);
      console.log("Connected to MongoDB successfully.");
    });
  }) // Execute immediately asynchronously //
  .catch((error) => {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  })
  .finally(() => {
    console.log("Error at `app.js` file, Diagnose the error and fix it");
  });