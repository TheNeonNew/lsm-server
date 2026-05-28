import type { Request, Response } from "express";
import { getUpcomingNotifications } from "../services/notificationService.ts";

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const daysAhead = Number(req.query.days ?? 30);
      const notifications = await getUpcomingNotifications(daysAhead);
      res.json({ notifications });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

export const notificationController = new NotificationController();
