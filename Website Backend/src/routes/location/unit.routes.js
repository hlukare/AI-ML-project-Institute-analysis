import express from "express";
import {
  getUnits,
  getUnitById,
  registerUnit,
  assignUnitLead,
  updateUnit,
  deleteUnit,
} from "../../controllers/location/unit.controller.js";
import { authRoleMiddleware } from "../../middlewares/auth.middleware.js";
import { USER_ROLE } from "../../constants.js";
const router = express.Router();

//* PUBLIC ROUTES
// Get all units
router.get("/", getUnits);

// Get a unit by ID
router.get("/:unit_id", getUnitById);

//* PRIVATE ROUTES
router.use(authRoleMiddleware([USER_ROLE.superAdmin, USER_ROLE.regionLead]));
// Register a new unit
router.post("/", registerUnit);

// Assign a lead to a unit
router.post("/assignUnitLead", assignUnitLead);

// Update a unit by ID
router.put("/:unit_id", updateUnit);

// Delete a unit by ID
router.delete("/:unit_id", deleteUnit);

export default router;
