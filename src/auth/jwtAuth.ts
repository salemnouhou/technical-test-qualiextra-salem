import jwt from "jsonwebtoken";

// Middleware d'authentification pour TSOA.
// - Lit le token Bearer depuis l'en-tête Authorization
// - Vérifie le token avec JWT_SECRET
// - Si des "scopes" sont requis par la route, vérifie que le token contient au moins un rôle demandé
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function expressAuthentication(
  request: any,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === "jwt") {
    // Format attendu: Authorization: Bearer <token>
    const token = request.headers["authorization"]?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    try {
      // "decoded" doit contenir au moins { roles: string[] } si des scopes sont utilisés
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      if (scopes && scopes.length > 0) {
        // Autoriser si au moins un des rôles requis est présent dans le token
        const hasRole = scopes.some((role) => decoded.roles.includes(role));
        if (!hasRole) throw new Error("Forbidden: insufficient role");
      }

      return decoded; 
    } catch (err) {
      throw new Error("Invalid token");
    }
  }
  throw new Error("No auth method");
}
