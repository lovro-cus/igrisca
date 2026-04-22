import request from "supertest";
import { app } from "../src/index";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => jest.clearAllMocks());

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.gateway).toBe("web-bff");
  });
});

describe("POST /api/auth/login", () => {
  it("forwards request to user-service and returns user", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 1, email: "test@test.com" } });
    const res = await request(app).post("/api/auth/login").send({ email: "test@test.com", password: "pass" });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("test@test.com");
  });

  it("returns 401 on upstream error", async () => {
    mockedAxios.post.mockRejectedValue({ response: { status: 401, data: { error: "Napačno geslo" } } });
    const res = await request(app).post("/api/auth/login").send({ email: "x@x.com", password: "wrong" });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/register", () => {
  it("forwards request and returns 201", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 2, username: "novi", email: "novi@test.com" } });
    const res = await request(app).post("/api/auth/register").send({ username: "novi", email: "novi@test.com", password: "pass" });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe("novi");
  });
});

describe("GET /api/bookings", () => {
  it("returns list of bookings", async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ id: "b1", userId: "u1" }] });
    const res = await request(app).get("/api/bookings");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /api/bookings/available", () => {
  it("forwards query params and returns slots", async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ id: "s1", timeSlot: "10:00-11:00" }] });
    const res = await request(app).get("/api/bookings/available?fieldId=f1&date=2026-05-01");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].timeSlot).toBe("10:00-11:00");
  });
});

describe("POST /api/bookings", () => {
  it("creates booking and returns 201", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "b2", status: "CONFIRMED" } });
    const res = await request(app).post("/api/bookings").send({ userId: "u1", fieldId: "f1", date: "2026-05-01", timeSlot: "10:00-11:00" });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("CONFIRMED");
  });
});

describe("PATCH /api/bookings/:id/cancel", () => {
  it("cancels booking", async () => {
    mockedAxios.patch.mockResolvedValue({ data: { id: "b1", status: "CANCELLED" } });
    const res = await request(app).patch("/api/bookings/b1/cancel");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("CANCELLED");
  });
});

describe("GET /api/users/:id", () => {
  it("returns user by id", async () => {
    mockedAxios.get.mockResolvedValue({ data: { id: 1, username: "user1" } });
    const res = await request(app).get("/api/users/1");
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("user1");
  });
});
