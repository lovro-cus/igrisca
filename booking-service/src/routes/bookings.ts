import { Router, Request, Response } from "express";
import { BookingRepository } from "../repository/BookingRepository";
import logger from "../logger";

export const router = Router();
const repo = new BookingRepository();

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
 *               date: { type: string, example: "2026-03-20" }
 *               timeSlot: { type: string, example: "10:00-11:00" }
 *     responses:
 *       201:
 *         description: Rezervacija ustvarjena
 *       400:
 *         description: Manjkajoči podatki
 */
router.post("/", (req: Request, res: Response) => {
  const { userId, fieldId, date, timeSlot } = req.body;
  if (!userId || !fieldId || !date || !timeSlot) {
    logger.warn("Create booking - missing fields");
    return res.status(400).json({ error: "userId, fieldId, date in timeSlot so obvezni" });
  }
  const booking = repo.create(userId, fieldId, date, timeSlot);
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
router.get("/", (_req: Request, res: Response) => {
  return res.json(repo.getAll());
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
router.get("/:id", (req: Request, res: Response) => {
  const booking = repo.getById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Rezervacija ni najdena" });
  return res.json(booking);
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
router.get("/user/:userId", (req: Request, res: Response) => {
  return res.json(repo.getByUser(req.params.userId));
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
router.patch("/:id/cancel", (req: Request, res: Response) => {
  const booking = repo.cancel(req.params.id);
  if (!booking) return res.status(404).json({ error: "Rezervacija ni najdena" });
  return res.json(booking);
});
