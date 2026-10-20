# Gestion de Flotte de Transport Routier

API REST Node.js, Express, TypeScript, MongoDB/Mongoose.

## Lancer le projet

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f api
```

API: `http://localhost:3000`; routes: `/api/auth`, `/api/camions`, `/api/remorques`, `/api/pneus`, `/api/trajets`, `/api/maintenance`.

## Créer le premier administrateur

Inscription ouverte seulement pour initialiser le compte. Pour un environnement réel, désactiver l'inscription publique et créer les comptes par un administrateur.

```http
POST /api/auth/register
Content-Type: application/json
{
  "nom": "Admin",
  "email": "admin@example.com",
  "password": "Admin123!",
  "role": "Admin"
}
```

Connexion:

```http
POST /api/auth/login
{"email":"admin@example.com","password":"Admin123!"}
```

Copier `token` et l'envoyer dans `Authorization: Bearer <token>`.

## Endpoints principaux

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST|GET /:id|PUT /:id|DELETE /:id` sur `/api/camions`, `/api/remorques`, `/api/pneus`
- `GET|POST|GET /:id|PUT /:id|DELETE /:id` sur `/api/trajets`
- `PATCH /api/trajets/:id/statut`
- `GET /api/trajets/:id/pdf`
- `POST /api/trajets/:id/carburant`
- `GET /api/maintenance`, `POST /api/maintenance`, `PATCH /api/maintenance/:id/terminer`

Rôles: `Admin`, `Chauffeur`. Les ressources et règles de maintenance sont réservées à Admin. Un chauffeur ne peut consulter que ses propres trajets.

## Vérification

```bash
docker compose exec api npm run typecheck
docker compose exec api npm test
```
