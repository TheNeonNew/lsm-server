import type { Request, Response } from "express";
import { createAuthToken } from "../middleware/authMiddleware.ts";
import { userRepository } from "../repositories/UserRepository.ts";
import { serviceLogRepository } from "../repositories/ServiceLogRepository.ts";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const email = String(req.body?.email ?? req.query?.email ?? req.query?.Email ?? "").trim().toLowerCase();
      const password = String(req.body?.password ?? req.query?.password ?? "");

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      const user = userRepository.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const hashed = await hashPassword(password);
      if (hashed !== user.password) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      serviceLogRepository.create({
        action: "login",
        entity: "User",
        entityId: user.id,
        details: `Successful login for ${user.email}`,
      });

      const accessToken = createAuthToken(user.id, user.email);
      res.json({
        accessToken,
        tokenType: "JWT",
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          patronymic: user.patronymic,
          email: user.email,
          position: user.position,
        },
      });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { name, surname, patronymic, email, password, position } = req.body;

      if (!name || !surname || !email || !password || !position) {
        return res.status(400).json({ error: "All fields are required." });
      }

      const existing = userRepository.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "User already exists." });
      }

      const passwordHash = await hashPassword(password);
      const user = userRepository.insertUser({
        name,
        surname,
        patronymic,
        email: email.toLowerCase(),
        password: passwordHash,
        position,
      });

      serviceLogRepository.create({
        action: "register",
        entity: "User",
        entityId: user.id,
        details: `New user registered: ${email}`,
      });

      res.status(201).json({ user });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

export const authController = new AuthController();
