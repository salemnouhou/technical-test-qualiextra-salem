import { Controller, Get,Request, Route, Security } from "tsoa";

@Route("private")
export class PrivateController extends Controller {
  @Get()
  @Security("jwt")
  public async privateRoute(@Request() req: any) {
    return `Hello ${req.user.firstName}`;
  }
}
