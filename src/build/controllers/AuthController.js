"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tsoa_1 = require("tsoa");
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
let AuthController = class AuthController extends tsoa_1.Controller {
    async register(body) {
        try {
            const result = await authService.register(body.firstName, body.lastName, body.email, body.password);
            this.setStatus(201);
            return result;
        }
        catch (err) {
            if (err.message.includes("valide")) {
                this.setStatus(400);
                return { message: err.message };
            }
            if (err.message.includes("déjà utilisé")) {
                this.setStatus(409);
                return { message: "Cet email appartient déjà à un compte, veuillez vous connecter" };
            }
            this.setStatus(500);
            return { message: "Internal Server Error" };
        }
    }
    async login(body) {
        try {
            if (!body.email || !body.password) {
                this.setStatus(400);
                return { message: "Email ou mot de passe manquant" };
            }
            return await authService.login(body.email, body.password);
        }
        catch (err) {
            if (err.message === "Utilisateur introuvable" || err.message === "Mot de passe incorrect") {
                this.setStatus(401);
                return { message: err.message };
            }
            if (err.message === "Email non vérifié") {
                this.setStatus(403);
                return { message: err.message };
            }
            this.setStatus(500);
            return { message: "Erreur interne du serveur" };
        }
    }
    async verifyEmail(body) {
        try {
            const result = await authService.verifyEmail(body.token);
            this.setStatus(200);
            return result;
        }
        catch (err) {
            if (err.message.includes("Token")) {
                this.setStatus(400);
                return { message: err.message };
            }
            this.setStatus(500);
            return { message: "Internal Server Error" };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, tsoa_1.Response)(422, "Validation Failed"),
    (0, tsoa_1.Response)(409, "Email Already Used"),
    (0, tsoa_1.Response)(400, "Invalid Email"),
    (0, tsoa_1.Response)(500, "Internal Server Error"),
    (0, tsoa_1.SuccessResponse)("201", "Compte créé"),
    (0, tsoa_1.Post)("register"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, tsoa_1.Post)("login"),
    (0, tsoa_1.SuccessResponse)("200", "Connexion réussie"),
    (0, tsoa_1.Response)(400, "Email ou mot de passe manquant"),
    (0, tsoa_1.Response)(401, "Utilisateur introuvable ou mot de passe incorrect"),
    (0, tsoa_1.Response)(403, "Email non vérifié"),
    (0, tsoa_1.Response)(500, "Erreur interne du serveur"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, tsoa_1.Response)(400, "Token invalide ou expiré"),
    (0, tsoa_1.Response)(500, "Internal Server Error"),
    (0, tsoa_1.SuccessResponse)("200", "Email vérifié avec succès"),
    (0, tsoa_1.Post)("verify-email"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
exports.AuthController = AuthController = __decorate([
    (0, tsoa_1.Route)("auth")
], AuthController);
