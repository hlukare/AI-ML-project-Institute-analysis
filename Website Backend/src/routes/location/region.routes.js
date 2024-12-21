import express from "express";
import {
  registerRegion,
  getRegions,
  getRegionById,
  assignRegionLead,
  updateRegion,
  deleteRegion,
} from "../../controllers/location/region.controller.js";
import { authRoleMiddleware } from "../../middlewares/auth.middleware.js";
import { USER_ROLE } from "../../constants.js";

const router = express.Router();

// PUBLIC ROUTES
// Get all regions
router.get("/", getRegions);

// Get a region by ID
router.get("/:region_id", getRegionById);

//! PRIVATE ROUTES
router.use(authRoleMiddleware([USER_ROLE.superAdmin]));
// Register a new region
router.post("/", registerRegion);

// Assign a lead to a region
router.post("/assignRegionLead", assignRegionLead);

// Update a region by ID
router.put("/:region_id", updateRegion);

// Delete a region by ID
router.delete("/:region_id", deleteRegion);

export default router;
