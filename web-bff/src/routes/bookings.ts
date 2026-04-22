import { Router, Request, Response } from "express";
import axios from "axios";
import { BOOKING_SERVICE_URL } from "../config";

export const bookingsRouter = Router();

bookingsRouter.get("/available", async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(`${BOOKING_SERVICE_URL}/bookings/available`, { params: req.query });
    return res.json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 500).json(err.response?.data || { error: "Napaka" });
  }
});

bookingsRouter.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(`${BOOKING_SERVICE_URL}/bookings/user/${req.params.userId}`);
    return res.json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 500).json(err.response?.data || { error: "Napaka" });
  }
});

bookingsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const { data } = await axios.get(`${BOOKING_SERVICE_URL}/bookings`);
    return res.json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 500).json(err.response?.data || { error: "Napaka" });
  }
});

bookingsRouter.post("/slots", async (req: Request, res: Response) => {
  try {
    const { data } = await axios.post(`${BOOKING_SERVICE_URL}/bookings/slots`, req.body);
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 500).json(err.response?.data || { error: "Napaka" });
  }
});

bookingsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { data } = await axios.post(`${BOOKING_SERVICE_URL}/bookings`, req.body);
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 500).json(err.response?.data || { error: "Napaka" });
  }
});

bookingsRouter.patch("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const { data } = await axios.patch(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}/cancel`);
    return res.json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 500).json(err.response?.data || { error: "Napaka" });
  }
});

bookingsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(`${BOOKING_SERVICE_URL}/bookings/${req.params.id}`);
    return res.json(data);
  } catch (err: any) {
    return res.status(err.response?.status || 404).json(err.response?.data || { error: "Ni najdeno" });
  }
});
