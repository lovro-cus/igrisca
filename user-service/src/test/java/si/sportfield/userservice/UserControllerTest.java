package si.sportfield.userservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import si.sportfield.userservice.controller.UserController;
import si.sportfield.userservice.domain.User;
import si.sportfield.userservice.service.UserService;

import java.time.LocalDateTime;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@WebFluxTest(
        controllers = UserController.class,
        excludeAutoConfiguration = { RabbitAutoConfiguration.class }
)
@Import(si.sportfield.userservice.config.CorsConfig.class)
class UserControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private UserService userService;

    private User fakeUser() {
        return new User(1L, "alice", "alice@test.com", "hash", "USER", LocalDateTime.now());
    }

    @Test
    void getAll_vrne200() {
        when(userService.getAll()).thenReturn(Flux.just(fakeUser()));

        webTestClient.get().uri("/users")
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(User.class).hasSize(1);
    }

    @Test
    void getById_vrne200() {
        when(userService.getById(1L)).thenReturn(Mono.just(fakeUser()));

        webTestClient.get().uri("/users/1")
                .exchange()
                .expectStatus().isOk()
                .expectBody(User.class);
    }

    @Test
    void register_vrne201() {
        when(userService.register(anyString(), anyString(), anyString()))
                .thenReturn(Mono.just(fakeUser()));

        webTestClient.post().uri("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("username", "alice", "email", "alice@test.com", "password", "geslo123"))
                .exchange()
                .expectStatus().isCreated()
                .expectBody(User.class);
    }

    @Test
    void login_vrne200() {
        when(userService.login(anyString(), anyString())).thenReturn(Mono.just(fakeUser()));

        webTestClient.post().uri("/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("email", "alice@test.com", "password", "geslo123"))
                .exchange()
                .expectStatus().isOk()
                .expectBody(User.class);
    }

    @Test
    void update_vrne200() {
        when(userService.update(eq(1L), anyString(), anyString()))
                .thenReturn(Mono.just(fakeUser()));

        webTestClient.put().uri("/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("username", "alice2", "email", "alice2@test.com"))
                .exchange()
                .expectStatus().isOk()
                .expectBody(User.class);
    }

    @Test
    void delete_vrne204() {
        when(userService.delete(1L)).thenReturn(Mono.empty());

        webTestClient.delete().uri("/users/1")
                .exchange()
                .expectStatus().isNoContent();
    }
}
