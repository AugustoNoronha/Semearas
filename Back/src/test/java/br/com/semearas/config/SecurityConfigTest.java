package br.com.semearas.config;

import br.com.semearas.auth.AuthRepository;
import br.com.semearas.auth.TokenService;
import br.com.semearas.user.UserProfile;
import br.com.semearas.user.UserRole;
import java.time.OffsetDateTime;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecurityConfigTest {
    private final SecurityConfig config = new SecurityConfig();
    private final AuthRepository repository = mock(AuthRepository.class);
    private final UUID id = UUID.randomUUID();
    private final UserProfile user = new UserProfile(id, "Teste", "teste@example.invalid", "52998224725", UserRole.USER, OffsetDateTime.now());
    private JwtEncoder encoder;
    private JwtDecoder decoder;

    @BeforeEach
    void setup() {
        var key = config.jwtKey("test-only-secret-at-least-32-bytes-long");
        encoder = config.jwtEncoder(key);
        decoder = config.jwtDecoder(key, repository, "semearas");
        when(repository.byId(id)).thenReturn(Optional.of(new AuthRepository.Credentials(id, "unused", 0, UserRole.USER)));
    }

    private String token(String issuer, long ttl) {
        return new TokenService(encoder, issuer, ttl).issue(user, 0).accessToken();
    }

    @Test
    void acceptsSignedTokenWithoutPersonalDataInClaims() {
        var jwt = decoder.decode(token("semearas", 900));
        assertEquals(id.toString(), jwt.getSubject());
        assertEquals("USER", jwt.getClaimAsString("role"));
        assertFalse(jwt.getClaims().containsKey("cpf"));
        assertFalse(jwt.getClaims().containsKey("email"));
        assertFalse(jwt.getClaims().containsKey("password"));
    }

    @Test
    void rejectsExpiredAndWrongIssuerTokens() {
        assertThrows(JwtException.class, () -> decoder.decode(token("outro", 900)));
        Instant past = Instant.now().minusSeconds(120);
        var claims = JwtClaimsSet.builder().issuer("semearas").subject(id.toString())
                .issuedAt(past).notBefore(past).expiresAt(past.plusSeconds(30))
                .claim("role", "USER").claim("ver", 0).build();
        String expired = encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        assertThrows(JwtException.class, () -> decoder.decode(expired));
    }

    @Test
    void rejectsWrongSignature() {
        var other = config.jwtEncoder(config.jwtKey("another-test-only-secret-at-least-32-bytes"));
        String token = new TokenService(other, "semearas", 900).issue(user, 0).accessToken();
        assertThrows(JwtException.class, () -> decoder.decode(token));
    }

    @Test
    void rejectsRevokedTokens() {
        String token = token("semearas", 900);
        when(repository.byId(id)).thenReturn(Optional.of(new AuthRepository.Credentials(id, "unused", 1, UserRole.USER)));
        assertThrows(JwtException.class, () -> decoder.decode(token));
    }

    @Test
    void rejectsDeletedUsersAndChangedRoles() {
        String token = token("semearas", 900);
        when(repository.byId(id)).thenReturn(Optional.of(new AuthRepository.Credentials(id, "unused", 0, UserRole.ADMIN)));
        assertThrows(JwtException.class, () -> decoder.decode(token));
        when(repository.byId(id)).thenReturn(Optional.empty());
        assertThrows(JwtException.class, () -> decoder.decode(token));
    }

    @Test
    void refusesShortSecrets() {
        assertThrows(IllegalArgumentException.class, () -> config.jwtKey("short"));
    }
}
