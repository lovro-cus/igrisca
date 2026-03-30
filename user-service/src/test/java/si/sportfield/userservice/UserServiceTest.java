package si.sportfield.userservice;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import si.sportfield.userservice.domain.User;
import si.sportfield.userservice.repository.UserRepository;
import si.sportfield.userservice.service.UserService;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User makeUser(Long id, String username, String email, String passwordHash) {
        return new User(id, username, email, passwordHash, "USER", LocalDateTime.now());
    }

    @Test
    void getAll_vrneVseUporabnike() {
        User u = makeUser(1L, "alice", "alice@test.com", "hash");
        when(userRepository.findAll()).thenReturn(Flux.just(u));

        StepVerifier.create(userService.getAll())
                .expectNext(u)
                .verifyComplete();
    }

    @Test
    void getById_najdePo_ID() {
        User u = makeUser(1L, "alice", "alice@test.com", "hash");
        when(userRepository.findById(1L)).thenReturn(Mono.just(u));

        StepVerifier.create(userService.getById(1L))
                .expectNext(u)
                .verifyComplete();
    }

    @Test
    void getById_vrneNapako_koNiNajden() {
        when(userRepository.findById(99L)).thenReturn(Mono.empty());

        StepVerifier.create(userService.getById(99L))
                .expectErrorMessage("Uporabnik ni najden: 99")
                .verify();
    }

    @Test
    void register_shraniNovegaUporabnika() {
        User saved = makeUser(1L, "bob", "bob@test.com", "anyhash");
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(saved));

        StepVerifier.create(userService.register("bob", "bob@test.com", "geslo123"))
                .expectNextMatches(u -> u.getUsername().equals("bob") && u.getRole().equals("USER"))
                .verifyComplete();
    }

    @Test
    void login_uspesenZPravilnimGeslom() {
        String geslo = "tajnoGeslo";
        String hash = hashPassword(geslo);
        User u = makeUser(1L, "alice", "alice@test.com", hash);
        when(userRepository.findByEmail("alice@test.com")).thenReturn(Mono.just(u));

        StepVerifier.create(userService.login("alice@test.com", geslo))
                .expectNext(u)
                .verifyComplete();
    }

    @Test
    void login_vrneNapako_zNapacnimGeslom() {
        String hash = hashPassword("pravilno");
        User u = makeUser(1L, "alice", "alice@test.com", hash);
        when(userRepository.findByEmail("alice@test.com")).thenReturn(Mono.just(u));

        StepVerifier.create(userService.login("alice@test.com", "napacno"))
                .expectErrorMessage("Napačni podatki")
                .verify();
    }

    @Test
    void update_posodobiUporabnika() {
        User original = makeUser(1L, "staro", "staro@test.com", "hash");
        User updated  = makeUser(1L, "novo", "novo@test.com", "hash");
        when(userRepository.findById(1L)).thenReturn(Mono.just(original));
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(updated));

        StepVerifier.create(userService.update(1L, "novo", "novo@test.com"))
                .expectNextMatches(u -> u.getUsername().equals("novo"))
                .verifyComplete();
    }

    // Helper – ista logika kot v UserService
    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
