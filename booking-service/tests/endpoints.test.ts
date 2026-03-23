const mockQuery = jest.fn();

jest.mock("../src/database", () => ({
  default: { query: mockQuery },
  initDb: jest.fn(),
}));

jest.mock("../src/grpc/availabilityClient", () => ({
  markSlotBooked: jest.fn().mockResolvedValue(undefined),
  markSlotAvailable: jest.fn().mockResolvedValue(undefined),
}));

import request from "supertest";
import { app } from "../src/app";

describe("Booking Endpoints", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [] });
  });

  test("GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("POST /bookings - success", async () => {
    mockQuery.mockResolvedValue({ rows: [] });
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
    mockQuery.mockResolvedValue({ rows: [] });
    const res = await request(app).get("/bookings");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /bookings/:id - not found", async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const res = await request(app).get("/bookings/nonexistent");
    expect(res.status).toBe(404);
  });

  test("GET /bookings/user/:userId", async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const res = await request(app).get("/bookings/user/u1");
    expect(res.status).toBe(200);
  });

  test("PATCH /bookings/nonexistent/cancel", async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const res = await request(app).patch("/bookings/bad-id/cancel");
    expect(res.status).toBe(404);
  });
});