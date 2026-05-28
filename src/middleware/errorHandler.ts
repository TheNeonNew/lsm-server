import type { Request, Response, NextFunction } from "express";

interface HttpError {
  status?: number;
  message?: string;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Server error:", err);

  const error = err as HttpError;
  const status = error?.status && typeof error.status === "number" ? error.status : 500;
  const message = error?.message && typeof error.message === "string" ? error.message : "Internal server error";

  res.status(status).json({
    error: message,
  });
}
