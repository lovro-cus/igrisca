import logging
import grpc
import time
from concurrent import futures
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

from app.database import Base, engine
from generated import availability_pb2_grpc
from app.service.availability_service import AvailabilityServicer

def init_db_with_retry(retries=10, delay=3):
    for i in range(retries):
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables ready")
            return
        except Exception as e:
            logger.error(f"DB connection failed (attempt {i+1}/{retries}): {e}")
            if i < retries - 1:
                time.sleep(delay)
    raise Exception("Could not connect to database after multiple retries")

def serve():
    init_db_with_retry()
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    availability_pb2_grpc.add_AvailabilityServiceServicer_to_server(
        AvailabilityServicer(), server
    )
    port = os.getenv("GRPC_PORT", "9090")
    server.add_insecure_port(f"[::]:{port}")
    server.start()
    logger.info(f"Availability gRPC server running on port {port}")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()