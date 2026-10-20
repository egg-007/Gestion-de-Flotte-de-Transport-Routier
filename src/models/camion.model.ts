import { Schema, model } from "mongoose";
const camionSchema = new Schema(
  {
    immatriculation: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    kilometrageCumule: { type: Number, required: true, min: 0, default: 0 },
    statut: {
      type: String,
      enum: ["disponible", "maintenance", "archive"],
      default: "disponible",
    },
    seuilMaintenanceKm: { type: Number, min: 0, default: 20000 },
    prochainEntretienKm: { type: Number, min: 0, default: 20000 },
  },
  { timestamps: true },
);
export const CamionModel = model("Camion", camionSchema);
