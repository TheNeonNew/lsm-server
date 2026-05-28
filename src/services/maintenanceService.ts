import db from "../db/database.ts";
import * as logService from "./logService.ts";
import type {
  Maintenance,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
} from "../models/maintenance.ts";

function parseIntSafe(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseString(value: unknown, fallback = "") {
  return value == null ? fallback : String(value);
}

function normalizeMaintenance(row: any): Maintenance {
  return {
    id: parseIntSafe(row.id ?? row.Id ?? row.rowid),
    equipmentId: parseIntSafe(row.equipmentId),
    date: parseString(row.date),
    type: parseString(row.type),
    workPerformed: parseString(row.workPerformed),
    performedBy: parseString(row.performedBy),
    checkedBy: parseString(row.checkedBy),
    hoursSpent: parseIntSafe(row.hoursSpent),
    notes: row.notes == null ? null : String(row.notes),
  };
}

export async function getAllMaintenance(): Promise<Maintenance[]> {
  const rows = db
    .query(
      `SELECT
         rowid AS id,
         EquipmentId AS equipmentId,
         MaintenanceDate AS date,
         MaintenanceType AS type,
         PerfomedWork AS workPerformed,
         PerfomedBy AS performedBy,
         CheckedBy AS checkedBy,
         SpentHoursTotal AS hoursSpent,
         Notes AS notes
       FROM Maintenance`
    )
    .all();

  return rows.map(normalizeMaintenance);
}

export async function getMaintenanceById(id: number): Promise<Maintenance | null> {
  const rows = db
    .query(
      `SELECT
         rowid AS id,
         EquipmentId AS equipmentId,
         MaintenanceDate AS date,
         MaintenanceType AS type,
         PerfomedWork AS workPerformed,
         PerfomedBy AS performedBy,
         CheckedBy AS checkedBy,
         SpentHoursTotal AS hoursSpent,
         Notes AS notes
       FROM Maintenance
       WHERE Id = ? OR rowid = ?`
    )
    .all(id, id);

  if (rows.length === 0) {
    return null;
  }

  return normalizeMaintenance(rows[0]);
}

export async function getMaintenanceByEquipmentId(
  equipmentId: number
): Promise<Maintenance[]> {
  const rows = db
    .query(
      `SELECT
         rowid AS id,
         EquipmentId AS equipmentId,
         MaintenanceDate AS date,
         MaintenanceType AS type,
         PerfomedWork AS workPerformed,
         PerfomedBy AS performedBy,
         CheckedBy AS checkedBy,
         SpentHoursTotal AS hoursSpent,
         Notes AS notes
       FROM Maintenance
       WHERE EquipmentId = ?`
    )
    .all(equipmentId);

  return rows.map(normalizeMaintenance);
}

export async function createMaintenance(
  payload: CreateMaintenanceDto
): Promise<Maintenance> {
  const result = db
    .query(
      `INSERT INTO Maintenance (
         EquipmentId,
         MaintenanceDate,
         MaintenanceType,
         PerfomedWork,
         PerfomedBy,
         CheckedBy,
         SpentHoursTotal,
         Notes
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      payload.equipmentId,
      payload.date,
      payload.type,
      payload.workPerformed,
      payload.performedBy,
      payload.checkedBy,
      payload.hoursSpent,
      payload.notes
    );

  const id = Number(result.lastInsertRowid ?? 0);
  logService.recordServiceOperation(
    "create",
    "Maintenance",
    id,
    `Created maintenance for equipment ${payload.equipmentId}`
  );
  return getMaintenanceById(id) as Promise<Maintenance>;
}

export async function updateMaintenance(
  id: number,
  updates: UpdateMaintenanceDto
): Promise<Maintenance | null> {
  const existing = await getMaintenanceById(id);
  if (!existing) {
    return null;
  }

  const merged = {
    ...existing,
    ...updates,
  };

  db
    .query(
      `UPDATE Maintenance SET
         EquipmentId = ?,
         MaintenanceDate = ?,
         MaintenanceType = ?,
         PerfomedWork = ?,
         PerfomedBy = ?,
         CheckedBy = ?,
         SpentHoursTotal = ?,
         Notes = ?
       WHERE Id = ? OR rowid = ?`
    )
    .run(
      merged.equipmentId,
      merged.date,
      merged.type,
      merged.workPerformed,
      merged.performedBy,
      merged.checkedBy,
      merged.hoursSpent,
      merged.notes,
      id,
      id
    );

  logService.recordServiceOperation(
    "update",
    "Maintenance",
    id,
    `Updated maintenance record ${id}`
  );

  return getMaintenanceById(id);
}

export async function deleteMaintenance(id: number): Promise<boolean> {
  const result = db.query("DELETE FROM Maintenance WHERE Id = ? OR rowid = ?").run(id, id);
  if (result.changes > 0) {
    logService.recordServiceOperation(
      "delete",
      "Maintenance",
      id,
      `Deleted maintenance record ${id}`
    );
  }
  return result.changes > 0;
}
