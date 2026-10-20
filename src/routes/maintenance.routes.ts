import { Router } from "express";
import { authenticate, allowRoles } from "../middleware/auth.js";
import {
  completeMaintenance,
  createMaintenance,
  listMaintenance,
} from "../controllers/maintenance.controller.js";
export const maintenanceRouter = Router();
maintenanceRouter.use(authenticate, allowRoles("Admin"));
maintenanceRouter.get("/", listMaintenance);
maintenanceRouter.post("/", createMaintenance);
maintenanceRouter.patch("/:id/terminer", completeMaintenance);
