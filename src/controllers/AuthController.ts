import { Body, Controller, Post, Route,SuccessResponse,Response, Get, Query } from "tsoa";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";


interface LoginResponse {
  token: string;
}

interface ValidateErrorJSON {
  message: "Validation failed";
  details: { [name: string]: unknown };
}


const userService = new UserService();
const authService = new AuthService();

@Route("auth")
export class AuthController extends Controller {

  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Response<ValidateErrorJSON>(409, "Email Already Used")
  @Response<ValidateErrorJSON>(400, "Invalid Email")
  @Response<ValidateErrorJSON>(500, "Internal Server Error")
  @SuccessResponse("201", "Created")
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
      // Email jetable
      if (err.message.includes("valide")) {
        this.setStatus(400);
        return { error: err.message };
      }
      // Email déjà utilisé
      if (err.message.includes("déjà utilisé")) {
        this.setStatus(409);
        return { error: "Cet email appartient deja à un compte, veuillez vous connecter" };
      }
      // Autres erreurs
      this.setStatus(500);
      return { error: "Internal Server Error" };
    }
  }


  @Post("login")
  public async login(@Body() body: { email: string; password: string }): Promise<LoginResponse> {
    
    const user = await authService.login(body.email, body.password);
    return user;
  }


  @Response<ValidateErrorJSON>(400, "Token invalide ou expiré")
  @Response<ValidateErrorJSON>(500, "Internal Server Error")
  @SuccessResponse("200", "OK")
  @Post("verify-email")
  public async verifyEmail(@Body() body: { token: string }) {
    try {
      const result = await authService.verifyEmail(body.token);
      this.setStatus(200);
      return result;
    } catch (err: any) {
      if (err.message.includes("Token")) {
        this.setStatus(400); 
        return { error: err.message };
      }
      this.setStatus(500);
      return { error: "Internal Server Error" };
    }
  }
}
