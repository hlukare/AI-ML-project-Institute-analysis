import express from "express";
import regionRouter from "./region.routes.js";
import unitRouter from "./unit.routes.js";
import instituteRouter from "./institute/index.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const router = express.Router();

//REGION ROUTES
router.use("/region", regionRouter);

//UNIT ROUTES
router.use("/unit", unitRouter);

//INSTITUTE ROUTES
router.use("/institute", instituteRouter);

export default router;
