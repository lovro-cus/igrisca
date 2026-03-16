import Database from "better-sqlite3";
import { BookingRepository } from "../src/repository/BookingRepository";

// override DB z in-memory bazo za teste
jest.mock("../src/database", () => {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY, userId TEXT, fieldId TEXT,
      date TEXT, timeSlot TEXT, status TEXT, createdAt TEXT
    )
  `);
  return { default: db };
});

describe("BookingRepository", () => {
  let repo: BookingRepository;

  beforeEach(() => {
    repo = new BookingRepository();
  });

  test("should create a booking", () => {
    const b = repo.create("user1", "field1", "2026-03-20", "10:00-11:00");
    expect(b.id).toBeDefined();
    expect(b.status).toBe("active");
  });

  test("should get booking by id", () => {
    const b = repo.create("user1", "field1", "2026-03-20", "10:00-11:00");
    expect(repo.getById(b.id)).toBeDefined();
  });

  test("should return undefined for nonexistent id", () => {
    expect(repo.getById("nonexistent-id")).toBeUndefined();
  });

  test("should get bookings by user", () => {
    repo.create("userX", "field1", "2026-03-20", "09:00-10:00");
    repo.create("userX", "field2", "2026-03-21", "10:00-11:00");
    expect(repo.getByUser("userX").length).toBeGreaterThanOrEqual(2);
  });

  test("should cancel a booking", () => {
    const b = repo.create("user1", "field1", "2026-03-22", "11:00-12:00");
    const cancelled = repo.cancel(b.id);
    expect(cancelled?.status).toBe("cancelled");
  });

  test("should return undefined when cancelling nonexistent booking", () => {
    expect(repo.cancel("bad-id")).toBeUndefined();
  });
});
