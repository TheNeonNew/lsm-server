import { Router } from "express";
import { componentController } from "../controllers/DataController.ts";

const router = Router();

router.get("/", (req, res, next) => componentController.getAll(req, res).catch(next));
router.get("/:id", (req, res, next) => componentController.getById(req, res).catch(next));
router.post("/", (req, res, next) => componentController.create(req, res).catch(next));
router.put("/:id", (req, res, next) => componentController.update(req, res).catch(next));
router.delete("/:id", (req, res, next) => componentController.delete(req, res).catch(next));

export default router;
