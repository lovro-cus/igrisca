import db from "../database";
import { Booking } from "../domain/Booking";
import { v4 as uuidv4 } from "uuid";
import logger from "../logger";

export class BookingRepository {
  create(userId: string, fieldId: string, date: string, timeSlot: string): Booking {
    const booking: Booking = {
      id: uuidv4(),
      userId,
      fieldId,
      date,
      timeSlot,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    db.prepare(`
      INSERT INTO bookings (id, userId, fieldId, date, timeSlot, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(booking.id, booking.userId, booking.fieldId, booking.date, booking.timeSlot, booking.status, booking.createdAt);
    logger.info(`Booking created: ${booking.id}`);
    return booking;
  }

  getById(id: string): Booking | undefined {
    return db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as Booking | undefined;
  }

  getByUser(userId: string): Booking[] {
    return db.prepare("SELECT * FROM bookings WHERE userId = ?").all(userId) as Booking[];
  }

  getAll(): Booking[] {
    return db.prepare("SELECT * FROM bookings").all() as Booking[];
  }

  cancel(id: string): Booking | undefined {
    const booking = this.getById(id);
    if (!booking) return undefined;
    db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(id);
    logger.info(`Booking cancelled: ${id}`);
    return { ...booking, status: "cancelled" };
  }
}
