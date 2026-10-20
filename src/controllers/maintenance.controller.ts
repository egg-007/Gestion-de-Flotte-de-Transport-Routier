import type { Request, Response } from "express";
import { MaintenanceModel } from "../models/maintenance.model.js";
import { CamionModel } from "../models/camion.model.js";
export async function listMaintenance(_req: Request, res: Response) {
  res.json(
    await MaintenanceModel.find().populate("camion").sort({ datePrevue: 1 }),
  );
}
export async function createMaintenance(req: Request, res: Response) {
  const { camion, description, datePrevue, kilometragePrevu } = req.body;
  if (!camion || !description || !datePrevue)
    return res
      .status(400)
      .json({ message: "camion, description et datePrevue sont obligatoires" });
  const truck = await CamionModel.findById(camion);
  if (!truck) return res.status(404).json({ message: "Camion introuvable" });
  truck.statut = "maintenance";
  await truck.save();
  res.status(201).json(
    await MaintenanceModel.create({
      camion,
      description,
      datePrevue,
      kilometragePrevu,
    }),
  );
}
export async function completeMaintenance(req: Request, res: Response) {
  const item: any = await MaintenanceModel.findById(req.params.id);
  if (!item)
    return res.status(404).json({ message: "Maintenance introuvable" });
  item.statut = "terminee";
  item.dateTerminee = new Date();
  await item.save();
  const open = await MaintenanceModel.countDocuments({
    camion: item.camion,
    statut: "planifiee",
  });
  if (!open)
    await CamionModel.findByIdAndUpdate(item.camion, { statut: "disponible" });
  res.json(item);
}
