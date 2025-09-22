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
exports.UserController = void 0;
const tsoa_1 = require("tsoa");
const user_service_1 = require("../services/user.service");
const userService = new user_service_1.UserService();
let UserController = class UserController extends tsoa_1.Controller {
    async getMe(req) {
        try {
            return await userService.getMe(req.user.id);
        }
        catch (err) {
            if (err.message.includes("introuvable")) {
                this.setStatus(404);
                return { message: err.message };
            }
            this.setStatus(500);
            return { message: err.message };
        }
    }
    async getAll(req) {
        var _a;
        try {
            if (!((_a = req.user.roles) === null || _a === void 0 ? void 0 : _a.includes("ADMIN"))) {
                this.setStatus(403);
                return { message: "Accès interdit" };
            }
            return await userService.getAll();
        }
        catch (err) {
            // console.log(req.user.roles);
            if (err.message === "Forbidden") {
                this.setStatus(403);
                return { message: "Accès interdit" };
            }
            this.setStatus(500);
            return { message: "Erreur interne du serveur" };
        }
    }
    async getUser(req, userId) {
        var _a;
        try {
            const isAdmin = (_a = req.user.roles) === null || _a === void 0 ? void 0 : _a.includes("ADMIN");
            const isOwner = req.user.id === userId;
            if (!isAdmin && !isOwner) {
                this.setStatus(403);
                return { message: "Accès interdit" };
            }
            return await userService.getUser(userId);
        }
        catch (err) {
            if (err.message === "Forbidden") {
                this.setStatus(403);
                return { message: "Accès interdit" };
            }
            this.setStatus(500);
            return { message: err.message };
        }
    }
    async updateUser(req, userId, body) {
        try {
            return await userService.updateUser(req.user, userId, body);
        }
        catch (err) {
            if (err.message === "Forbidden") {
                this.setStatus(403);
                return { message: "Accès interdit" };
            }
            if (err.message === "Aucun champ valide à mettre à jour") {
                this.setStatus(400);
                return { message: err.message };
            }
            this.setStatus(500);
            return { message: err.message };
        }
    }
    async deleteUser(userId) {
        try {
            return await userService.deleteUser(userId);
        }
        catch (err) {
            if (err.message === "Forbidden") {
                this.setStatus(403);
                return { message: "Accès interdit" };
            }
            if (err.message.includes("introuvable")) {
                this.setStatus(404);
                return { message: err.message };
            }
            this.setStatus(500);
            return { message: err.message };
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, tsoa_1.Get)("me"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)("200", "Profil récupéré"),
    (0, tsoa_1.Response)(404, "Utilisateur introuvable"),
    (0, tsoa_1.Response)(500, "Erreur interne du serveur"),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMe", null);
__decorate([
    (0, tsoa_1.Security)("jwt", ["ADMIN"]),
    (0, tsoa_1.SuccessResponse)("200", "Liste des utilisateurs"),
    (0, tsoa_1.Response)(403, "Accès interdit"),
    (0, tsoa_1.Response)(500, "Erreur interne du serveur"),
    (0, tsoa_1.Get)(),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAll", null);
__decorate([
    (0, tsoa_1.Get)("{userId}"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)("200", "Utilisateur récupéré"),
    (0, tsoa_1.Response)(403, "Forbidden"),
    (0, tsoa_1.Response)(404, "Utilisateur introuvable"),
    (0, tsoa_1.Response)(500, "Erreur interne du serveur"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, tsoa_1.Put)("{userId}"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)("200", "Utilisateur mis à jour"),
    (0, tsoa_1.Response)(400, "Aucun champ valide à mettre à jour"),
    (0, tsoa_1.Response)(403, "Forbidden"),
    (0, tsoa_1.Response)(500, "Erreur interne du serveur"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, tsoa_1.Delete)("{userId}"),
    (0, tsoa_1.Security)("jwt", ["ADMIN"]),
    (0, tsoa_1.SuccessResponse)("200", "Utilisateur supprimé"),
    (0, tsoa_1.Response)(403, "Forbidden"),
    (0, tsoa_1.Response)(404, "Utilisateur introuvable"),
    (0, tsoa_1.Response)(500, "Erreur interne du serveur"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
exports.UserController = UserController = __decorate([
    (0, tsoa_1.Route)("users")
], UserController);
