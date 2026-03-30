import amqp from "amqplib";
import logger from "../logger";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const EXCHANGE = "booking.events";

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

async function getChannel(): Promise<amqp.Channel | null> {
  try {
    if (!connection) {
      const conn = await amqp.connect(RABBITMQ_URL);
      conn.on("error", () => { connection = null; channel = null; });
      conn.on("close", () => { connection = null; channel = null; });
      connection = conn;
    }
    if (!channel) {
      channel = await connection!.createChannel();
      await channel.assertExchange(EXCHANGE, "topic", { durable: true });
    }
    return channel;
  } catch (err: any) {
    logger.warn(`RabbitMQ ni dosegljiv: ${err.message}`);
    connection = null;
    channel = null;
    return null;
  }
}

export async function publishEvent(routingKey: string, payload: object): Promise<void> {
  const ch = await getChannel();
  if (!ch) return;
  try {
    ch.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)));
    logger.info(`Dogodek objavljen: ${routingKey} – ${JSON.stringify(payload)}`);
  } catch (err: any) {
    logger.warn(`Napaka pri objavi dogodka: ${err.message}`);
    channel = null;
  }
}
