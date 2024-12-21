import express from "express";
import instituteRouter from "./institute.routes.js";
import courseRouter from "./course.routes.js";
const router = express.Router();

router.use("/management", instituteRouter);
router.use("/course", courseRouter);

export default router;
