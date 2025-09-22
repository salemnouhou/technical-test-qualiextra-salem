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
exports.PrivateController = void 0;
const tsoa_1 = require("tsoa");
let PrivateController = class PrivateController extends tsoa_1.Controller {
    async privateRoute(req) {
        try {
            if (!req.user) {
                this.setStatus(401);
                return { message: "Utilisateur non authentifié" };
            }
            return { message: `Hello ${req.user.firstName || "User"}` };
        }
        catch (err) {
            this.setStatus(500);
            return { message: "Erreur interne du serveur" };
        }
    }
};
exports.PrivateController = PrivateController;
__decorate([
    (0, tsoa_1.Get)(),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Response)(401, "Token manquant ou invalide"),
    (0, tsoa_1.Response)(500, "Erreur interne du serveur"),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrivateController.prototype, "privateRoute", null);
exports.PrivateController = PrivateController = __decorate([
    (0, tsoa_1.Route)("private")
], PrivateController);
