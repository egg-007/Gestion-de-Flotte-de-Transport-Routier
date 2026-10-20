import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      return res.status(401).json({ message: "Token manquant" });
    const secret =
      process.env.JWT_SECRET || "change_this_secret_before_production";
    const payload = jwt.verify(header.slice(7), secret) as any;
    const user = await UserModel.findById(payload.id);
    if (!user || user.suspendu)
      return res.status(401).json({ message: "Compte invalide ou suspendu" });
    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}
export function allowRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user?.role))
      return res.status(403).json({ message: "Accès interdit" });
    next();
  };
}
