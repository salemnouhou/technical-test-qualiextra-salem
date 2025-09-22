"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../utils/auth");
const user_service_1 = require("./user.service");
const prisma_1 = __importDefault(require("../prisma"));
const crypto_1 = require("crypto");
const date_fns_1 = require("date-fns");
const emailValidator_1 = require("../utils/emailValidator");
const mailer_1 = require("../utils/mailer");
const userService = new user_service_1.UserService();
class AuthService {
    async register(firstName, lastName, email, password) {
        const existingUser = await userService.findByEmail(email.toLowerCase());
        if (existingUser)
            throw new Error('Email déjà utilisé');
        const isTemp = (0, emailValidator_1.isDisposableEmail)(email);
        // console.log('isTemp', isTemp);
        if (isTemp)
            throw new Error("L'utilisation d'adresses email temporaires ou jetables n'est pas autorisée. Veuillez fournir une adresse email valide pour continuer.");
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                firstName,
                lastName,
                email: email.toLowerCase(),
                password: hashedPassword,
                roles: ['USER'],
                isVerified: false,
            },
        });
        const token = (0, crypto_1.randomUUID)();
        await prisma_1.default.emailVerificationToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt: (0, date_fns_1.addHours)(new Date(), 24),
            },
        });
        // TODO: envoyer l’email avec le lien de vérification
        const sendemail = await (0, mailer_1.sendVerification)(email, token);
        // console.log('sendemail', sendemail);
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, message: 'Compte créé, vérifiez votre email pour activer le compte' };
    }
    async verifyEmail(token) {
        const record = await prisma_1.default.emailVerificationToken.findUnique({ where: { token } });
        if (!record)
            throw new Error('Token invalide');
        if (record.expiresAt < new Date())
            throw new Error('Token expiré');
        await prisma_1.default.user.update({
            where: { id: record.userId },
            data: { isVerified: true },
        });
        await prisma_1.default.emailVerificationToken.delete({ where: { id: record.id } });
        return { message: 'Email vérifié avec succès' };
    }
    async login(email, password) {
        const user = await userService.findByEmail(email.toLowerCase());
        if (!user)
            throw new Error('Utilisateur introuvable');
        if (!user.isVerified)
            throw new Error('Email non vérifié');
        // console.log('user', user);
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match)
            throw new Error('Mot de passe incorrect');
        const token = (0, auth_1.generateToken)({ id: user.id, firstName: user.firstName, email: user.email, roles: user.roles });
        return { token };
    }
}
exports.AuthService = AuthService;
