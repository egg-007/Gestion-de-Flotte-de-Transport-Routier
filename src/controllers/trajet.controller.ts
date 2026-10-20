import type { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { TrajetModel } from "../models/trajet.model.js";
import { UserModel } from "../models/user.model.js";
import { CamionModel } from "../models/camion.model.js";
import { RemorqueModel } from "../models/remorque.model.js";
import { isValidMileage, hasDateOverlap } from "../utils/businessRules.js";

export async function listTrajets(req: Request, res: Response) {
  const user = (req as any).user;
  const filter = user.role === "Admin" ? {} : { chauffeur: user._id };
  res.json(
    await TrajetModel.find(filter)
      .populate("chauffeur", "nom email")
      .populate("camion")
      .populate("remorque")
      .sort({ createdAt: -1 }),
  );
}
export async function getTrajet(req: Request, res: Response) {
  const user = (req as any).user;
  const filter: any = { _id: req.params.id };
  if (user.role !== "Admin") filter.chauffeur = user._id;
  const trajet = await TrajetModel.findOne(filter)
    .populate("chauffeur", "nom email")
    .populate("camion")
    .populate("remorque");
  if (!trajet) return res.status(404).json({ message: "Trajet introuvable" });
  res.json(trajet);
}
export async function createTrajet(req: Request, res: Response) {
  const {
    origine,
    destination,
    marchandise,
    dateDepartPrevue,
    dateArriveePrevue,
    chauffeur,
    camion,
    remorque,
  } = req.body;
  if (
    !origine ||
    !destination ||
    !marchandise ||
    !dateDepartPrevue ||
    !dateArriveePrevue ||
    !chauffeur ||
    !camion
  ) {
    return res.status(400).json({ message: "Champs obligatoires manquants" });
  }
  const start = new Date(dateDepartPrevue),
    end = new Date(dateArriveePrevue);
  if (!(start < end))
    return res
      .status(400)
      .json({ message: "La date d'arrivée doit être après le départ" });
  const driver = await UserModel.findById(chauffeur);
  if (!driver || driver.role !== "Chauffeur" || driver.suspendu)
    return res.status(400).json({ message: "Chauffeur invalide ou suspendu" });
  const truck = await CamionModel.findById(camion);
  if (!truck || truck.statut !== "disponible")
    return res
      .status(409)
      .json({ message: "Camion indisponible, en maintenance ou archivé" });
  if (remorque) {
    const trailer = await RemorqueModel.findById(remorque);
    if (!trailer || trailer.statut !== "disponible")
      return res.status(409).json({ message: "Remorque indisponible" });
  }
  const overlaps = await TrajetModel.find({
    statut: { $ne: "termine" },
    $or: [{ camion }, ...(remorque ? [{ remorque }] : []), { chauffeur }],
  });
  if (
    overlaps.some((t) =>
      hasDateOverlap(
        start,
        end,
        new Date(t.dateDepartPrevue),
        new Date(t.dateArriveePrevue),
      ),
    )
  ) {
    return res
      .status(409)
      .json({
        message:
          "Conflit: chauffeur, camion ou remorque déjà affecté sur cette période",
      });
  }
  const trajet = await TrajetModel.create({
    ...req.body,
    chauffeur,
    camion,
    remorque: remorque || null,
  });
  res.status(201).json(trajet);
}
export async function updateTrajetStatus(req: Request, res: Response) {
  const user = (req as any).user;
  const filter: any = { _id: req.params.id };
  if (user.role !== "Admin") filter.chauffeur = user._id;
  const trajet = await TrajetModel.findOne(filter);
  if (!trajet) return res.status(404).json({ message: "Trajet introuvable" });
  const next = req.body.statut;
  const allowed: Record<string, string[]> = {
    a_faire: ["en_cours"],
    en_cours: ["termine"],
    termine: [],
  };
  if (!allowed[trajet.statut]?.includes(next))
    return res.status(400).json({ message: "Transition de statut invalide" });
  if (next === "en_cours") {
    trajet.dateDepartReelle = new Date();
    if (req.body.kilometrageDepart === undefined)
      return res
        .status(400)
        .json({ message: "kilometrageDepart obligatoire au démarrage" });
    trajet.kilometrageDepart = Number(req.body.kilometrageDepart);
  }
  if (next === "termine") {
    if (
      req.body.kilometrageArrivee === undefined ||
      !isValidMileage(
        Number(trajet.kilometrageDepart),
        Number(req.body.kilometrageArrivee),
      )
    ) {
      return res
        .status(400)
        .json({
          message: "Le kilométrage d'arrivée doit être supérieur au départ",
        });
    }
    trajet.kilometrageArrivee = Number(req.body.kilometrageArrivee);
    trajet.dateArriveeReelle = new Date();
    const truck: any = await CamionModel.findById(trajet.camion);
    if (truck && trajet.kilometrageDepart != null) {
      truck.kilometrageCumule +=
        trajet.kilometrageArrivee - trajet.kilometrageDepart;
      await truck.save();
    }
  }
  trajet.statut = next as any;
  await trajet.save();
  res.json(trajet);
}
export async function addFuel(req: Request, res: Response) {
  const user = (req as any).user;
  const filter: any = { _id: req.params.id };
  if (user.role !== "Admin") filter.chauffeur = user._id;
  const trajet: any = await TrajetModel.findOne(filter);
  if (!trajet) return res.status(404).json({ message: "Trajet introuvable" });
  const volume = Number(req.body.volumeLitres);
  if (!(volume > 0))
    return res
      .status(400)
      .json({ message: "volumeLitres doit être supérieur à 0" });
  trajet.carburants.push({
    volumeLitres: volume,
    prixTotal: req.body.prixTotal,
    kilometrage: req.body.kilometrage,
  });
  await trajet.save();
  const distance =
    trajet.kilometrageArrivee && trajet.kilometrageDepart
      ? trajet.kilometrageArrivee - trajet.kilometrageDepart
      : null;
  const totalFuel = trajet.carburants.reduce(
    (sum: number, item: any) => sum + item.volumeLitres,
    0,
  );
  res
    .status(201)
    .json({
      trajet,
      distanceKm: distance,
      carburantTotalLitres: totalFuel,
      consommationL100Km:
        distance && distance > 0
          ? Math.round((totalFuel / distance) * 10000) / 100
          : null,
    });
}
export async function trajetPdf(req: Request, res: Response) {
  const user = (req as any).user;
  const filter: any = { _id: req.params.id };
  if (user.role !== "Admin") filter.chauffeur = user._id;
  const trajet: any = await TrajetModel.findOne(filter)
    .populate("chauffeur", "nom email")
    .populate("camion")
    .populate("remorque");
  if (!trajet) return res.status(404).json({ message: "Trajet introuvable" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=ordre-mission-${trajet.id}.pdf`,
  );
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(20).text("ORDRE DE MISSION", { align: "center" });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Référence: ${trajet.id}`);
  doc.text(`Origine: ${trajet.origine}`);
  doc.text(`Destination: ${trajet.destination}`);
  doc.text(`Marchandise: ${trajet.marchandise}`);
  doc.text(
    `Départ prévu: ${new Date(trajet.dateDepartPrevue).toLocaleString("fr-FR")}`,
  );
  doc.text(
    `Arrivée prévue: ${new Date(trajet.dateArriveePrevue).toLocaleString("fr-FR")}`,
  );
  doc.text(`Chauffeur: ${trajet.chauffeur?.nom || ""}`);
  doc.text(`Camion: ${trajet.camion?.immatriculation || ""}`);
  doc.text(`Remorque: ${trajet.remorque?.immatriculation || "Aucune"}`);
  doc.text(`Statut: ${trajet.statut}`);
  doc.end();
}
