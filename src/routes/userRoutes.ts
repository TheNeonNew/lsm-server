import { Router } from "express";
import { userController } from "../controllers/UserController.ts";

const router = Router();

router.get("/", (req, res, next) => userController.getAll(req, res).catch(next));
router.get("/:id", (req, res, next) => userController.getById(req, res).catch(next));

export default router;
