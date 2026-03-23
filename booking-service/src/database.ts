import { Pool } from "pg";
import logger from "./logger";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/bookings",
});

pool.on("connect", () => logger.info("Connected to PostgreSQL - bookings"));
pool.on("error", (err) => logger.error(`PostgreSQL error: ${err.message}`));

export async function initDb() {
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
}

export default pool;