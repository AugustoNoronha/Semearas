package br.com.semearas.auth;

import br.com.semearas.user.UserProfile;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService service;
    private final AuthRepository repository;

    public AuthController(AuthService service, AuthRepository repository) {
        this.service = service; this.repository = repository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public TokenService.TokenResponse register(@Valid @RequestBody AuthRequests.Register request) {
        return service.register(request);
    }

    @PostMapping("/login")
    public TokenService.TokenResponse login(@Valid @RequestBody AuthRequests.Login request) {
        return service.login(request);
    }

    @GetMapping("/me")
    public UserProfile me(@AuthenticationPrincipal Jwt jwt) {
        return repository.profile(UUID.fromString(jwt.getSubject()));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@AuthenticationPrincipal Jwt jwt) {
        repository.revokeTokens(UUID.fromString(jwt.getSubject()));
    }
}
