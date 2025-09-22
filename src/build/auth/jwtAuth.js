"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
async function expressAuthentication(request, securityName, scopes) {
    var _a;
    if (securityName === "jwt") {
        const token = (_a = request.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token)
            throw new Error("No token provided");
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (scopes && scopes.length > 0) {
                const hasRole = scopes.some((role) => decoded.roles.includes(role));
                if (!hasRole)
                    throw new Error("Forbidden: insufficient role");
            }
            return decoded;
        }
        catch (err) {
            throw new Error("Invalid token");
        }
    }
    throw new Error("No auth method");
}
