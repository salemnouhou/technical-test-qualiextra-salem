import jwt, { SignOptions } from 'jsonwebtoken';

// Helpers JWT dédiés permettant de configurer l'expiration via JWT_EXPIRES_IN
// SECRET provient de la variable d'environnement JWT_SECRET
const SECRET = process.env.JWT_SECRET || '8ee2dad38598903eb58e0fd96995dae6feb66163f1270069daf732683fc2152f';
const EXPIRES = process.env.JWT_EXPIRES_IN || '1h';

export const signJwt = (payload: object) =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES } as SignOptions);

export const verifyJwt = (token: string) =>
  jwt.verify(token, SECRET) as any;
