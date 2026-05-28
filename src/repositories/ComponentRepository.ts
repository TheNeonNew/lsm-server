import db from "../db/database.ts";
import type { ComponentModel } from "../models/component.ts";

function normalizeComponent(row: any): ComponentModel {
  return {
    id: Number(row.id ?? row.Id ?? row.rowid),
    name: String(row.name ?? row.Name ?? ""),
    equipmentId: Number(row.equipmentId ?? row.EquipmentId ?? 0),
    lifespanDays: Number(row.lifespanDays ?? row.LifeSpanInDays ?? 0),
    quantityOnStock: Number(row.quantityOnStock ?? row.QuantityOnStock ?? 0),
    purchaseDate: String(row.purchaseDate ?? row.PurchaseDate ?? ""),
    lastReplacementDate: String(row.lastReplacementDate ?? row.LastReplacementDate ?? ""),
  };
}

export class ComponentRepository {
  getAll(): ComponentModel[] {
    const rows = db
      .query(
        `SELECT rowid AS id, Name as name, EquipmentId as equipmentId, LifeSpanInDays as lifeSpanInDays,
                QuantityOnStock as quantityOnStock, PurchaseDate as purchaseDate, LastReplacementDate as lastReplacementDate
         FROM Component`
      )
      .all() as any[];
    return rows.map(normalizeComponent);
  }

  getById(id: number): ComponentModel | null {
    const rows = db
      .query(
        `SELECT rowid AS id, Name as name, EquipmentId as equipmentId, LifeSpanInDays as lifeSpanInDays,
                QuantityOnStock as quantityOnStock, PurchaseDate as purchaseDate, LastReplacementDate as lastReplacementDate
         FROM Component WHERE rowid = ? OR Id = ?`
      )
      .all(id, id) as any[];
    return rows.length > 0 ? normalizeComponent(rows[0]) : null;
  }

  getByEquipmentId(equipmentId: number): ComponentModel[] {
    const rows = db
      .query(
        `SELECT rowid AS id, Name as name, EquipmentId as equipmentId, LifeSpanInDays as lifeSpanInDays,
                QuantityOnStock as quantityOnStock, PurchaseDate as purchaseDate, LastReplacementDate as lastReplacementDate
         FROM Component WHERE EquipmentId = ?`
      )
      .all(equipmentId) as any[];
    return rows.map(normalizeComponent);
  }

  create(component: Omit<ComponentModel, "id">): ComponentModel {
    const result = db
      .query(
        `INSERT INTO Component (Name, EquipmentId, LifeSpanInDays, QuantityOnStock, PurchaseDate, LastReplacementDate)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        component.name,
        component.equipmentId,
        component.lifespanDays,
        component.quantityOnStock,
        component.purchaseDate,
        component.lastReplacementDate
      );

    const id = result.lastInsertRowid as number;
    const created = this.getById(id);
    if (!created) throw new Error("Failed to retrieve created component");
    return created;
  }

  update(id: number, component: Partial<Omit<ComponentModel, "id">>): void {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (component.name !== undefined) {
      setClauses.push("Name = ?");
      values.push(component.name);
    }
    if (component.equipmentId !== undefined) {
      setClauses.push("EquipmentId = ?");
      values.push(component.equipmentId);
    }
    if (component.lifespanDays !== undefined) {
      setClauses.push("LifeSpanInDays = ?");
      values.push(component.lifespanDays);
    }
    if (component.quantityOnStock !== undefined) {
      setClauses.push("QuantityOnStock = ?");
      values.push(component.quantityOnStock);
    }
    if (component.purchaseDate !== undefined) {
      setClauses.push("PurchaseDate = ?");
      values.push(component.purchaseDate);
    }
    if (component.lastReplacementDate !== undefined) {
      setClauses.push("LastReplacementDate = ?");
      values.push(component.lastReplacementDate);
    }

    if (setClauses.length === 0) return;

    values.push(id);
    db.query(`UPDATE Component SET ${setClauses.join(", ")} WHERE rowid = ? OR Id = ?`).run(...values, id);
  }

  delete(id: number): void {
    db.query(`DELETE FROM Component WHERE rowid = ? OR Id = ?`).run(id, id);
  }
}

export const componentRepository = new ComponentRepository();
