import { Schema, model } from "mongoose";
const carburantSchema = new Schema(
  {
    date: { type: Date, default: Date.now },
    volumeLitres: { type: Number, required: true, min: 0.01 },
    prixTotal: { type: Number, min: 0 },
    kilometrage: { type: Number, min: 0 },
  },
  { _id: true },
);
const trajetSchema = new Schema(
  {
    origine: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    marchandise: { type: String, required: true, trim: true },
    dateDepartPrevue: { type: Date, required: true },
    dateArriveePrevue: { type: Date, required: true },
    dateDepartReelle: { type: Date },
    dateArriveeReelle: { type: Date },
    chauffeur: { type: Schema.Types.ObjectId, ref: "User", required: true },
    camion: { type: Schema.Types.ObjectId, ref: "Camion", required: true },
    remorque: { type: Schema.Types.ObjectId, ref: "Remorque", default: null },
    statut: {
      type: String,
      enum: ["a_faire", "en_cours", "termine"],
      default: "a_faire",
    },
    kilometrageDepart: { type: Number, min: 0 },
    kilometrageArrivee: { type: Number, min: 0 },
    carburants: { type: [carburantSchema], default: [] },
  },
  { timestamps: true },
);
export const TrajetModel = model("Trajet", trajetSchema);
