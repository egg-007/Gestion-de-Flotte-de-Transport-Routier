import { Schema, model } from "mongoose";
const maintenanceSchema = new Schema(
  {
    camion: { type: Schema.Types.ObjectId, ref: "Camion", required: true },
    description: { type: String, required: true, trim: true },
    datePrevue: { type: Date, required: true },
    kilometragePrevu: { type: Number, min: 0 },
    statut: {
      type: String,
      enum: ["planifiee", "terminee"],
      default: "planifiee",
    },
    dateTerminee: { type: Date },
  },
  { timestamps: true },
);
export const MaintenanceModel = model("Maintenance", maintenanceSchema);
