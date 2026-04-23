import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDb = async () => {
    try {
        const MONGO_URI = process.env.MONGODB_URL;
        if (!MONGO_URI) {
            throw new Error("MONGODB_URL is not defined");
        }
        await mongoose.connect(MONGO_URI);
        console.log("Database connected successfully");
    }
    catch (err) {
        console.error("Database connection error:", err.message);
        process.exit(1);
    }
};
export default connectDb;
