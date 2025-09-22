import {
  Controller,
  Get,
  Route,
  Security,
  Path,
  Put,
  Delete,
  Body,
  Request,
  Response,
  SuccessResponse,
  Tags,
} from "tsoa";
import { UserService, UpdateUserInput } from "../services/user.service";
import { ValidateErrorJSON } from "../models/ValidateErrorJSON";

const userService = new UserService();

@Route("users")
export class UserController extends Controller {
  @Get("me")
  @Security("jwt")
  @SuccessResponse("200", "Profil récupéré")
  @Response<ValidateErrorJSON>(404, "Utilisateur introuvable")
  @Response<ValidateErrorJSON>(500, "Erreur interne du serveur")
  public async getMe(@Request() req: any) {
    // Récupère le profil de l'utilisateur courant (id provenant du JWT)
    try {
      return await userService.getMe(req.user.id);
    } catch (err: any) {
      if (err.message.includes("introuvable")) {
        this.setStatus(404);
        return { message: err.message };
      }
      this.setStatus(500);
      return { message: err.message };
    }
  }

  @Security("jwt", ["ADMIN"])
  @SuccessResponse("200", "Liste des utilisateurs")
  @Response<ValidateErrorJSON>(403, "Accès interdit")
  @Response<ValidateErrorJSON>(500, "Erreur interne du serveur")
  @Get()
  public async getAll(@Request() req: any) {
    // Accès réservé ADMIN
    try {
      if (!req.user.roles?.includes("ADMIN")) {
        this.setStatus(403);
        return { message: "Accès interdit" };
      }
      return await userService.getAll();
    } catch (err: any) {
      // console.log(req.user.roles);
      if (err.message === "Forbidden") {
        this.setStatus(403);
        return { message: "Accès interdit" };
      }
      this.setStatus(500);
      return { message: "Erreur interne du serveur" };
    }
  }

  @Get("{userId}")
  @Security("jwt")
  @SuccessResponse("200", "Utilisateur récupéré")
  @Response<ValidateErrorJSON>(403, "Forbidden")
  @Response<ValidateErrorJSON>(404, "Utilisateur introuvable")
  @Response<ValidateErrorJSON>(500, "Erreur interne du serveur")
  public async getUser(@Request() req: any, @Path() userId: string) {
    // Autorise la lecture si ADMIN ou propriétaire de la ressource
    try {
      const isAdmin = req.user.roles?.includes("ADMIN");
      const isOwner = req.user.id === userId;

      if (!isAdmin && !isOwner) {
        this.setStatus(403);
        return { message: "Accès interdit" };
      }

      return await userService.getUser(userId);
    } catch (err: any) {
      if (err.message === "Forbidden") {
        this.setStatus(403);
        return { message: "Accès interdit" };
      }
      this.setStatus(500);
      return { message: err.message };
    }
  }

  @Put("{userId}")
  @Security("jwt")
  @SuccessResponse("200", "Utilisateur mis à jour")
  @Response<ValidateErrorJSON>(400, "Aucun champ valide à mettre à jour")
  @Response<ValidateErrorJSON>(403, "Forbidden")
  @Response<ValidateErrorJSON>(500, "Erreur interne du serveur")
  public async updateUser(
    @Request() req: any,
    @Path() userId: string,
    @Body() body: UpdateUserInput
  ) {
    // Mise à jour par le propriétaire ou par un ADMIN (les autres règles sont dans le service)
    try {
      return await userService.updateUser(req.user, userId, body);
    } catch (err: any) {
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

  @Delete("{userId}")
  @Security("jwt", ["ADMIN"])
  @SuccessResponse("200", "Utilisateur supprimé")
  @Response<ValidateErrorJSON>(403, "Forbidden")
  @Response<ValidateErrorJSON>(404, "Utilisateur introuvable")
  @Response<ValidateErrorJSON>(500, "Erreur interne du serveur")
  public async deleteUser(@Path() userId: string) {
    // Suppression réservée ADMIN
    try {
      return await userService.deleteUser(userId);
    } catch (err: any) {
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
}