package si.sportfield.userservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import si.sportfield.userservice.domain.User;
import si.sportfield.userservice.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Users", description = "Upravljanje uporabnikov")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Seznam vseh uporabnikov")
    public Flux<User> getAll() {
        return userService.getAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Pridobi uporabnika po ID")
    public Mono<User> getById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registracija novega uporabnika")
    public Mono<User> register(@RequestBody Map<String, String> body) {
        return userService.register(body.get("username"), body.get("email"), body.get("password"));
    }

    @PostMapping("/login")
    @Operation(summary = "Prijava uporabnika")
    public Mono<User> login(@RequestBody Map<String, String> body) {
        return userService.login(body.get("email"), body.get("password"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Posodobi profil uporabnika")
    public Mono<User> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userService.update(id, body.get("username"), body.get("email"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Izbriši uporabnika")
    public Mono<Void> delete(@PathVariable Long id) {
        return userService.delete(id);
    }
}
