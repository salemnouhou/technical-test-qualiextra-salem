import express, { json,NextFunction, urlencoded, Response as ExResponse, Request as ExRequest } from "express";
import { RegisterRoutes } from "./routes"; 
import swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";

export const app = express();

// Middlewares de parsing de requêtes (form-urlencoded et JSON)
app.use(urlencoded({ extended: true }));
app.use(json());




// Route de documentation Swagger servie dynamiquement depuis le fichier généré par TSOA
app.use(
  "/docs",
  swaggerUi.serve,
  async (_req: ExRequest, res: ExResponse) => {
    return res.send(
      swaggerUi.generateHTML(await import("./build/swagger.json"))
    );
  }
);



// Injection des routes générées par TSOA à partir des contrôleurs
RegisterRoutes(app);

// Gestion centralisée des erreurs :
// - 422 pour les erreurs de validation TSOA
// - 500 pour toute autre erreur applicative
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
// Endpoint créé pour vérifier que le serveur tourne
app.get("/", (req, res) => res.send("API is running 🚀"));
