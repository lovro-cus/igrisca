package si.sportfield.userservice.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String BOOKING_EXCHANGE    = "booking.events";
    public static final String QUEUE_BOOKING_CREATED   = "user-service.booking.created";
    public static final String QUEUE_BOOKING_CANCELLED = "user-service.booking.cancelled";

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(BOOKING_EXCHANGE, true, false);
    }

    @Bean
    public Queue bookingCreatedQueue() {
        return QueueBuilder.durable(QUEUE_BOOKING_CREATED).build();
    }

    @Bean
    public Queue bookingCancelledQueue() {
        return QueueBuilder.durable(QUEUE_BOOKING_CANCELLED).build();
    }

    @Bean
    public Binding bookingCreatedBinding(Queue bookingCreatedQueue, TopicExchange bookingExchange) {
        return BindingBuilder.bind(bookingCreatedQueue).to(bookingExchange).with("booking.created");
    }

    @Bean
    public Binding bookingCancelledBinding(Queue bookingCancelledQueue, TopicExchange bookingExchange) {
        return BindingBuilder.bind(bookingCancelledQueue).to(bookingExchange).with("booking.cancelled");
    }
}
