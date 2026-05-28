import db from "../db/database.ts";
import * as logService from "./logService.ts";
import type {
  ComponentModel,
  CreateComponentDto,
  UpdateComponentDto,
} from "../models/component.ts";

function parseIntSafe(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseString(value: unknown, fallback = "") {
  return value == null ? fallback : String(value);
}

function normalizeComponent(row: any): ComponentModel {
  return {
    id: parseIntSafe(row.id ?? row.Id ?? row.rowid),
    name: parseString(row.name),
    equipmentId: parseIntSafe(row.equipmentId),
    lifespanDays: parseIntSafe(row.lifespanDays),
    quantityOnStock: parseIntSafe(row.quantityOnStock),
    purchaseDate: parseString(row.purchaseDate),
    lastReplacementDate: parseString(row.lastReplacementDate),
  };
}

export async function getAllComponents(): Promise<ComponentModel[]> {
  const rows = db
    .query(
      `SELECT
         rowid AS id,
         Name AS name,
         EquipmentId AS equipmentId,
         LifeSpanInDays AS lifespanDays,
         QuantityOnStock AS quantityOnStock,
         PurchaseDate AS purchaseDate,
         LastReplacementDate AS lastReplacementDate
       FROM Component`
    )
    .all();

  return rows.map(normalizeComponent);
}

export async function getComponentById(id: number): Promise<ComponentModel | null> {
  const rows = db
    .query(
      `SELECT
         rowid AS id,
         Name AS name,
         EquipmentId AS equipmentId,
         LifeSpanInDays AS lifespanDays,
         QuantityOnStock AS quantityOnStock,
         PurchaseDate AS purchaseDate,
         LastReplacementDate AS lastReplacementDate
       FROM Component
       WHERE Id = ? OR rowid = ?`
    )
    .all(id, id);

  if (rows.length === 0) {
    return null;
  }

  return normalizeComponent(rows[0]);
}

export async function getComponentsByEquipmentId(
  equipmentId: number
): Promise<ComponentModel[]> {
  const rows = db
    .query(
      `SELECT
         rowid AS id,
         Name AS name,
         EquipmentId AS equipmentId,
         LifeSpanInDays AS lifespanDays,
         QuantityOnStock AS quantityOnStock,
         PurchaseDate AS purchaseDate,
         LastReplacementDate AS lastReplacementDate
       FROM Component
       WHERE EquipmentId = ?`
    )
    .all(equipmentId);

  return rows.map(normalizeComponent);
}

export async function createComponent(
  payload: CreateComponentDto
): Promise<ComponentModel> {
  const result = db
    .query(
      `INSERT INTO Component (
         Name,
         EquipmentId,
         LifeSpanInDays,
         QuantityOnStock,
         PurchaseDate,
         LastReplacementDate
       ) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      payload.name,
      payload.equipmentId,
      payload.lifespanDays,
      payload.quantityOnStock,
      payload.purchaseDate,
      payload.lastReplacementDate
    );

  const id = Number(result.lastInsertRowid ?? 0);
  logService.recordServiceOperation(
    "create",
    "Component",
    id,
    `Created component ${payload.name}`
  );
  return getComponentById(id) as Promise<ComponentModel>;
}

export async function updateComponent(
  id: number,
  updates: UpdateComponentDto
): Promise<ComponentModel | null> {
  const existing = await getComponentById(id);
  if (!existing) {
    return null;
  }

  const merged = {
    ...existing,
    ...updates,
  };

  db
    .query(
      `UPDATE Component SET
         Name = ?,
         EquipmentId = ?,
         LifeSpanInDays = ?,
         QuantityOnStock = ?,
         PurchaseDate = ?,
         LastReplacementDate = ?
       WHERE Id = ? OR rowid = ?`
    )
    .run(
      merged.name,
      merged.equipmentId,
      merged.lifespanDays,
      merged.quantityOnStock,
      merged.purchaseDate,
      merged.lastReplacementDate,
      id,
      id
    );

  logService.recordServiceOperation(
    "update",
    "Component",
    id,
    `Updated component ${id}`
  );

  return getComponentById(id);
}

export async function deleteComponent(id: number): Promise<boolean> {
  const result = db.query("DELETE FROM Component WHERE Id = ? OR rowid = ?").run(id, id);
  if (result.changes > 0) {
    logService.recordServiceOperation(
      "delete",
      "Component",
      id,
      `Deleted component ${id}`
    );
  }
  return result.changes > 0;
}
