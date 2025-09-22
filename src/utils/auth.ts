import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Hash un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Comparer un mot de passe avec un hash
export async function comparePasswords(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

// Générer un token JWT
export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// Vérifier un token JWT
export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}
