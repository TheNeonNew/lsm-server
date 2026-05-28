import { Router } from "express";
import { authController } from "../controllers/AuthController.ts";

const router = Router();

router.post("/login", (req, res, next) => authController.login(req, res).catch(next));
router.post("/register", (req, res, next) => authController.register(req, res).catch(next));

export default router;
