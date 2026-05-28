import type { Request, Response } from "express";
import { getStatistics } from "../services/statisticsService.ts";

export class StatisticsController {
  async getStatistics(req: Request, res: Response) {
    try {
      const stats = await getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

export const statisticsController = new StatisticsController();
