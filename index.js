import express from "express";
import cors from "cors";
import profileRoutes from "./routes/profile.routes.js";
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.get("/", (_req, res) => {
    res.status(200).json({ status: "success", message: "Intelligence Query Engine" });
});
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "success", message: "ok" });
});
app.use("/api/profiles", profileRoutes);
export default app;
