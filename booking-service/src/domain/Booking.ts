export interface Booking {
  id: string;
  userId: string;
  fieldId: string;
  slotId?: string;      // ← ID termina v availability-service
  date: string;
  timeSlot: string;
  status: "active" | "cancelled";
  createdAt: string;
}