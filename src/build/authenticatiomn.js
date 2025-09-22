"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const auth_1 = require("./utils/auth");
async function expressAuthentication(request, securityName, scopes) {
    if (securityName === "jwt") {
        const authHeader = request.headers.authorization;
        if (!authHeader)
            throw new Error("No token");
        const token = authHeader.split(" ")[1];
        const decoded = (0, auth_1.verifyToken)(token);
        if (scopes && !scopes.some(scope => decoded.roles.includes(scope))) {
            throw new Error("Not authorized");
        }
        request.user = decoded; // <-- injecte dans req.user
        return true; // retourne true pour TSOA
    }
    throw new Error("Unknown security");
}
