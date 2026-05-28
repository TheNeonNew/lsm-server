import type { Request, Response } from "express";
import * as userService from "../services/userService.ts";

export class UserController {
  async getAll(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

export const userController = new UserController();
