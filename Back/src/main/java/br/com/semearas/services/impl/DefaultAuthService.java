package br.com.semearas.services.impl;

import br.com.semearas.dto.AuthRequests;
import br.com.semearas.dto.TokenResponse;
import br.com.semearas.model.AuthCredentials;
import br.com.semearas.model.UserProfile;
import br.com.semearas.repository.AuthRepository;
import br.com.semearas.services.AuthService;
import br.com.semearas.services.TokenService;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DefaultAuthService implements AuthService {
    private final AuthRepository repository;
    private final PasswordEncoder passwords;
    private final TokenService tokens;
    private final String dummyHash;

    public DefaultAuthService(AuthRepository repository, PasswordEncoder passwords, TokenService tokens) {
        this.repository = repository; this.passwords = passwords; this.tokens = tokens;
        this.dummyHash = passwords.encode(UUID.randomUUID().toString());
    }

    @Override
    @Transactional
    public TokenResponse register(AuthRequests.Register request) {
        checkPasswordLength(request.password());
        UUID id = UUID.randomUUID();
        repository.create(id, request.name(), request.email(), request.cpf(), passwords.encode(request.password()));
        repository.loggedIn(id);
        return tokens.issue(repository.profile(id), 0);
    }

    @Override
    @Transactional
    public TokenResponse login(AuthRequests.Login request) {
        checkPasswordLength(request.password());
        var credentials = repository.byEmail(request.email());
        boolean matches = passwords.matches(request.password(), credentials.map(AuthCredentials::passwordHash).orElse(dummyHash));
        if (!matches || credentials.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos.");
        }
        var auth = credentials.orElseThrow();
        repository.loggedIn(auth.userId());
        return tokens.issue(repository.profile(auth.userId()), auth.tokenVersion());
    }

    @Override
    public UserProfile profile(UUID id) { return repository.profile(id); }

    @Override
    @Transactional
    public void logout(UUID id) { repository.revokeTokens(id); }

    private void checkPasswordLength(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha deve ter no máximo 72 bytes em UTF-8.");
        }
    }
}
