import db from "../db/database.ts";
import type { User, StoredUser } from "../models/user.ts";

function parseString(value: unknown, fallback = "") {
  return value == null ? fallback : String(value);
}

function normalizeUser(row: any): User {
  return {
    id: Number(row.id ?? row.Id ?? row.rowid),
    name: parseString(row.name),
    surname: parseString(row.surname),
    patronymic: parseString(row.patronymic),
    email: parseString(row.email),
    position: parseString(row.position),
  };
}

export function normalizeStoredUser(row: any): StoredUser {
  return {
    id: Number(row.id ?? row.Id ?? row.rowid),
    name: parseString(row.name),
    surname: parseString(row.surname),
    patronymic: parseString(row.patronymic),
    email: parseString(row.email),
    position: parseString(row.position),
    password: parseString(row.password),
  };
}

export class UserRepository {
  getUserByEmail(email: string): StoredUser | null {
    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    const rows = db
      .query(
        `SELECT
           rowid AS id,
           Name AS name,
           Surname AS surname,
           Patronymic AS patronymic,
           Email AS email,
           Position AS position,
           Password AS password
         FROM User
         WHERE Email = ?`
      )
      .all(normalizedEmail);

    return rows.length > 0 ? normalizeStoredUser(rows[0]) : null;
  }

  getUserById(id: number): User | null {
    const rows = db
      .query(
        `SELECT
           rowid AS id,
           Name AS name,
           Surname AS surname,
           Patronymic AS patronymic,
           Email AS email,
           Position AS position
         FROM User
         WHERE rowid = ? OR Id = ?`
      )
      .all(id, id);

    return rows.length > 0 ? normalizeUser(rows[0]) : null;
  }

  getAllUsers(): User[] {
    const rows = db
      .query(
        `SELECT
           rowid AS id,
           Name AS name,
           Surname AS surname,
           Patronymic AS patronymic,
           Email AS email,
           Position AS position
         FROM User`
      )
      .all() as any[];

    return rows.map(normalizeUser);
  }

  insertUser(user: Omit<StoredUser, "id">): User {
    const result = db
      .query(
        `INSERT INTO User (Name, Surname, Patronymic, Email, Password, Position) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(user.name, user.surname, user.patronymic, user.email, user.password, user.position);

    const userId = result.lastInsertRowid as number;
    const stored = this.getUserById(userId);
    if (!stored) throw new Error("Failed to retrieve inserted user");
    return stored;
  }

  updateUser(id: number, updates: Partial<Omit<StoredUser, "id">>): void {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      setClauses.push("Name = ?");
      values.push(updates.name);
    }
    if (updates.surname !== undefined) {
      setClauses.push("Surname = ?");
      values.push(updates.surname);
    }
    if (updates.patronymic !== undefined) {
      setClauses.push("Patronymic = ?");
      values.push(updates.patronymic);
    }
    if (updates.email !== undefined) {
      setClauses.push("Email = ?");
      values.push(updates.email);
    }
    if (updates.password !== undefined) {
      setClauses.push("Password = ?");
      values.push(updates.password);
    }
    if (updates.position !== undefined) {
      setClauses.push("Position = ?");
      values.push(updates.position);
    }

    if (setClauses.length === 0) return;

    values.push(id);
    db.query(`UPDATE User SET ${setClauses.join(", ")} WHERE rowid = ? OR Id = ?`).run(...values, id);
  }

  deleteUser(id: number): void {
    db.query(`DELETE FROM User WHERE rowid = ? OR Id = ?`).run(id, id);
  }
}

export const userRepository = new UserRepository();
