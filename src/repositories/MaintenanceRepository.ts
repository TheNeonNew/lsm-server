import db from "../db/database.ts";
import type { Maintenance } from "../models/maintenance.ts";

function normalizeMaintenance(row: any): Maintenance {
  return {
    id: Number(row.id ?? row.Id ?? row.rowid),
    equipmentId: Number(row.equipmentId ?? row.EquipmentId ?? 0),
    date: String(row.date ?? row.MaintenanceDate ?? ""),
    type: String(row.type ?? row.MaintenanceType ?? ""),
    workPerformed: String(row.workPerformed ?? row.PerfomedWork ?? ""),
    performedBy: String(row.performedBy ?? row.PerfomedBy ?? ""),
    checkedBy: String(row.checkedBy ?? row.CheckedBy ?? ""),
    hoursSpent: Number(row.hoursSpent ?? row.SpentHoursTotal ?? 0),
    notes: row.notes == null ? null : String(row.notes ?? row.Notes ?? ""),
  };
}

export class MaintenanceRepository {
  getAll(): Maintenance[] {
    const rows = db
      .query(
        `SELECT rowid AS id, EquipmentId as equipmentId, MaintenanceDate as date,
                MaintenanceType as type, PerfomedWork as workPerformed, PerfomedBy as performedBy,
                CheckedBy as checkedBy, SpentHoursTotal as hoursSpent, Notes as notes FROM Maintenance`
      )
      .all() as any[];
    return rows.map(normalizeMaintenance);
  }

  getById(id: number): Maintenance | null {
    const rows = db
      .query(
        `SELECT rowid AS id, EquipmentId as equipmentId, MaintenanceDate as date,
                MaintenanceType as type, PerfomedWork as workPerformed, PerfomedBy as performedBy,
                CheckedBy as checkedBy, SpentHoursTotal as hoursSpent, Notes as notes FROM Maintenance
         WHERE rowid = ? OR Id = ?`
      )
      .all(id, id) as any[];
    return rows.length > 0 ? normalizeMaintenance(rows[0]) : null;
  }

  getByEquipmentId(equipmentId: number): Maintenance[] {
    const rows = db
      .query(
        `SELECT rowid AS id, EquipmentId as equipmentId, MaintenanceDate as date,
                MaintenanceType as type, PerfomedWork as workPerformed, PerfomedBy as performedBy,
                CheckedBy as checkedBy, SpentHoursTotal as hoursSpent, Notes as notes FROM Maintenance
         WHERE EquipmentId = ?`
      )
      .all(equipmentId) as any[];
    return rows.map(normalizeMaintenance);
  }

  create(maintenance: Omit<Maintenance, "id">): Maintenance {
    const result = db
      .query(
        `INSERT INTO Maintenance (EquipmentId, MaintenanceDate, MaintenanceType, PerfomedWork, PerfomedBy, CheckedBy, SpentHoursTotal, Notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        maintenance.equipmentId,
        maintenance.date,
        maintenance.type,
        maintenance.workPerformed,
        maintenance.performedBy,
        maintenance.checkedBy,
        maintenance.hoursSpent,
        maintenance.notes
      );

    const id = result.lastInsertRowid as number;
    const created = this.getById(id);
    if (!created) throw new Error("Failed to retrieve created maintenance");
    return created;
  }

  update(id: number, maintenance: Partial<Omit<Maintenance, "id">>): void {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (maintenance.equipmentId !== undefined) {
      setClauses.push("EquipmentId = ?");
      values.push(maintenance.equipmentId);
    }
    if (maintenance.date !== undefined) {
      setClauses.push("MaintenanceDate = ?");
      values.push(maintenance.date);
    }
    if (maintenance.type !== undefined) {
      setClauses.push("MaintenanceType = ?");
      values.push(maintenance.type);
    }
    if (maintenance.workPerformed !== undefined) {
      setClauses.push("PerfomedWork = ?");
      values.push(maintenance.workPerformed);
    }
    if (maintenance.performedBy !== undefined) {
      setClauses.push("PerfomedBy = ?");
      values.push(maintenance.performedBy);
    }
    if (maintenance.checkedBy !== undefined) {
      setClauses.push("CheckedBy = ?");
      values.push(maintenance.checkedBy);
    }
    if (maintenance.hoursSpent !== undefined) {
      setClauses.push("SpentHoursTotal = ?");
      values.push(maintenance.hoursSpent);
    }
    if (maintenance.notes !== undefined) {
      setClauses.push("Notes = ?");
      values.push(maintenance.notes);
    }

    if (setClauses.length === 0) return;

    values.push(id);
    db.query(`UPDATE Maintenance SET ${setClauses.join(", ")} WHERE rowid = ? OR Id = ?`).run(...values, id);
  }

  delete(id: number): void {
    db.query(`DELETE FROM Maintenance WHERE rowid = ? OR Id = ?`).run(id, id);
  }
}

export const maintenanceRepository = new MaintenanceRepository();
