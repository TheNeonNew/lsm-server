import express from "express";
import apiRoutes from "./routes/index.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { migrationRunner } from "./db/migrationRunner.ts";

// Запуск миграций при старте системы
migrationRunner.runPendingMigrations();

const app = express();
const port = Number(process.env.PORT ?? 8080);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    message: "LSM Backend is running.",
    health: "/api/health",
    api: "/api",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api", apiRoutes);

app.get("/debug", (_req, res) => {
  res.json({
    time: new Date().toISOString(),
    routesLoaded: true,
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down...");
  
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});


