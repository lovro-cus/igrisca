import { Pool } from "pg";
import logger from "./logger";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/bookings",
});

pool.on("connect", () => logger.info("Connected to PostgreSQL - bookings"));
pool.on("error", (err) => logger.error(`PostgreSQL error: ${err.message}`));

export async function initDb(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "fieldId" TEXT NOT NULL,
          "slotId" TEXT,
          date TEXT NOT NULL,
          "timeSlot" TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          "createdAt" TEXT NOT NULL
        )
      `);
      logger.info("Bookings table ready");
      return;
    } catch (err: any) {
      logger.error(`DB connection failed (attempt ${i + 1}/${retries}): ${err.message}`);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  throw new Error("Could not connect to database after multiple retries");
}

export default pool;