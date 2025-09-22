import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Utilitaires d'authentification simples : hash/compare et génération/validation de JWT
// Remarque: la clé doit être fournie via la variable d'environnement JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Hash un mot de passe
export async function hashPassword(password: string): Promise<string> {
  // Hash synchrone sécurisé avec salt géré par bcrypt (10 tours)
  return bcrypt.hash(password, 10);
}

// Comparer un mot de passe avec un hash
export async function comparePasswords(password: string, hashed: string): Promise<boolean> {
  // Compare un mot de passe en clair avec son hash stocké
  return bcrypt.compare(password, hashed);
}

// Générer un token JWT
export function generateToken(payload: object): string {
  // Génère un JWT avec une expiration par défaut de 1h
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// Vérifier un token JWT
export function verifyToken(token: string): any {
  // Vérifie la validité et l'intégrité d'un JWT
  return jwt.verify(token, JWT_SECRET);
}
