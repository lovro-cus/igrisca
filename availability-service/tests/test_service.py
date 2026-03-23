import pytest
from unittest.mock import MagicMock, patch
from app.domain.models import TimeSlot
import uuid

def make_slot(available=True):
    slot = TimeSlot()
    slot.id = str(uuid.uuid4())
    slot.field_id = "field1"
    slot.date = "2026-03-25"
    slot.time_slot = "10:00-11:00"
    slot.available = available
    return slot

@pytest.fixture
def servicer():
    from app.service.availability_service import AvailabilityServicer
    return AvailabilityServicer()

def test_get_available_slots(servicer):
    slot = make_slot()
    mock_repo = MagicMock()
    mock_repo.get_available_slots.return_value = [slot]
    with patch.object(servicer, "_get_repo", return_value=mock_repo):
        from generated import availability_pb2
        request = availability_pb2.GetAvailableSlotsRequest(fieldId="field1", date="2026-03-25")
        context = MagicMock()
        response = servicer.GetAvailableSlots(request, context)
        assert len(response.slots) == 1
        assert response.slots[0].timeSlot == "10:00-11:00"

def test_add_time_slot(servicer):
    slot = make_slot()
    mock_repo = MagicMock()
    mock_repo.create.return_value = slot
    with patch.object(servicer, "_get_repo", return_value=mock_repo):
        from generated import availability_pb2
        request = availability_pb2.AddTimeSlotRequest(
            fieldId="field1", date="2026-03-25", timeSlot="10:00-11:00"
        )
        context = MagicMock()
        response = servicer.AddTimeSlot(request, context)
        assert response.available is True

def test_mark_slot_booked(servicer):
    slot = make_slot(available=False)
    mock_repo = MagicMock()
    mock_repo.set_availability.return_value = slot
    with patch.object(servicer, "_get_repo", return_value=mock_repo):
        from generated import availability_pb2
        request = availability_pb2.MarkSlotBookedRequest(id=slot.id)
        context = MagicMock()
        response = servicer.MarkSlotBooked(request, context)
        assert response.available is False

def test_mark_slot_booked_not_found(servicer):
    mock_repo = MagicMock()
    mock_repo.set_availability.return_value = None
    with patch.object(servicer, "_get_repo", return_value=mock_repo):
        from generated import availability_pb2
        import grpc
        request = availability_pb2.MarkSlotBookedRequest(id="bad-id")
        context = MagicMock()
        servicer.MarkSlotBooked(request, context)
        context.set_code.assert_called_once_with(grpc.StatusCode.NOT_FOUND)

def test_mark_slot_available(servicer):
    slot = make_slot(available=True)
    mock_repo = MagicMock()
    mock_repo.set_availability.return_value = slot
    with patch.object(servicer, "_get_repo", return_value=mock_repo):
        from generated import availability_pb2
        request = availability_pb2.MarkSlotAvailableRequest(id=slot.id)
        context = MagicMock()
        response = servicer.MarkSlotAvailable(request, context)
        assert response.available is True