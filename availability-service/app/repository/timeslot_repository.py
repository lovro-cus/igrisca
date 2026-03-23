import logging
from sqlalchemy.orm import Session
from app.domain.models import TimeSlot
import uuid

logger = logging.getLogger(__name__)

class TimeSlotRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_available_slots(self, field_id: str, date: str) -> list[TimeSlot]:
        return self.db.query(TimeSlot).filter(
            TimeSlot.field_id == field_id,
            TimeSlot.date == date,
            TimeSlot.available == True
        ).all()

    def get_all_slots(self, field_id: str, date: str) -> list[TimeSlot]:
        return self.db.query(TimeSlot).filter(
            TimeSlot.field_id == field_id,
            TimeSlot.date == date
        ).all()

    def get_by_id(self, slot_id: str) -> TimeSlot | None:
        return self.db.query(TimeSlot).filter(TimeSlot.id == slot_id).first()

    def create(self, field_id: str, date: str, time_slot: str) -> TimeSlot:
        slot = TimeSlot(
            id=str(uuid.uuid4()),
            field_id=field_id,
            date=date,
            time_slot=time_slot,
            available=True
        )
        self.db.add(slot)
        self.db.commit()
        self.db.refresh(slot)
        logger.info(f"TimeSlot created: {slot.id} for field {field_id} on {date}")
        return slot

    def set_availability(self, slot_id: str, available: bool) -> TimeSlot | None:
        slot = self.get_by_id(slot_id)
        if not slot:
            logger.warning(f"TimeSlot not found: {slot_id}")
            return None
        slot.available = available
        self.db.commit()
        self.db.refresh(slot)
        logger.info(f"TimeSlot {slot_id} availability set to {available}")
        return slot