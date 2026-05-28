import db from "../database.ts";
import type { Migration } from "./types.ts";

export const migration001_CreateEquipmentTable: Migration = {
  name: "001_create_equipment_table",
  version: 1,
  up: () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS Equipment (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        InventoryNumber TEXT NOT NULL,
        Name TEXT NOT NULL,
        CommissioningDate TEXT NOT NULL,
        LastMaintenanceDate TEXT NOT NULL,
        NextMaintenanceDate TEXT NOT NULL,
        MaintenanceHours INTEGER NOT NULL DEFAULT 0,
        MaintenanceNotes TEXT NOT NULL DEFAULT '',
        MaintenancePeriod INTEGER NOT NULL DEFAULT 0,
        Status TEXT NOT NULL DEFAULT 'Активный'
      );
    `);
  },
  down: () => {
    db.exec(`DROP TABLE IF EXISTS Equipment;`);
  },
};

export const migration002_CreateComponentTable: Migration = {
  name: "002_create_component_table",
  version: 2,
  up: () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS Component (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        EquipmentId INTEGER NOT NULL,
        LifeSpanInDays INTEGER NOT NULL DEFAULT 0,
        QuantityOnStock INTEGER NOT NULL DEFAULT 0,
        PurchaseDate TEXT NOT NULL,
        LastReplacementDate TEXT NOT NULL
      );
    `);
  },
  down: () => {
    db.exec(`DROP TABLE IF EXISTS Component;`);
  },
};

export const migration003_CreateMaintenanceTable: Migration = {
  name: "003_create_maintenance_table",
  version: 3,
  up: () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS Maintenance (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        EquipmentId INTEGER NOT NULL,
        MaintenanceDate TEXT NOT NULL,
        MaintenanceType TEXT NOT NULL,
        PerfomedWork TEXT NOT NULL,
        PerfomedBy TEXT NOT NULL,
        CheckedBy TEXT NOT NULL,
        SpentHoursTotal INTEGER NOT NULL DEFAULT 0,
        Notes TEXT
      );
    `);
  },
  down: () => {
    db.exec(`DROP TABLE IF EXISTS Maintenance;`);
  },
};

export const migration004_CreateUserTable: Migration = {
  name: "004_create_user_table",
  version: 4,
  up: () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS User (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        Surname TEXT NOT NULL,
        Patronymic TEXT NOT NULL,
        Email TEXT NOT NULL UNIQUE,
        Password TEXT NOT NULL DEFAULT '',
        Position TEXT NOT NULL
      );
    `);
  },
  down: () => {
    db.exec(`DROP TABLE IF EXISTS User;`);
  },
};

export const migration005_CreateServiceLogTable: Migration = {
  name: "005_create_service_log_table",
  version: 5,
  up: () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS ServiceLog (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        CreatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        Action TEXT NOT NULL,
        Entity TEXT NOT NULL,
        EntityId INTEGER,
        Details TEXT
      );
    `);
  },
  down: () => {
    db.exec(`DROP TABLE IF EXISTS ServiceLog;`);
  },
};

export const migration006_CreateMigrationHistoryTable: Migration = {
  name: "006_create_migration_history_table",
  version: 6,
  up: () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS MigrationHistory (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL UNIQUE,
        Version INTEGER NOT NULL,
        AppliedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
  down: () => {
    db.exec(`DROP TABLE IF EXISTS MigrationHistory;`);
  },
};

export const migration007_CreateTriggers: Migration = {
  name: "007_create_triggers",
  version: 7,
  up: () => {
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS Equipment_RowIdToId
      AFTER INSERT ON Equipment
      BEGIN
        UPDATE Equipment SET Id = new.rowid WHERE rowid = new.rowid AND Id IS NULL;
      END;

      CREATE TRIGGER IF NOT EXISTS Component_RowIdToId
      AFTER INSERT ON Component
      BEGIN
        UPDATE Component SET Id = new.rowid WHERE rowid = new.rowid AND Id IS NULL;
      END;

      CREATE TRIGGER IF NOT EXISTS Maintenance_RowIdToId
      AFTER INSERT ON Maintenance
      BEGIN
        UPDATE Maintenance SET Id = new.rowid WHERE rowid = new.rowid AND Id IS NULL;
      END;

      CREATE TRIGGER IF NOT EXISTS User_RowIdToId
      AFTER INSERT ON User
      BEGIN
        UPDATE User SET Id = new.rowid WHERE rowid = new.rowid AND Id IS NULL;
      END;

      CREATE TRIGGER IF NOT EXISTS ServiceLog_RowIdToId
      AFTER INSERT ON ServiceLog
      BEGIN
        UPDATE ServiceLog SET Id = new.rowid WHERE rowid = new.rowid AND Id IS NULL;
      END;
    `);
  },
  down: () => {
    db.exec(`
      DROP TRIGGER IF EXISTS Equipment_RowIdToId;
      DROP TRIGGER IF EXISTS Component_RowIdToId;
      DROP TRIGGER IF EXISTS Maintenance_RowIdToId;
      DROP TRIGGER IF EXISTS User_RowIdToId;
      DROP TRIGGER IF EXISTS ServiceLog_RowIdToId;
    `);
  },
};

export const allMigrations = [
  migration001_CreateEquipmentTable,
  migration002_CreateComponentTable,
  migration003_CreateMaintenanceTable,
  migration004_CreateUserTable,
  migration005_CreateServiceLogTable,
  migration006_CreateMigrationHistoryTable,
  migration007_CreateTriggers,
];
