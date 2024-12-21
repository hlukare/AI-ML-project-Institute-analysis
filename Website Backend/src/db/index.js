import mongoose from "mongoose";

const connectDB = async (URI) => {
  try {
    const response = await mongoose.connect(URI);
    console.log("MongoDB Connected successfully");
  } catch (error) {
    console.error("Error establishing connection with database:", error.message);
    throw new Error("Error establishing connection with database");
  }
};

export default connectDB;

