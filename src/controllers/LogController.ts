import type { Request, Response } from "express";
import { getServiceLogs } from "../services/logService.ts";

export class LogController {
  async getLogs(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit ?? 100);
      const logs = await getServiceLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

export const logController = new LogController();
