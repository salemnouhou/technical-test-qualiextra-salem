import { Body, Controller, Post, Route, SuccessResponse, Response } from "tsoa";
import { AuthService } from "../services/auth.service";

interface LoginResponse {
  token: string;
}

interface ValidateErrorJSON {
  message: string;
  details?: { [name: string]: unknown };
}

const authService = new AuthService();

@Route("auth")
export class AuthController extends Controller {

  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Response<ValidateErrorJSON>(409, "Email Already Used")
  @Response<ValidateErrorJSON>(400, "Invalid Email")
  @Response<ValidateErrorJSON>(500, "Internal Server Error")
  @SuccessResponse("201", "Compte créé")
  @Post("register")
  public async register(
    @Body() body: { email: string; password: string; firstName: string; lastName: string }
  ) {
    try {
      const result = await authService.register(
        body.firstName,
        body.lastName,
        body.email,
        body.password
      );
      this.setStatus(201);
      return result;
    } catch (err: any) {
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

  @Post("login")
  @SuccessResponse("200", "Connexion réussie")
  @Response<ValidateErrorJSON>(400, "Email ou mot de passe manquant")
  @Response<ValidateErrorJSON>(401, "Utilisateur introuvable ou mot de passe incorrect")
  @Response<ValidateErrorJSON>(403, "Email non vérifié")
  @Response<ValidateErrorJSON>(500, "Erreur interne du serveur")
  public async login(
    @Body() body: { email: string; password: string }
  ): Promise<LoginResponse | ValidateErrorJSON> {
    try {
      if (!body.email || !body.password) {
        this.setStatus(400);
        return { message: "Email ou mot de passe manquant" };
      }
      return await authService.login(body.email, body.password);
    } catch (err: any) {
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

  @Response<ValidateErrorJSON>(400, "Token invalide ou expiré")
  @Response<ValidateErrorJSON>(500, "Internal Server Error")
  @SuccessResponse("200", "Email vérifié avec succès")
  @Post("verify-email")
  public async verifyEmail(@Body() body: { token: string }): Promise<{ message: string } | ValidateErrorJSON> {
    try {
      const result = await authService.verifyEmail(body.token);
      this.setStatus(200);
      return result;
    } catch (err: any) {
      if (err.message.includes("Token")) {
        this.setStatus(400);
        return { message: err.message };
      }
      this.setStatus(500);
      return { message: "Internal Server Error" };
    }
  }
}
