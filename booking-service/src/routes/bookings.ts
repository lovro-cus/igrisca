import { Router, Request, Response } from "express";
import { BookingRepository } from "../repository/BookingRepository";
import { markSlotBooked, markSlotAvailable } from "../grpc/availabilityClient";
import logger from "../logger";

export const router = Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Ustvari rezervacijo
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, fieldId, date, timeSlot]
 *             properties:
 *               userId: { type: string }
 *               fieldId: { type: string }
 *               slotId: { type: string }
 *               date: { type: string, example: "2026-03-25" }
 *               timeSlot: { type: string, example: "10:00-11:00" }
 *     responses:
 *       201:
 *         description: Rezervacija ustvarjena
 *       400:
 *         description: Manjkajoči podatki
 */
router.post("/", async (req: Request, res: Response) => {
  const { userId, fieldId, slotId, date, timeSlot } = req.body;
  if (!userId || !fieldId || !date || !timeSlot) {
    logger.warn("Create booking - missing fields");
    return res.status(400).json({ error: "userId, fieldId, date in timeSlot so obvezni" });
  }
  const booking = await new BookingRepository().create(userId, fieldId, date, timeSlot, slotId);
  if (slotId) await markSlotBooked(slotId);
  return res.status(201).json(booking);
});

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Seznam vseh rezervacij
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Lista rezervacij
 */
router.get("/", async (_req: Request, res: Response) => {
  return res.json(await new BookingRepository().getAll());
});

/**
 * @swagger
 * /bookings/user/{userId}:
 *   get:
 *     summary: Rezervacije določenega uporabnika
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista rezervacij uporabnika
 */
router.get("/user/:userId", async (req: Request, res: Response) => {
  return res.json(await new BookingRepository().getByUser(req.params.userId));
});

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Pridobi rezervacijo po ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Rezervacija
 *       404:
 *         description: Ni najdena
 */
router.get("/:id", async (req: Request, res: Response) => {
  const booking = await new BookingRepository().getById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Rezervacija ni najdena" });
  return res.json(booking);
});

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Prekliči rezervacijo
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Rezervacija preklicana
 *       404:
 *         description: Ni najdena
 */
router.patch("/:id/cancel", async (req: Request, res: Response) => {
  const booking = await new BookingRepository().cancel(req.params.id);
  if (!booking) return res.status(404).json({ error: "Rezervacija ni najdena" });
  if (booking.slotId) await markSlotAvailable(booking.slotId);
  return res.json(booking);
});