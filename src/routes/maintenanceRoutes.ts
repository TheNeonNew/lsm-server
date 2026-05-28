import { Router } from "express";
import { maintenanceController } from "../controllers/DataController.ts";

const router = Router();

router.get("/", (req, res, next) => maintenanceController.getAll(req, res).catch(next));
router.get("/equipment/:equipmentId", (req, res, next) => maintenanceController.getByEquipmentId(req, res).catch(next));
router.get("/:id", (req, res, next) => maintenanceController.getById(req, res).catch(next));
router.post("/", (req, res, next) => maintenanceController.create(req, res).catch(next));
router.put("/:id", (req, res, next) => maintenanceController.update(req, res).catch(next));
router.delete("/:id", (req, res, next) => maintenanceController.delete(req, res).catch(next));

export default router;
