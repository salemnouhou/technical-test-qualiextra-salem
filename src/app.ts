import express, { json,NextFunction, urlencoded, Response as ExResponse, Request as ExRequest } from "express";
import { RegisterRoutes } from "./routes"; 
import swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";

export const app = express();

app.use(urlencoded({ extended: true }));
app.use(json());


app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
    return res.send(
      swaggerUi.generateHTML(await import("../build/swagger.json"))
    );
  });

RegisterRoutes(app);

app.use(function errorHandler(
  err: unknown,
  req: ExRequest,
  res: ExResponse,
  next: NextFunction
): ExResponse | void {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  next();
});
app.get("/", (req, res) => res.send("API is running 🚀"));
