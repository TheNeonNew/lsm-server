import { Database } from "bun:sqlite";

const DATABASE_PATH = process.env.DATABASE_URL?.replace("file:", "") ?? "src/db/DB";

let dbInstance: Database;

function initializeDatabase() {
  try {
    dbInstance = new Database(DATABASE_PATH);
    console.log("[DB] Connected to database:", DATABASE_PATH);
  } catch (error) {
    console.error("[DB] Connection error:", error);
    throw error;
  }
}

// Initialize on module load
initializeDatabase();

export default dbInstance;
