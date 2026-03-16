import request from "supertest";
import { app } from "../src/app";
import Database from "better-sqlite3";

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

describe("Booking Endpoints", () => {
  test("GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("POST /bookings - success", async () => {
    const res = await request(app).post("/bookings").send({
      userId: "u1", fieldId: "f1", date: "2026-03-20", timeSlot: "10:00-11:00",
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  test("POST /bookings - missing fields", async () => {
    const res = await request(app).post("/bookings").send({ userId: "u1" });
    expect(res.status).toBe(400);
  });

  test("GET /bookings", async () => {
    const res = await request(app).get("/bookings");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /bookings/:id - found", async () => {
    const created = await request(app).post("/bookings").send({
      userId: "u2", fieldId: "f2", date: "2026-03-21", timeSlot: "09:00-10:00",
    });
    const res = await request(app).get(`/bookings/${created.body.id}`);
    expect(res.status).toBe(200);
  });

  test("GET /bookings/:id - not found", async () => {
    const res = await request(app).get("/bookings/nonexistent");
    expect(res.status).toBe(404);
  });

  test("GET /bookings/user/:userId", async () => {
    await request(app).post("/bookings").send({
      userId: "u3", fieldId: "f3", date: "2026-03-22", timeSlot: "14:00-15:00",
    });
    const res = await request(app).get("/bookings/user/u3");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test("PATCH /bookings/:id/cancel", async () => {
    const created = await request(app).post("/bookings").send({
      userId: "u4", fieldId: "f4", date: "2026-03-23", timeSlot: "15:00-16:00",
    });
    const res = await request(app).patch(`/bookings/${created.body.id}/cancel`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");
  });

  test("PATCH /bookings/nonexistent/cancel", async () => {
    const res = await request(app).patch("/bookings/bad-id/cancel");
    expect(res.status).toBe(404);
  });
});
