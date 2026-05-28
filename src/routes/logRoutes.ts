import { Router } from "express";
import { logController } from "../controllers/LogController.ts";

const router = Router();

router.get("/", (req, res, next) => logController.getLogs(req, res).catch(next));

export default router;
