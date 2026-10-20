import type { Request, Response, NextFunction } from "express";
export function notFound(req: Request, res: Response) {
  res
    .status(404)
    .json({ message: `Route introuvable: ${req.method} ${req.path}` });
}
export function errorHandler(
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error?.code === 11000)
    return res
      .status(409)
      .json({ message: "Valeur déjà utilisée", details: error.keyValue });
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res
      .status(400)
      .json({ message: "Données invalides", details: error.message });
  }
  const status = Number(error?.status) || 500;
  res
    .status(status)
    .json({
      message: status === 500 ? "Erreur interne du serveur" : error.message,
    });
}
