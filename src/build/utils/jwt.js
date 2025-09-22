"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = exports.signJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || '8ee2dad38598903eb58e0fd96995dae6feb66163f1270069daf732683fc2152f';
const EXPIRES = process.env.JWT_EXPIRES_IN || '1h';
const signJwt = (payload) => jsonwebtoken_1.default.sign(payload, SECRET, { expiresIn: EXPIRES });
exports.signJwt = signJwt;
const verifyJwt = (token) => jsonwebtoken_1.default.verify(token, SECRET);
exports.verifyJwt = verifyJwt;
