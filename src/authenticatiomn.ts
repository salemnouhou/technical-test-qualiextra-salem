import { Request } from 'express';
import { verifyToken } from './utils/auth';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === "jwt") {
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new Error("No token");

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as any;

    if (scopes && !scopes.some(scope => decoded.roles.includes(scope))) {
      throw new Error("Not authorized");
    }

    request.user = decoded; // <-- injecte dans req.user
    return true;            // retourne true pour TSOA
  }
  throw new Error("Unknown security");
}
