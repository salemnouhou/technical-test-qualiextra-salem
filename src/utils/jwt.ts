import jwt, { SignOptions } from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || '8ee2dad38598903eb58e0fd96995dae6feb66163f1270069daf732683fc2152f';
const EXPIRES = process.env.JWT_EXPIRES_IN || '1h';
export const signJwt = (payload: object) => jwt.sign(payload, SECRET, { expiresIn: EXPIRES } as SignOptions);
export const verifyJwt = (token: string) => jwt.verify(token, SECRET) as any;
