import { Booking } from "../domain/Booking";
import { v4 as uuidv4 } from "uuid";
import logger from "../logger";

export class BookingRepository {
  private get db() {
    return require("../database").default;
  }

  async create(userId: string, fieldId: string, date: string, timeSlot: string, slotId?: string): Promise<Booking> {
    const booking: Booking = {
      id: uuidv4(),
      userId, fieldId, slotId, date, timeSlot,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    await this.db.query(
      `INSERT INTO bookings (id, "userId", "fieldId", "slotId", date, "timeSlot", status, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [booking.id, booking.userId, booking.fieldId, booking.slotId ?? null, booking.date, booking.timeSlot, booking.status, booking.createdAt]
    );
    logger.info(`Booking created: ${booking.id}`);
    return booking;
  }

  async getById(id: string): Promise<Booking | undefined> {
    const result = await this.db.query(`SELECT * FROM bookings WHERE id = $1`, [id]);
    return result.rows[0];
  }

  async getByUser(userId: string): Promise<Booking[]> {
    const result = await this.db.query(`SELECT * FROM bookings WHERE "userId" = $1`, [userId]);
    return result.rows;
  }

  async getAll(): Promise<Booking[]> {
    const result = await this.db.query(`SELECT * FROM bookings`);
    return result.rows;
  }

  async cancel(id: string): Promise<Booking | undefined> {
    const booking = await this.getById(id);
    if (!booking) return undefined;
    await this.db.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [id]);
    logger.info(`Booking cancelled: ${id}`);
    return { ...booking, status: "cancelled" };
  }
}