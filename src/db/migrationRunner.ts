import db from "./database.ts";
import { allMigrations } from "./migrations/index.ts";
import type { Migration, MigrationRecord } from "./migrations/types.ts";

export class MigrationRunner {
  private static instance: MigrationRunner;

  private constructor() {}

  static getInstance(): MigrationRunner {
    if (!MigrationRunner.instance) {
      MigrationRunner.instance = new MigrationRunner();
    }
    return MigrationRunner.instance;
  }

  private ensureMigrationTableExists(): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS MigrationHistory (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL UNIQUE,
        Version INTEGER NOT NULL,
        AppliedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private getAppliedMigrations(): MigrationRecord[] {
    this.ensureMigrationTableExists();
    const rows = db
      .query(
        `SELECT Id as id, Name as name, Version as version, AppliedAt as appliedAt FROM MigrationHistory ORDER BY Version ASC`
      )
      .all() as any[];
    return rows;
  }

  private recordMigration(migration: Migration): void {
    db.query(
      `INSERT INTO MigrationHistory (Name, Version) VALUES (?, ?)`
    ).run(migration.name, migration.version);
  }

  private unrecordMigration(migration: Migration): void {
    db.query(`DELETE FROM MigrationHistory WHERE Name = ?`).run(migration.name);
  }

  runPendingMigrations(): void {
    this.ensureMigrationTableExists();
    const applied = this.getAppliedMigrations();
    const appliedNames = new Set(applied.map((m) => m.name));

    console.log("[Migrations] Running pending migrations...");
    for (const migration of allMigrations) {
      if (!appliedNames.has(migration.name)) {
        try {
          console.log(`[Migrations] Applying: ${migration.name}`);
          migration.up();
          this.recordMigration(migration);
          console.log(`[Migrations] Applied: ${migration.name}`);
        } catch (error) {
          console.error(`[Migrations] Failed to apply ${migration.name}:`, error);
          throw error;
        }
      }
    }

    const currentCount = applied.length;
    const pendingCount = allMigrations.length - currentCount;
    if (pendingCount === 0) {
      console.log("[Migrations] All migrations are up to date");
    } else {
      console.log(`[Migrations] Applied ${pendingCount} new migration(s)`);
    }
  }

  rollbackLastMigration(): void {
    const applied = this.getAppliedMigrations();
    if (applied.length === 0) {
      console.log("[Migrations] No migrations to rollback");
      return;
    }

    const lastApplied = applied[applied.length - 1];
    const migration = allMigrations.find((m) => m.name === lastApplied.name);
    if (!migration) {
      console.error(`[Migrations] Migration not found: ${lastApplied.name}`);
      return;
    }

    try {
      console.log(`[Migrations] Rolling back: ${migration.name}`);
      migration.down();
      this.unrecordMigration(migration);
      console.log(`[Migrations] Rolled back: ${migration.name}`);
    } catch (error) {
      console.error(`[Migrations] Failed to rollback ${migration.name}:`, error);
      throw error;
    }
  }

  getStatus(): { applied: MigrationRecord[]; pending: Migration[] } {
    const applied = this.getAppliedMigrations();
    const appliedNames = new Set(applied.map((m) => m.name));
    const pending = allMigrations.filter((m) => !appliedNames.has(m.name));

    return { applied, pending };
  }
}

export const migrationRunner = MigrationRunner.getInstance();
