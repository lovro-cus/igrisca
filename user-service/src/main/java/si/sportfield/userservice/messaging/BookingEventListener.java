package si.sportfield.userservice.messaging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import si.sportfield.userservice.config.RabbitMQConfig;

/**
 * Posluša dogodke rezervacij iz RabbitMQ sporočilnega posrednika.
 * Reaktivno obdeluje BookingCreated in BookingCancelled dogodke.
 */
@Component
@Slf4j
public class BookingEventListener {

    @RabbitListener(queues = RabbitMQConfig.QUEUE_BOOKING_CREATED)
    public void onBookingCreated(String message) {
        log.info("Prejeto sporočilo BookingCreated: {}", message);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_BOOKING_CANCELLED)
    public void onBookingCancelled(String message) {
        log.info("Prejeto sporočilo BookingCancelled: {}", message);
    }
}
