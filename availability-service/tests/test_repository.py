import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.repository.timeslot_repository import TimeSlotRepository

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestSession = sessionmaker(bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def repo():
    return TimeSlotRepository(TestSession())

def test_create_timeslot(repo):
    slot = repo.create("field1", "2026-03-25", "10:00-11:00")
    assert slot.id is not None
    assert slot.available is True

def test_get_available_slots(repo):
    repo.create("field1", "2026-03-25", "10:00-11:00")
    repo.create("field1", "2026-03-25", "11:00-12:00")
    slots = repo.get_available_slots("field1", "2026-03-25")
    assert len(slots) == 2

def test_get_by_id(repo):
    slot = repo.create("field1", "2026-03-25", "10:00-11:00")
    found = repo.get_by_id(slot.id)
    assert found is not None
    assert found.id == slot.id

def test_get_by_id_nonexistent(repo):
    assert repo.get_by_id("nonexistent") is None

def test_set_availability_false(repo):
    slot = repo.create("field1", "2026-03-25", "10:00-11:00")
    updated = repo.set_availability(slot.id, False)
    assert updated.available is False

def test_set_availability_true(repo):
    slot = repo.create("field1", "2026-03-25", "10:00-11:00")
    repo.set_availability(slot.id, False)
    updated = repo.set_availability(slot.id, True)
    assert updated.available is True

def test_set_availability_nonexistent(repo):
    result = repo.set_availability("bad-id", False)
    assert result is None

def test_available_slots_excludes_booked(repo):
    slot = repo.create("field1", "2026-03-25", "10:00-11:00")
    repo.create("field1", "2026-03-25", "11:00-12:00")
    repo.set_availability(slot.id, False)
    available = repo.get_available_slots("field1", "2026-03-25")
    assert len(available) == 1