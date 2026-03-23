import logging
from concurrent import futures
import grpc
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))

from generated import availability_pb2, availability_pb2_grpc
from app.repository.timeslot_repository import TimeSlotRepository
from app.database import get_db_session

logger = logging.getLogger(__name__)

class AvailabilityServicer(availability_pb2_grpc.AvailabilityServiceServicer):

    def _get_repo(self):
        return TimeSlotRepository(get_db_session())

    def GetAvailableSlots(self, request, context):
        logger.info(f"GetAvailableSlots: fieldId={request.fieldId}, date={request.date}")
        repo = self._get_repo()
        slots = repo.get_available_slots(request.fieldId, request.date)
        return availability_pb2.GetAvailableSlotsResponse(
            slots=[self._to_proto(s) for s in slots]
        )

    def AddTimeSlot(self, request, context):
        logger.info(f"AddTimeSlot: fieldId={request.fieldId}, date={request.date}, timeSlot={request.timeSlot}")
        repo = self._get_repo()
        slot = repo.create(request.fieldId, request.date, request.timeSlot)
        return self._to_proto(slot)

    def MarkSlotBooked(self, request, context):
        logger.info(f"MarkSlotBooked: id={request.id}")
        repo = self._get_repo()
        slot = repo.set_availability(request.id, False)
        if not slot:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(f"TimeSlot not found: {request.id}")
            return availability_pb2.TimeSlotResponse()
        return self._to_proto(slot)

    def MarkSlotAvailable(self, request, context):
        logger.info(f"MarkSlotAvailable: id={request.id}")
        repo = self._get_repo()
        slot = repo.set_availability(request.id, True)
        if not slot:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(f"TimeSlot not found: {request.id}")
            return availability_pb2.TimeSlotResponse()
        return self._to_proto(slot)

    def _to_proto(self, slot):
        return availability_pb2.TimeSlotResponse(
            id=slot.id,
            fieldId=slot.field_id,
            date=slot.date,
            timeSlot=slot.time_slot,
            available=slot.available
        )