export interface Booking {
  id: string;
  userId: string;
  fieldId: string;
  date: string;       // ISO format: "2026-03-20"
  timeSlot: string;   // npr. "10:00-11:00"
  status: "active" | "cancelled";
  createdAt: string;
}
