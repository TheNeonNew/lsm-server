import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { migrationRunner } from "../../src/db/migrationRunner.ts";
import { equipmentRepository } from "../../src/repositories/EquipmentRepository.ts";
import type { Equipment } from "../../src/models/equipment.ts";

describe("EquipmentRepository", () => {
  beforeAll(() => {
    migrationRunner.runPendingMigrations();
  });

  afterAll(() => {
    const equipment = equipmentRepository.getAll();
    equipment.forEach((eq) => {
      equipmentRepository.delete(eq.id);
    });
  });

  it("should create equipment", () => {
    const eq: Omit<Equipment, "id"> = {
      inventoryNumber: "EQ-001",
      name: "Laboratory Scale",
      commissioningDate: "2025-01-15",
      lastMaintenanceDate: "2025-01-20",
      nextMaintenanceDate: "2025-02-20",
      maintenanceHours: 2,
      maintenanceNotes: "Regular calibration",
      maintenancePeriod: 30,
      status: "Активный",
    };

    const created = equipmentRepository.create(eq);

    expect(created.id).toBeDefined();
    expect(created.name).toBe("Laboratory Scale");
    expect(created.inventoryNumber).toBe("EQ-001");
  });

  it("should retrieve equipment by ID", () => {
    const eq: Omit<Equipment, "id"> = {
      inventoryNumber: "EQ-002",
      name: "Centrifuge",
      commissioningDate: "2025-01-10",
      lastMaintenanceDate: "2025-01-15",
      nextMaintenanceDate: "2025-02-15",
      maintenanceHours: 1,
      maintenanceNotes: "Oil change",
      maintenancePeriod: 30,
      status: "Активный",
    };

    const created = equipmentRepository.create(eq);
    const retrieved = equipmentRepository.getById(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe("Centrifuge");
  });

  it("should get all equipment", () => {
    const eq1: Omit<Equipment, "id"> = {
      inventoryNumber: "EQ-003",
      name: "Microscope",
      commissioningDate: "2025-01-05",
      lastMaintenanceDate: "2025-01-10",
      nextMaintenanceDate: "2025-02-10",
      maintenanceHours: 0,
      maintenanceNotes: "Lens cleaning",
      maintenancePeriod: 30,
      status: "Активный",
    };

    const eq2: Omit<Equipment, "id"> = {
      inventoryNumber: "EQ-004",
      name: "Incubator",
      commissioningDate: "2025-01-01",
      lastMaintenanceDate: "2025-01-05",
      nextMaintenanceDate: "2025-02-05",
      maintenanceHours: 1,
      maintenanceNotes: "Temperature calibration",
      maintenancePeriod: 30,
      status: "Неактивный",
    };

    equipmentRepository.create(eq1);
    equipmentRepository.create(eq2);

    const all = equipmentRepository.getAll();
    expect(all.length).toBeGreaterThanOrEqual(2);
  });

  it("should update equipment", () => {
    const eq: Omit<Equipment, "id"> = {
      inventoryNumber: "EQ-005",
      name: "pH Meter",
      commissioningDate: "2025-01-20",
      lastMaintenanceDate: "2025-01-25",
      nextMaintenanceDate: "2025-02-25",
      maintenanceHours: 0,
      maintenanceNotes: "Calibration",
      maintenancePeriod: 30,
      status: "Активный",
    };

    const created = equipmentRepository.create(eq);
    equipmentRepository.update(created.id, { status: "Неактивный" });

    const updated = equipmentRepository.getById(created.id);
    expect(updated?.status).toBe("Неактивный");
  });
});
