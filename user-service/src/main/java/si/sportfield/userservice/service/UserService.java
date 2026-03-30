package si.sportfield.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import si.sportfield.userservice.domain.User;
import si.sportfield.userservice.repository.UserRepository;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Flux<User> getAll() {
        log.info("Pridobivanje vseh uporabnikov");
        return userRepository.findAll();
    }

    public Mono<User> getById(Long id) {
        log.info("Pridobivanje uporabnika z ID: {}", id);
        return userRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Uporabnik ni najden: " + id)));
    }

    public Mono<User> register(String username, String email, String password) {
        log.info("Registracija uporabnika: {}", email);
        User user = new User(null, username, email, hashPassword(password), "USER", LocalDateTime.now());
        return userRepository.save(user)
                .doOnSuccess(u -> log.info("Uporabnik registriran: {}", u.getId()));
    }

    public Mono<User> login(String email, String password) {
        log.info("Poskus prijave: {}", email);
        return userRepository.findByEmail(email)
                .filter(u -> u.getPasswordHash().equals(hashPassword(password)))
                .switchIfEmpty(Mono.error(new RuntimeException("Napačni podatki")));
    }

    public Mono<User> update(Long id, String username, String email) {
        log.info("Posodabljanje uporabnika: {}", id);
        return userRepository.findById(id)
                .flatMap(user -> {
                    user.setUsername(username);
                    user.setEmail(email);
                    return userRepository.save(user);
                })
                .switchIfEmpty(Mono.error(new RuntimeException("Uporabnik ni najden: " + id)));
    }

    public Mono<Void> delete(Long id) {
        log.info("Brisanje uporabnika: {}", id);
        return userRepository.deleteById(id);
    }

    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Napaka pri hashiranju gesla", e);
        }
    }
}
