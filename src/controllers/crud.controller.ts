import type { Request, Response } from "express";
import type { Model } from "mongoose";

export function crudController(
  model: Model<any>,
  searchableFields: string[] = [],
) {
  return {
    list: async (_req: Request, res: Response) =>
      res.json(await model.find().sort({ createdAt: -1 })),
    get: async (req: Request, res: Response) => {
      const item = await model.findById(req.params.id);
      if (!item)
        return res.status(404).json({ message: "Ressource introuvable" });
      return res.json(item);
    },
    create: async (req: Request, res: Response) =>
      res.status(201).json(await model.create(req.body)),
    update: async (req: Request, res: Response) => {
      const item = await model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item)
        return res.status(404).json({ message: "Ressource introuvable" });
      return res.json(item);
    },
    remove: async (req: Request, res: Response) => {
      const item = await model.findByIdAndDelete(req.params.id);
      if (!item)
        return res.status(404).json({ message: "Ressource introuvable" });
      return res.status(204).send();
    },
  };
}
