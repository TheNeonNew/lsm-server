import type { Request, Response } from "express";
import { clearAllData, exportData, importData, seedTestData } from "../seed/seed.ts";

export class UtilityController {
  async exportData(req: Request, res: Response) {
    try {
      const data = await exportData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async importData(req: Request, res: Response) {
    try {
      const payload = req.body;
      const data = await importData(payload);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async seed(req: Request, res: Response) {
    try {
      const data = await seedTestData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async clear(req: Request, res: Response) {
    try {
      await clearAllData();
      res.json({ status: "cleared" });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

export const utilityController = new UtilityController();
