import db from "../db/database.ts";

export interface ServiceLogEntry {
  id: number;
  createdAt: string;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
}

function normalizeServiceLog(row: any): ServiceLogEntry {
  return {
    id: Number(row.id ?? row.Id ?? row.rowid),
    createdAt: String(row.createdAt ?? row.CreatedAt ?? ""),
    action: String(row.action ?? row.Action ?? ""),
    entity: String(row.entity ?? row.Entity ?? ""),
    entityId: row.entityId ?? row.EntityId ? Number(row.entityId ?? row.EntityId) : undefined,
    details: row.details ?? row.Details ? String(row.details ?? row.Details) : undefined,
  };
}

export class ServiceLogRepository {
  getAll(limit?: number): ServiceLogEntry[] {
    const query = limit
      ? `SELECT rowid AS id, CreatedAt as createdAt, Action as action, Entity as entity, EntityId as entityId, Details as details
         FROM ServiceLog ORDER BY CreatedAt DESC LIMIT ?`
      : `SELECT rowid AS id, CreatedAt as createdAt, Action as action, Entity as entity, EntityId as entityId, Details as details
         FROM ServiceLog ORDER BY CreatedAt DESC`;

    const rows = limit ? db.query(query).all(limit) : db.query(query).all();
    return (rows as any[]).map(normalizeServiceLog);
  }

  getById(id: number): ServiceLogEntry | null {
    const rows = db
      .query(
        `SELECT rowid AS id, CreatedAt as createdAt, Action as action, Entity as entity, EntityId as entityId, Details as details
         FROM ServiceLog WHERE rowid = ? OR Id = ?`
      )
      .all(id, id) as any[];
    return rows.length > 0 ? normalizeServiceLog(rows[0]) : null;
  }

  getByEntity(entity: string, entityId?: number): ServiceLogEntry[] {
    if (entityId !== undefined) {
      const rows = db
        .query(
          `SELECT rowid AS id, CreatedAt as createdAt, Action as action, Entity as entity, EntityId as entityId, Details as details
           FROM ServiceLog WHERE Entity = ? AND EntityId = ? ORDER BY CreatedAt DESC`
        )
        .all(entity, entityId) as any[];
      return rows.map(normalizeServiceLog);
    }

    const rows = db
      .query(
        `SELECT rowid AS id, CreatedAt as createdAt, Action as action, Entity as entity, EntityId as entityId, Details as details
         FROM ServiceLog WHERE Entity = ? ORDER BY CreatedAt DESC`
      )
      .all(entity) as any[];
    return rows.map(normalizeServiceLog);
  }

  create(entry: Omit<ServiceLogEntry, "id" | "createdAt">): ServiceLogEntry {
    const result = db
      .query(
        `INSERT INTO ServiceLog (Action, Entity, EntityId, Details) VALUES (?, ?, ?, ?)`
      )
      .run(entry.action, entry.entity, entry.entityId ?? null, entry.details ?? null);

    const id = result.lastInsertRowid as number;
    const created = this.getById(id);
    if (!created) throw new Error("Failed to retrieve created log entry");
    return created;
  }

  delete(id: number): void {
    db.query(`DELETE FROM ServiceLog WHERE rowid = ? OR Id = ?`).run(id, id);
  }

  clear(): void {
    db.query(`DELETE FROM ServiceLog`).run();
  }
}

export const serviceLogRepository = new ServiceLogRepository();
