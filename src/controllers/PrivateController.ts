import { Controller, Get, Request, Route, Security, Response } from "tsoa";

import { ValidateErrorJSON } from "../models/ValidateErrorJSON";

@Route("private")
export class PrivateController extends Controller {

  @Get()
  @Security("jwt")
  @Response<ValidateErrorJSON>(401, "Token manquant ou invalide")
  @Response<ValidateErrorJSON>(500, "Erreur interne du serveur")
  public async privateRoute(@Request() req: any): Promise<{ message: string } | ValidateErrorJSON> {
    // EEndpoint protégé : nécessite un JWT valide
    // L'utilisateur décodé peut être injecté dans req.user selon la configuration d'auth
    try {
      if (!req.user) {
        this.setStatus(401);
        return { message: "Utilisateur non authentifié" };
      }

      //Renvoie Hello <Prénom>
      return { message: `Hello ${req.user.firstName || "User"}` };
    } catch (err: any) {
      this.setStatus(500);
      return { message: "Erreur interne du serveur" };
    }
  }
}
