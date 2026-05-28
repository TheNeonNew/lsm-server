import { Router } from "express";
import { notificationController } from "../controllers/NotificationController.ts";

const router = Router();

router.get("/", (req, res, next) => notificationController.getNotifications(req, res).catch(next));

export default router;
