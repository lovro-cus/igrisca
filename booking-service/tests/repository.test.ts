const mockQuery = jest.fn();

jest.mock("../src/database", () => ({
  default: { query: mockQuery },
  initDb: jest.fn(),
}));

import { BookingRepository } from "../src/repository/BookingRepository";

describe("BookingRepository", () => {
  let repo: BookingRepository;

  beforeEach(() => {
    repo = new BookingRepository();
    mockQuery.mockReset();
  });

  test("should create a booking", async () => {
    // Prvo klicanje = preverjanje duplikata (vrne prazno), drugo = INSERT
    mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });
    const b = await repo.create("user1", "field1", "2026-03-20", "10:00-11:00");
    expect(b).not.toBeNull();
    expect(b!.id).toBeDefined();
    expect(b!.status).toBe("active");
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("INSERT"), expect.any(Array));
  });

  test("should return null for duplicate booking", async () => {
    const existing = { id: "existing-id" };
    mockQuery.mockResolvedValueOnce({ rows: [existing] });
    const b = await repo.create("user1", "field1", "2026-03-20", "10:00-11:00");
    expect(b).toBeNull();
    expect(mockQuery).not.toHaveBeenCalledWith(expect.stringContaining("INSERT"), expect.any(Array));
  });

  test("should get booking by id - found", async () => {
    const fakeBooking = { id: "abc", userId: "u1", fieldId: "f1", date: "2026-03-20", timeSlot: "10:00-11:00", status: "active", createdAt: "" };
    mockQuery.mockResolvedValue({ rows: [fakeBooking] });
    const result = await repo.getById("abc");
    expect(result).toBeDefined();
    expect(result?.userId).toBe("u1");
  });

  test("should return undefined for nonexistent id", async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const result = await repo.getById("nonexistent");
    expect(result).toBeUndefined();
  });

  test("should get all bookings", async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const result = await repo.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  test("should get bookings by user", async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const result = await repo.getByUser("user1");
    expect(Array.isArray(result)).toBe(true);
  });

  test("should cancel a booking", async () => {
    const fakeBooking = { id: "abc", userId: "u1", fieldId: "f1", date: "2026-03-20", timeSlot: "10:00-11:00", status: "active", createdAt: "" };
    mockQuery
      .mockResolvedValueOnce({ rows: [fakeBooking] })  // getById
      .mockResolvedValueOnce({ rows: [] });              // UPDATE
    const result = await repo.cancel("abc");
    expect(result?.status).toBe("cancelled");
  });

  test("should return undefined when cancelling nonexistent", async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const result = await repo.cancel("bad-id");
    expect(result).toBeUndefined();
  });
});