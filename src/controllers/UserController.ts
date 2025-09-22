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
} from "tsoa";
import { UserService, UpdateUserInput } from "../services/user.service";

const userService = new UserService();

@Route("users")
export class UserController extends Controller {
  @Get("me")
  @Security("jwt")
  public async getMe(@Request() req: any) {
    return userService.getMe(req.user.id);
  }

  @Get()
  @Security("jwt", ["ADMIN"])
  public async getAll() {
    return userService.getAll();
  }

  @Get("{userId}")
  @Security("jwt")
  public async getUser(@Request() req: any, @Path() userId: string) {
    const isAdmin = req.user.roles?.includes("ADMIN");
    const isOwner = req.user.id === userId;

    if (!isAdmin && !isOwner) {
      this.setStatus(403);
      throw new Error("Forbidden");
    }

    return userService.getUser(userId);
  }

  @Put("{userId}")
  @Security("jwt")
  public async updateUser(
    @Request() req: any,
    @Path() userId: string,
    @Body() body: UpdateUserInput
  ) {
    try {
      return await userService.updateUser(req.user, userId, body);
    } catch (err: any) {
      if (err.message === "Forbidden") this.setStatus(403);
      if (err.message === "Aucun champ valide à mettre à jour") this.setStatus(400);
      throw err;
    }
  }

  @Delete("{userId}")
  @Security("jwt", ["ADMIN"])
  public async deleteUser(@Path() userId: string) {
    return userService.deleteUser(userId);
  }
}
