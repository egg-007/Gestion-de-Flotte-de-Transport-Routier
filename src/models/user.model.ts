import { Schema, model } from "mongoose";
const userSchema = new Schema(
  {
    nom: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["Admin", "Chauffeur"], default: "Chauffeur" },
    suspendu: { type: Boolean, default: false },
    permis: { type: String, trim: true },
  },
  { timestamps: true },
);
export const UserModel = model("User", userSchema);
