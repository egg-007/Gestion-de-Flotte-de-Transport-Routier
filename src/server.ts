import express from "express";
import bcrypt from "bcryptjs";
import { connectDatabase } from "./config/database.js";
import { register, login, me } from "./controllers/auth.controller.js";
import { authenticate, allowRoles } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import {
  camionRouter,
  remorqueRouter,
  pneuRouter,
} from "./routes/resource.routes.js";
import { trajetRouter } from "./routes/trajet.routes.js";
import { maintenanceRouter } from "./routes/maintenance.routes.js";
import { UserModel } from "./models/user.model.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/me", authenticate, me);
app.get(
  "/api/chauffeurs",
  authenticate,
  allowRoles("Admin"),
  async (_req, res) => {
    res.json(
      await UserModel.find({ role: "Chauffeur" })
        .select("-password")
        .sort({ nom: 1 }),
    );
  },
);
app.post(
  "/api/chauffeurs",
  authenticate,
  allowRoles("Admin"),
  async (req, res) => {
    const { nom, email, password, permis } = req.body;
    if (!nom || !email || !password || String(password).length < 8) {
      return res
        .status(400)
        .json({
          message:
            "nom, email et password (8 caractères minimum) sont obligatoires",
        });
    }
    const user = await UserModel.create({
      nom,
      email,
      password: await bcrypt.hash(password, 10),
      role: "Chauffeur",
      permis,
    });
    res
      .status(201)
      .json({ id: user.id, nom: user.nom, email: user.email, role: user.role });
  },
);
app.post(
  "/api/chauffeurs/:id/suspendre",
  authenticate,
  allowRoles("Admin"),
  async (req, res) => {
    const user = await UserModel.findOneAndUpdate(
      { _id: req.params.id, role: "Chauffeur" },
      { suspendu: true },
      { new: true },
    ).select("-password");
    if (!user)
      return res.status(404).json({ message: "Chauffeur introuvable" });
    res.json(user);
  },
);
app.post(
  "/api/chauffeurs/:id/reactiver",
  authenticate,
  allowRoles("Admin"),
  async (req, res) => {
    const user = await UserModel.findOneAndUpdate(
      { _id: req.params.id, role: "Chauffeur" },
      { suspendu: false },
      { new: true },
    ).select("-password");
    if (!user)
      return res.status(404).json({ message: "Chauffeur introuvable" });
    res.json(user);
  },
);
app.use("/api/camions", camionRouter);
app.use("/api/remorques", remorqueRouter);
app.use("/api/pneus", pneuRouter);
app.use("/api/trajets", trajetRouter);
app.use("/api/maintenance", maintenanceRouter);

app.get("/", (_req, res) =>
  res.json({
    name: "Gestion de Flotte API",
    version: "1.0.0",
    documentation: "Consulter README.md",
  }),
);
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`Fleet API running on port ${port}`));
}
start().catch((error) => {
  console.error("Could not start API:", error);
  process.exit(1);
});

export default app;
