// This file connects the backend to the database
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: "src/.env" });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connectionOptions = {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      // bufferMaxEntries: 0, // Disable mongoose buffering
    };

    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI,
      connectionOptions
    );

    console.log(`\n✅ Connected to MongoDB successfully!`);
    console.log(`📡 Host: ${connectionInstance.connection.host}`);
    console.log(`🗄️  Database: ${connectionInstance.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("\n🔌 MongoDB connection closed through app termination");
      process.exit(0);
    });

    return connectionInstance;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // process.exit(1);
  }
};

export default connectDB;
