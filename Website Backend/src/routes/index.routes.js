import express from "express";
import authRoutes from "./auth.routes.js";
import userRouter from "./user.routes.js";
import locationRoutes from "./location/index.js";
import uploadImageRoutes from "./uploadImage.routes.js";
const router = express.Router();
import { authMiddleware } from "../middlewares/auth.middleware.js";
import analysis from "../controllers/analysis.controller.js";

router.use("/auth", authRoutes);
router.use("/user", authMiddleware, userRouter);
router.use("/location", authMiddleware, locationRoutes);
router.use("/images", authMiddleware, uploadImageRoutes);
router.get("/analysis", authMiddleware, analysis);

export default router;
