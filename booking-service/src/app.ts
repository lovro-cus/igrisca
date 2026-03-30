import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { router as bookingRouter } from "./routes/bookings";
import { initDb } from "./database";
import logger from "./logger";

export const app = express();
app.use(cors());
app.use(express.json());

app.use((_req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Booking Service API",
      version: "1.0.0",
      description: "Mikrostoritev za upravljanje rezervacij športnih igrišč",
    },
    servers: [{ url: "http://localhost:3001" }],
  },
  apis: ["./src/routes/*.ts"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/bookings", bookingRouter);

app.get("/", (_req, res) => res.redirect("/api-docs"));

app.get("/health", (_req, res) => {
  logger.info("Health check");
  res.json({ status: "ok", service: "booking-service" });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  initDb().then(() => {
    app.listen(PORT, () => logger.info(`Booking service running on port ${PORT}`));
  });
}