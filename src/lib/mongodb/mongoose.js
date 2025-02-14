import mongoose from "mongoose";

let initialized = false;
const MONGODB_URI = process.env.MONGODB_URI;

export const connect = async () => {
  mongoose.set("strictQuery", true);
  if (initialized) {
    console.log("Already connected to MongoDB");
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "skill-learn-test",
    });
    console.log("Connected to MongoDB");
    initialized = true;
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};
