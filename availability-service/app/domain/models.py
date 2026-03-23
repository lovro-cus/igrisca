from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.sqlite import TEXT
from app.database import Base
import uuid

class TimeSlot(Base):
    __tablename__ = "time_slots"

    id = Column(TEXT, primary_key=True, default=lambda: str(uuid.uuid4()))
    field_id = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time_slot = Column(String, nullable=False)
    available = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<TimeSlot {self.field_id} {self.date} {self.time_slot} available={self.available}>"