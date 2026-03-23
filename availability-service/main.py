import logging
import grpc
from concurrent import futures
import sys
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

from app.database import Base, engine
from generated import availability_pb2_grpc
from app.service.availability_service import AvailabilityServicer

def serve():
    Base.metadata.create_all(bind=engine)
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