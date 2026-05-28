import db from "../db/database.ts";
import * as logService from "./logService.ts";
import type { Equipment, CreateEquipmentDto, UpdateEquipmentDto } from "../models/equipment.ts";

function parseIntSafe(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseString(value: unknown, fallback = "") {
  return value == null ? fallback : String(value);
}

function normalizeEquipment(row: any): Equipment {
  return {
    id: parseIntSafe(row.id ?? row.Id ?? row.rowid),
    inventoryNumber: parseString(row.inventoryNumber),
    name: parseString(row.name),
    commissioningDate: parseString(row.commissioningDate),
    lastMaintenanceDate: parseString(row.lastMaintenanceDate),
    nextMaintenanceDate: parseString(row.nextMaintenanceDate),
    maintenanceHours: parseIntSafe(row.maintenanceHours),
    maintenanceNotes: parseString(row.maintenanceNotes),
    maintenancePeriod: parseIntSafe(row.maintenancePeriod),
    status: parseString(row.status, "Активный"),
  };
}

export async function getAllEquipment(): Promise<Equipment[]> {
  const rows = db
    .query(
      `SELECT
        rowid AS id,
        InventoryNumber AS inventoryNumber,
        Name AS name,
        CommissioningDate AS commissioningDate,
        LastMaintenanceDate AS lastMaintenanceDate,
        NextMaintenanceDate AS nextMaintenanceDate,
        MaintenanceHours AS maintenanceHours,
        MaintenanceNotes AS maintenanceNotes,
        MaintenancePeriod AS maintenancePeriod,
        Status AS status
      FROM Equipment`
    )
    .all();

  return rows.map(normalizeEquipment);
}

export async function getEquipmentById(id: number): Promise<Equipment | null> {
  const row = db
    .query(
      `SELECT
        rowid AS id,
        InventoryNumber AS inventoryNumber,
        Name AS name,
        CommissioningDate AS commissioningDate,
        LastMaintenanceDate AS lastMaintenanceDate,
        NextMaintenanceDate AS nextMaintenanceDate,
        MaintenanceHours AS maintenanceHours,
        MaintenanceNotes AS maintenanceNotes,
        MaintenancePeriod AS maintenancePeriod,
        Status AS status
      FROM Equipment
      WHERE Id = ? OR rowid = ?`
    )
    .all(id, id);

  if (row.length === 0) {
    return null;
  }

  return normalizeEquipment(row[0]);
}

export async function createEquipment(payload: CreateEquipmentDto): Promise<Equipment> {
  const result = db
    .query(
      `INSERT INTO Equipment (
         InventoryNumber,
         Name,
         CommissioningDate,
         LastMaintenanceDate,
         NextMaintenanceDate,
         MaintenanceHours,
         MaintenanceNotes,
         MaintenancePeriod,
         Status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      payload.inventoryNumber,
      payload.name,
      payload.commissioningDate,
      payload.lastMaintenanceDate || "",
      payload.nextMaintenanceDate || "",
      payload.maintenanceHours ?? 0,
      payload.maintenanceNotes || "",
      payload.maintenancePeriod ?? 0,
      payload.status || "Активный"
    );

  const id = Number(result.lastInsertRowid ?? 0);
  logService.recordServiceOperation(
    "create",
    "Equipment",
    id,
    `Created equipment ${payload.name}`
  );
  return getEquipmentById(id) as Promise<Equipment>;
}

export async function updateEquipment(
  id: number,
  updates: UpdateEquipmentDto
): Promise<Equipment | null> {
  const existing = await getEquipmentById(id);
  if (!existing) {
    return null;
  }

  const merged = {
    ...existing,
    ...updates,
  };

  db
    .query(
      `UPDATE Equipment SET
         InventoryNumber = ?,
         Name = ?,
         CommissioningDate = ?,
         LastMaintenanceDate = ?,
         NextMaintenanceDate = ?,
         MaintenanceHours = ?,
         MaintenanceNotes = ?,
         MaintenancePeriod = ?,
         Status = ?
       WHERE Id = ? OR rowid = ?`
    )
    .run(
      merged.inventoryNumber,
      merged.name,
      merged.commissioningDate,
      merged.lastMaintenanceDate,
      merged.nextMaintenanceDate,
      merged.maintenanceHours,
      merged.maintenanceNotes,
      merged.maintenancePeriod,
      merged.status,
      id,
      id
    );

  logService.recordServiceOperation(
    "update",
    "Equipment",
    id,
    `Updated equipment ${id}`
  );

  return getEquipmentById(id);
}

export async function deleteEquipment(id: number): Promise<boolean> {
  const result = db.query("DELETE FROM Equipment WHERE Id = ? OR rowid = ?").run(id, id);
  if (result.changes > 0) {
    logService.recordServiceOperation(
      "delete",
      "Equipment",
      id,
      `Deleted equipment ${id}`
    );
  }
  return result.changes > 0;
}
