import db from "../db/database.ts";

export interface Notification {
  id: number;
  entity: string;
  entityId: number | null;
  type: "maintenance" | "replacement";
  message: string;
  dueDate: string;
  severity: "overdue" | "due_soon";
}

function parseDate(value: unknown): Date | null {
  const parsed = new Date(String(value));
  return Number.isFinite(parsed.valueOf()) ? parsed : null;
}

function buildNotification(
  id: number,
  entity: string,
  entityId: number | null,
  type: "maintenance" | "replacement",
  message: string,
  dueDate: Date,
  severity: "overdue" | "due_soon"
): Notification {
  return {
    id,
    entity,
    entityId,
    type,
    message,
    dueDate: dueDate.toISOString().split("T")[0],
    severity,
  };
}

export async function getUpcomingNotifications(daysAhead = 30): Promise<Notification[]> {
  const now = new Date();
  const upperLimit = new Date(now);
  upperLimit.setDate(now.getDate() + daysAhead);

  const notifications: Notification[] = [];

  const equipmentRows = db
    .query(
      `SELECT
         rowid AS id,
         Name AS name,
         NextMaintenanceDate AS nextMaintenanceDate
       FROM Equipment`
    )
    .all();

  equipmentRows.forEach((row: any) => {
    const nextMaintenanceDate = parseDate(row.nextMaintenanceDate);
    if (!nextMaintenanceDate) {
      return;
    }

    const equipmentId = Number(row.id);
    const name = String(row.name || "Оборудование");
    const daysToDue = Math.ceil((nextMaintenanceDate.valueOf() - now.valueOf()) / (1000 * 60 * 60 * 24));

    if (daysToDue <= 0 || nextMaintenanceDate <= upperLimit) {
      notifications.push(
        buildNotification(
          equipmentId,
          "Equipment",
          equipmentId,
          "maintenance",
          daysToDue <= 0
            ? `Плановое обслуживание оборудования «${name}» просрочено.`
            : `Плановое обслуживание оборудования «${name}» запланировано через ${daysToDue} дней.`,
          nextMaintenanceDate,
          daysToDue <= 0 ? "overdue" : "due_soon"
        )
      );
    }
  });

  const componentRows = db
    .query(
      `SELECT
         rowid AS id,
         Name AS name,
         EquipmentId AS equipmentId,
         LifeSpanInDays AS lifespanDays,
         LastReplacementDate AS lastReplacementDate
       FROM Component`
    )
    .all();

  componentRows.forEach((row: any) => {
    const lastReplacementDate = parseDate(row.lastReplacementDate);
    const lifespanDays = Number(row.lifespanDays ?? 0);
    if (!lastReplacementDate || lifespanDays <= 0) {
      return;
    }

    const replacementDue = new Date(lastReplacementDate);
    replacementDue.setDate(replacementDue.getDate() + lifespanDays);

    const daysToReplacement = Math.ceil((replacementDue.valueOf() - now.valueOf()) / (1000 * 60 * 60 * 24));
    if (daysToReplacement <= 0 || replacementDue <= upperLimit) {
      const componentId = Number(row.id);
      const name = String(row.name || "Компонент");
      notifications.push(
        buildNotification(
          componentId,
          "Component",
          componentId,
          "replacement",
          daysToReplacement <= 0
            ? `Срок эксплуатации компонента «${name}» истек.`
            : `Срок эксплуатации компонента «${name}» истекает через ${daysToReplacement} дней.`,
          replacementDue,
          daysToReplacement <= 0 ? "overdue" : "due_soon"
        )
      );
    }
  });

  return notifications;
}
