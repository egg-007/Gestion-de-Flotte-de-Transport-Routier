import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";

export async function register(req: Request, res: Response) {
  const { nom, email, password, role, permis } = req.body;
  if (!nom || !email || !password)
    return res
      .status(400)
      .json({ message: "nom, email et password sont obligatoires" });
  if (String(password).length < 8)
    return res
      .status(400)
      .json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
  const count = await UserModel.countDocuments();
  if (count > 0)
    return res
      .status(403)
      .json({
        message:
          "Inscription initiale déjà effectuée; seul Admin peut créer des comptes via /api/chauffeurs",
      });
  const user = await UserModel.create({
    nom,
    email,
    password: await bcrypt.hash(password, 10),
    role: "Admin",
    permis,
  });
  return res
    .status(201)
    .json({ id: user.id, nom: user.nom, email: user.email, role: user.role });
}
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({
    email: String(email || "")
      .toLowerCase()
      .trim(),
  }).select("+password");
  if (
    !user ||
    user.suspendu ||
    !(await bcrypt.compare(password || "", user.password))
  ) {
    return res
      .status(401)
      .json({ message: "Identifiants invalides ou compte suspendu" });
  }
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "change_this_secret_before_production",
    { expiresIn: "8h" },
  );
  return res.json({
    token,
    user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
  });
}
export async function me(req: Request, res: Response) {
  const user = (req as any).user;
  return res.json({
    id: user.id,
    nom: user.nom,
    email: user.email,
    role: user.role,
    suspendu: user.suspendu,
  });
}
