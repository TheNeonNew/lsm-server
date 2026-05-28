import db from "../db/database.ts";
import type { Equipment } from "../models/equipment.ts";

function normalizeEquipment(row: any): Equipment {
  return {
    id: Number(row.id ?? row.Id ?? row.rowid),
    inventoryNumber: String(row.inventoryNumber ?? row.InventoryNumber ?? ""),
    name: String(row.name ?? row.Name ?? ""),
    commissioningDate: String(row.commissioningDate ?? row.CommissioningDate ?? ""),
    lastMaintenanceDate: String(row.lastMaintenanceDate ?? row.LastMaintenanceDate ?? ""),
    nextMaintenanceDate: String(row.nextMaintenanceDate ?? row.NextMaintenanceDate ?? ""),
    maintenanceHours: Number(row.maintenanceHours ?? row.MaintenanceHours ?? 0),
    maintenanceNotes: String(row.maintenanceNotes ?? row.MaintenanceNotes ?? ""),
    maintenancePeriod: Number(row.maintenancePeriod ?? row.MaintenancePeriod ?? 0),
    status: String(row.status ?? row.Status ?? "Активный"),
  };
}

export class EquipmentRepository {
  getAll(): Equipment[] {
    const rows = db
      .query(
        `SELECT rowid AS id, InventoryNumber as inventoryNumber, Name as name, CommissioningDate as commissioningDate,
                LastMaintenanceDate as lastMaintenanceDate, NextMaintenanceDate as nextMaintenanceDate,
                MaintenanceHours as maintenanceHours, MaintenanceNotes as maintenanceNotes,
                MaintenancePeriod as maintenancePeriod, Status as status FROM Equipment`
      )
      .all() as any[];
    return rows.map(normalizeEquipment);
  }

  getById(id: number): Equipment | null {
    const rows = db
      .query(
        `SELECT rowid AS id, InventoryNumber as inventoryNumber, Name as name, CommissioningDate as commissioningDate,
                LastMaintenanceDate as lastMaintenanceDate, NextMaintenanceDate as nextMaintenanceDate,
                MaintenanceHours as maintenanceHours, MaintenanceNotes as maintenanceNotes,
                MaintenancePeriod as maintenancePeriod, Status as status FROM Equipment WHERE rowid = ? OR Id = ?`
      )
      .all(id, id) as any[];
    return rows.length > 0 ? normalizeEquipment(rows[0]) : null;
  }

  create(equipment: Omit<Equipment, "id">): Equipment {
    const result = db
      .query(
        `INSERT INTO Equipment (InventoryNumber, Name, CommissioningDate, LastMaintenanceDate, NextMaintenanceDate,
                MaintenanceHours, MaintenanceNotes, MaintenancePeriod, Status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        equipment.inventoryNumber,
        equipment.name,
        equipment.commissioningDate,
        equipment.lastMaintenanceDate || "",
        equipment.nextMaintenanceDate || "",
        equipment.maintenanceHours ?? 0,
        equipment.maintenanceNotes || "",
        equipment.maintenancePeriod ?? 0,
        equipment.status || "Активный"
      );

    const id = result.lastInsertRowid as number;
    const created = this.getById(id);
    if (!created) throw new Error("Failed to retrieve created equipment");
    return created;
  }

  update(id: number, equipment: Partial<Omit<Equipment, "id">>): void {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (equipment.inventoryNumber !== undefined) {
      setClauses.push("InventoryNumber = ?");
      values.push(equipment.inventoryNumber);
    }
    if (equipment.name !== undefined) {
      setClauses.push("Name = ?");
      values.push(equipment.name);
    }
    if (equipment.commissioningDate !== undefined) {
      setClauses.push("CommissioningDate = ?");
      values.push(equipment.commissioningDate);
    }
    if (equipment.lastMaintenanceDate !== undefined) {
      setClauses.push("LastMaintenanceDate = ?");
      values.push(equipment.lastMaintenanceDate);
    }
    if (equipment.nextMaintenanceDate !== undefined) {
      setClauses.push("NextMaintenanceDate = ?");
      values.push(equipment.nextMaintenanceDate);
    }
    if (equipment.maintenanceHours !== undefined) {
      setClauses.push("MaintenanceHours = ?");
      values.push(equipment.maintenanceHours);
    }
    if (equipment.maintenanceNotes !== undefined) {
      setClauses.push("MaintenanceNotes = ?");
      values.push(equipment.maintenanceNotes);
    }
    if (equipment.maintenancePeriod !== undefined) {
      setClauses.push("MaintenancePeriod = ?");
      values.push(equipment.maintenancePeriod);
    }
    if (equipment.status !== undefined) {
      setClauses.push("Status = ?");
      values.push(equipment.status);
    }

    if (setClauses.length === 0) return;

    values.push(id);
    db.query(`UPDATE Equipment SET ${setClauses.join(", ")} WHERE rowid = ? OR Id = ?`).run(...values, id);
  }

  delete(id: number): void {
    db.query(`DELETE FROM Equipment WHERE rowid = ? OR Id = ?`).run(id, id);
  }
}

export const equipmentRepository = new EquipmentRepository();
