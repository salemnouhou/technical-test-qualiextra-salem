"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = exports.ServiceError = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const emailValidator_1 = require("../utils/emailValidator");
class ServiceError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ServiceError';
    }
}
exports.ServiceError = ServiceError;
class UserService {
    // Trouver un user par son email (utilisé pour l’authentification)
    async findByEmail(email) {
        return prisma_1.default.user.findUnique({ where: { email } });
    }
    // Récupérer son propre profil
    async getMe(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                roles: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user)
            throw new Error("Utilisateur introuvable");
        return user;
    }
    // ADMIN: lister tous les users
    async getAll() {
        return prisma_1.default.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                roles: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    // ADMIN: voir détail d’un user
    async getUser(userId) {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error("Utilisateur introuvable");
        return user;
    }
    // Mettre à jour un utilisateur
    async updateUser(currentUser, userId, body) {
        var _a;
        const isAdmin = (_a = currentUser.roles) === null || _a === void 0 ? void 0 : _a.includes("ADMIN");
        const isOwner = currentUser.id === userId;
        if (!isAdmin && !isOwner) {
            throw new Error("Forbidden");
        }
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error("Utilisateur introuvable");
        const data = {};
        if (isOwner && !isAdmin) {
            if (body.firstName !== undefined)
                data.firstName = body.firstName;
            if (body.lastName !== undefined)
                data.lastName = body.lastName;
            if (body.email !== undefined) {
                if (!user.isVerified) {
                    throw new Error("Vous devez vérifier votre email avant de pouvoir le modifier");
                }
                if ((0, emailValidator_1.isDisposableEmail)(body.email)) {
                    throw new Error("Veuillez utiliser une adresse email valide");
                }
                const existingUser = await prisma_1.default.user.findUnique({ where: { email: body.email } });
                if (existingUser && existingUser.id !== userId) {
                    throw new Error("Cet email est déjà utilisé par un autre compte");
                }
                data.email = body.email;
            }
        }
        if (isAdmin) {
            if (body.firstName !== undefined)
                data.firstName = body.firstName;
            if (body.lastName !== undefined)
                data.lastName = body.lastName;
            if (body.email !== undefined) {
                if ((0, emailValidator_1.isDisposableEmail)(body.email)) {
                    throw new Error("Veuillez utiliser une adresse email valide");
                }
                const existingUser = await prisma_1.default.user.findUnique({ where: { email: body.email } });
                if (existingUser && existingUser.id !== userId) {
                    throw new Error("Cet email est déjà utilisé par un autre compte");
                }
                data.email = body.email;
            }
            if (body.password !== undefined)
                data.password = await bcrypt_1.default.hash(body.password, 10);
            if (body.roles !== undefined)
                data.roles = body.roles;
            if (body.isVerified !== undefined)
                data.isVerified = body.isVerified;
        }
        if (Object.keys(data).length === 0) {
            throw new Error("Aucun champ valide à mettre à jour");
        }
        return prisma_1.default.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                roles: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    // ADMIN: supprimer un user
    async deleteUser(userId) {
        return prisma_1.default.user.delete({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                roles: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
}
exports.UserService = UserService;
