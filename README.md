## Technical Test API — Setup & Run Guide

API Node.js/TypeScript avec Express, Prisma (PostgreSQL), TSOA (Swagger), gestion JWT et envoi d'email de vérification via Resend.

### Prérequis
- Node.js 18+ et yarn
- PostgreSQL (base accessible et variable `DATABASE_URL`)

### Installation
```bash
yarn install
```

### Variables d'environnement
Créer un fichier `.env` à la racine, par exemple :
```env
# Application
PORT=3000
NODE_ENV=development

# Base de données (Prisma)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/technical_test?schema=public

# JWT
JWT_SECRET=change-me-please
# Durée optionnelle (utilisée par src/utils/jwt.ts)
JWT_EXPIRES_IN=1h

# Email (Resend)
# Obtenez votre clé sur https://resend.com
RESEND_API_KEY=your_resend_api_key
# Adresse d'expédition pour les emails
EMAIL_FROM="QUALIEXTRA <no-reply@mail.example.com>"

# URL publique de l'API (utilisée pour générer le lien de vérification email)
# Exemple en local :
API_BASE=http://localhost:3000
```

Notes :
- `JWT_SECRET` est requis pour signer/vérifier les tokens (`src/auth/jwtAuth.ts`, `src/utils/auth.ts`, `src/utils/jwt.ts`).
- `DATABASE_URL` est requis par Prisma (`prisma/schema.prisma`).
- `RESEND_API_KEY`, `EMAIL_FROM` et `API_BASE` sont requis pour l'envoi d'email de vérification (`src/utils/mailer.ts`).
- `PORT` est optionnel (défaut 3000).

### Initialisation de la base de données
Appliquez le schéma Prisma (créez la base si besoin) :
```bash
yarn prisma migrate dev --name init
```

Vous pouvez aussi générer le client Prisma (facultatif si `migrate dev` l'a déjà fait) :
```bash
yarn prisma generate
```

### Démarrer en développement
Génère la spec OpenAPI en continu et lance le serveur avec rechargement :
```bash
yarn dev
```
API en local : `http://localhost:3000`

Documentation Swagger : `http://localhost:3000/docs`

### Build et exécution en production
Construire (génère la spec et transpile TypeScript) :
```bash
yarn build
```

Lancer le serveur compilé :
```bash
node src/build/server.js
```

Remarque : le script `start` du `package.json` cible `build/server.js`. Le build TypeScript sort dans `src/build`. Utilisez la commande ci‑dessus (`node src/build/server.js`) ou adaptez le script `start` si nécessaire.

### Données de base et Seeder Prisma
Un seeder Prisma crée automatiquement un compte administrateur par défaut.

- Fichier : `prisma/seed.ts`
- Exécuter manuellement le seeder :
```bash
yarn seed
```

- Exécution lors du build : le script `yarn build` lance aussi `prisma migrate deploy` puis `ts-node prisma/seed.ts`.

- Admin par défaut créé :
  - Email : `admin@admin.com`
  - Mot de passe : `Admin123!`
  - Rôles : `["ADMIN"]`
  - Compte vérifié : `isVerified = true`

Important : changez ce mot de passe en production et définissez un `JWT_SECRET` robuste.

### Endpoints utiles
- Entrée: `GET /` → "API is running 🚀"
- Swagger: `GET /docs`
- Auth (exemples, selon vos routes TSOA): login/register, vérification email via le lien envoyé par Resend (`/auth/verify?token=...`).

### JWT
- Le bearer token est attendu dans l'en-tête `Authorization: Bearer <token>` (`src/auth/jwtAuth.ts`).
- Signature : `JWT_SECRET`.
- Expiration :
  - `src/utils/auth.ts` utilise une durée fixe de 1h.
  - `src/utils/jwt.ts` respecte `JWT_EXPIRES_IN` (défaut `1h`).

### Emails de vérification
À l'inscription, un token de vérification est créé et un email est envoyé via Resend (`src/services/auth.service.ts`). Le lien contient `API_BASE` pour rediriger vers `GET /auth/verify?token=...`.

### Dépannage
- Assurez‑vous que `.env` est présent et chargé avant de lancer l'application.
- Vérifiez que la base PostgreSQL est accessible depuis `DATABASE_URL`.
- En cas de 401/403, vérifiez le header `Authorization` et `JWT_SECRET`.
- Pour l'email, vérifiez `RESEND_API_KEY`, `EMAIL_FROM` et les logs de Resend.

