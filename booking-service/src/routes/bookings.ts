import { Router, Request, Response } from "express";
import { BookingRepository } from "../repository/BookingRepository";
import { addTimeSlot, getAvailableSlots, markSlotBooked, markSlotAvailable } from "../grpc/availabilityClient";
import { publishEvent } from "../messaging/publisher";
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
  const { userId, fieldId, date, timeSlot } = req.body;
  if (!userId || !fieldId || !date || !timeSlot) {
    logger.warn("Create booking - missing fields");
    return res.status(400).json({ error: "userId, fieldId, date in timeSlot so obvezni" });
  }

  // Preveri razpoložljivost prek availability-service (gRPC)
  const availableSlots = await getAvailableSlots(fieldId, date);
  const slot = availableSlots.find((s: any) => s.timeSlot === timeSlot);
  if (!slot) {
    logger.warn(`Slot ni na voljo: fieldId=${fieldId} date=${date} timeSlot=${timeSlot}`);
    return res.status(409).json({ error: "Termin ni na voljo ali je že zaseden" });
  }

  const booking = await new BookingRepository().create(userId, fieldId, date, timeSlot, slot.id);
  if (!booking) return res.status(409).json({ error: "Termin je že zaseden" });
  await markSlotBooked(slot.id);
  await publishEvent("booking.created", { bookingId: booking.id, userId: booking.userId, fieldId: booking.fieldId, date: booking.date });
  return res.status(201).json(booking);
});

/**
 * @swagger
 * /bookings/slots:
 *   post:
 *     summary: Dodaj nov termin (prek availability-service gRPC)
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fieldId, date, timeSlot]
 *             properties:
 *               fieldId: { type: string }
 *               date: { type: string, example: "2026-05-01" }
 *               timeSlot: { type: string, example: "10:00-11:00" }
 *     responses:
 *       201:
 *         description: Termin dodan
 */
router.post("/slots", async (req: Request, res: Response) => {
  const { fieldId, date, timeSlot } = req.body;
  if (!fieldId || !date || !timeSlot) return res.status(400).json({ error: "fieldId, date in timeSlot so obvezni" });
  try {
    const slot = await addTimeSlot(fieldId, date, timeSlot);
    return res.status(201).json(slot);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /bookings/available:
 *   get:
 *     summary: Pridobi proste termine za igrišče in datum (prek availability-service gRPC)
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: fieldId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, example: "2026-04-01" }
 *     responses:
 *       200:
 *         description: Lista prostih terminov
 */
router.get("/available", async (req: Request, res: Response) => {
  const { fieldId, date } = req.query as { fieldId: string; date: string };
  if (!fieldId || !date) return res.status(400).json({ error: "fieldId in date sta obvezna" });
  const slots = await getAvailableSlots(fieldId, date);
  return res.json(slots);
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
  await publishEvent("booking.cancelled", { bookingId: booking.id, userId: booking.userId, fieldId: booking.fieldId });
  return res.json(booking);
});