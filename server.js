import dotenv from "dotenv";
import app from "./index.js"
import connectDb from "./config/db.js";
dotenv.config();
const port = Number(process.env.PORT) || 3000;
const startServer = async () => {
    try {
        await connectDb();
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};
startServer();
