import { Router } from "express";
import { equipmentController } from "../controllers/DataController.ts";

const router = Router();

router.get("/", (req, res, next) => equipmentController.getAll(req, res).catch(next));
router.get("/:id", (req, res, next) => equipmentController.getById(req, res).catch(next));
router.post("/", (req, res, next) => equipmentController.create(req, res).catch(next));
router.put("/:id", (req, res, next) => equipmentController.update(req, res).catch(next));
router.delete("/:id", (req, res, next) => equipmentController.delete(req, res).catch(next));

export default router;
