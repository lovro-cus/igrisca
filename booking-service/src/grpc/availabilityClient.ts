import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import logger from "../logger";

const PROTO_PATH = path.join(__dirname, "../../proto/availability.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDef) as any;

const AVAILABILITY_SERVICE_URL = process.env.AVAILABILITY_SERVICE_URL || "localhost:9090";

const client = new proto.availability.AvailabilityService(
  AVAILABILITY_SERVICE_URL,
  grpc.credentials.createInsecure()
);

export function markSlotBooked(slotId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.MarkSlotBooked({ id: slotId }, (err: any) => {
      if (err) {
        logger.warn(`gRPC MarkSlotBooked failed for ${slotId}: ${err.message}`);
        // Ne blokiraj rezervacije če availability service ni dosegljiv
        resolve();
        return;
      }
      logger.info(`gRPC MarkSlotBooked success for slot: ${slotId}`);
      resolve();
    });
  });
}

export function markSlotAvailable(slotId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.MarkSlotAvailable({ id: slotId }, (err: any) => {
      if (err) {
        logger.warn(`gRPC MarkSlotAvailable failed for ${slotId}: ${err.message}`);
        resolve();
        return;
      }
      logger.info(`gRPC MarkSlotAvailable success for slot: ${slotId}`);
      resolve();
    });
  });
}