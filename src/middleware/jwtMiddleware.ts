import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const TOKEN_LIFETIME = "24h";

interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export function createAuthToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: TOKEN_LIFETIME });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "Missing authorization header." });
  }

  const token = header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : header.startsWith("JWT ")
    ? header.slice(4).trim()
    : header.trim();

  if (!token) {
    return res.status(401).json({ error: "Missing or invalid authentication token." });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }

  (req as any).user = { id: payload.userId, email: payload.email };
  next();
}
