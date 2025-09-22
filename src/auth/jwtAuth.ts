import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function expressAuthentication(
  request: any,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === "jwt") {
    const token = request.headers["authorization"]?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      if (scopes && scopes.length > 0) {
        const hasRole = scopes.some((role) =>
          decoded.roles.includes(role)
        );
        if (!hasRole) throw new Error("Forbidden: insufficient role");
      }

      return decoded; 
    } catch (err) {
      throw new Error("Invalid token");
    }
  }
  throw new Error("No auth method");
}
