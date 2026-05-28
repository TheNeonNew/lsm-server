import db from "../db/database.ts";

export interface ServiceLog {
  id: number;
  createdAt: string;
  action: string;
  entity: string;
  entityId: number | null;
  details: string;
}

export function recordServiceOperation(
  action: string,
  entity: string,
  entityId: number | null = null,
  details = ""
) {
  db.query(
    `INSERT INTO ServiceLog (Action, Entity, EntityId, Details) VALUES (?, ?, ?, ?)`
  ).run(action, entity, entityId, details);
}

export async function getServiceLogs(limit = 100): Promise<ServiceLog[]> {
  const rows = db
    .query(
      `SELECT
         Id AS id,
         CreatedAt AS createdAt,
         Action AS action,
         Entity AS entity,
         EntityId AS entityId,
         Details AS details
       FROM ServiceLog
       ORDER BY Id DESC
       LIMIT ?`
    )
    .all(limit);

  return rows.map((row: any) => ({
    id: Number(row.id),
    createdAt: String(row.createdAt),
    action: String(row.action),
    entity: String(row.entity),
    entityId: row.entityId == null ? null : Number(row.entityId),
    details: String(row.details),
  }));
}
