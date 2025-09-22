"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
// Hash un mot de passe
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, 10);
}
// Comparer un mot de passe avec un hash
async function comparePasswords(password, hashed) {
    return bcrypt_1.default.compare(password, hashed);
}
// Générer un token JWT
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}
// Vérifier un token JWT
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
