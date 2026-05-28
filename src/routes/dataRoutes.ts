import { Router } from "express";
import { utilityController } from "../controllers/UtilityController.ts";

const router = Router();

router.get("/export", (req, res, next) => utilityController.exportData(req, res).catch(next));
router.post("/import", (req, res, next) => utilityController.importData(req, res).catch(next));
router.post("/seed", (req, res, next) => utilityController.seed(req, res).catch(next));
router.get("/seed", (req, res, next) => utilityController.seed(req, res).catch(next));
router.post("/clear", (req, res, next) => utilityController.clear(req, res).catch(next));
router.get("/clear", (req, res, next) => utilityController.clear(req, res).catch(next));

export default router;
