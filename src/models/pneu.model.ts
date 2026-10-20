import { Schema, model } from "mongoose";
const pneuSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true, trim: true },
    marque: { type: String, trim: true },
    dimension: { type: String, required: true, trim: true },
    kilometrageCumule: { type: Number, min: 0, default: 0 },
    seuilUsureKm: { type: Number, min: 1, default: 60000 },
    etat: {
      type: String,
      enum: ["neuf", "bon", "use", "a_remplacer"],
      default: "neuf",
    },
    camion: { type: Schema.Types.ObjectId, ref: "Camion", default: null },
  },
  { timestamps: true },
);
export const PneuModel = model("Pneu", pneuSchema);
