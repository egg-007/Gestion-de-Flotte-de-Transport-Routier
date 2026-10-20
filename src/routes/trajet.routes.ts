import { Router } from "express";
import { authenticate, allowRoles } from "../middleware/auth.js";
import {
  addFuel,
  createTrajet,
  getTrajet,
  listTrajets,
  trajetPdf,
  updateTrajetStatus,
} from "../controllers/trajet.controller.js";
export const trajetRouter = Router();
trajetRouter.use(authenticate);
trajetRouter.get("/", listTrajets);
trajetRouter.post("/", allowRoles("Admin"), createTrajet);
trajetRouter.get("/:id/pdf", trajetPdf);
trajetRouter.patch("/:id/statut", updateTrajetStatus);
trajetRouter.post("/:id/carburant", addFuel);
trajetRouter.get("/:id", getTrajet);
