import express from "express";
import { login } from "../controllers/auth/login.controller.js";
import { registerUser } from "../controllers/auth/registerUser.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/login", login);
router.post("/registerUser", authMiddleware, registerUser);

export default router;
