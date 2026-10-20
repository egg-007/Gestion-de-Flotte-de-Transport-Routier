import { Router } from "express";
import { crudController } from "../controllers/crud.controller.js";
import { CamionModel } from "../models/camion.model.js";
import { RemorqueModel } from "../models/remorque.model.js";
import { PneuModel } from "../models/pneu.model.js";
import { authenticate, allowRoles } from "../middleware/auth.js";

export const camionRouter = Router();
export const remorqueRouter = Router();
export const pneuRouter = Router();

function mountCrud(
  router: Router,
  controller: ReturnType<typeof crudController>,
) {
  router.use(authenticate, allowRoles("Admin"));
  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.get);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.remove);
}
mountCrud(camionRouter, crudController(CamionModel));
mountCrud(remorqueRouter, crudController(RemorqueModel));
mountCrud(pneuRouter, crudController(PneuModel));
