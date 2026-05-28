import { Router } from "express";
import equipmentRoutes from "./equipmentRoutes.ts";
import componentRoutes from "./componentRoutes.ts";
import maintenanceRoutes from "./maintenanceRoutes.ts";
import userRoutes from "./userRoutes.ts";
import authRoutes from "./authRoutes.ts";
import dataRoutes from "./dataRoutes.ts";
import logRoutes from "./logRoutes.ts";
import notificationRoutes from "./notificationRoutes.ts";
import statisticsRoutes from "./statisticsRoutes.ts";
import { authenticate } from "../middleware/authMiddleware.ts";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    service: "LSM Backend API",
    version: "1.0.0",
    endpoints: [
      "/equipment",
      "/components",
      "/maintenance",
      "/users",
      "/auth/login",
      "/auth/register",
      "/data/export",
      "/data/import",
      "/data/seed",
      "/data/clear",
      "/notifications",
      "/logs",
      "/statistics",
    ],
  });
});

router.use("/equipment", authenticate, equipmentRoutes);
router.use("/components", authenticate, componentRoutes);
router.use("/maintenance", authenticate, maintenanceRoutes);
router.use("/users", authenticate, userRoutes);
router.use("/auth", authRoutes);
router.use("/data", authenticate, dataRoutes);
router.use("/logs", authenticate, logRoutes);
router.use("/notifications", authenticate, notificationRoutes);
router.use("/statistics", authenticate, statisticsRoutes);

export default router;
