package br.com.semearas.controller;

import br.com.semearas.dto.AuthRequests;
import br.com.semearas.dto.TokenResponse;
import br.com.semearas.model.UserProfile;
import br.com.semearas.services.AuthService;
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

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public TokenResponse register(@Valid @RequestBody AuthRequests.Register request) {
        return service.register(request);
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody AuthRequests.Login request) {
        return service.login(request);
    }

    @GetMapping("/me")
    public UserProfile me(@AuthenticationPrincipal Jwt jwt) {
        return service.profile(UUID.fromString(jwt.getSubject()));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@AuthenticationPrincipal Jwt jwt) {
        service.logout(UUID.fromString(jwt.getSubject()));
    }
}
