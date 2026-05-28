import { Router } from "express";
import { statisticsController } from "../controllers/StatisticsController.ts";

const router = Router();

router.get("/", (req, res, next) => statisticsController.getStatistics(req, res).catch(next));

export default router;
