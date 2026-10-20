import { Schema, model } from "mongoose";
const remorqueSchema = new Schema(
  {
    immatriculation: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    kilometrageCumule: { type: Number, min: 0, default: 0 },
    statut: {
      type: String,
      enum: ["disponible", "maintenance", "archive"],
      default: "disponible",
    },
  },
  { timestamps: true },
);
export const RemorqueModel = model("Remorque", remorqueSchema);
