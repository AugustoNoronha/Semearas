package br.com.semearas.auth;

import br.com.semearas.user.UserProfile;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final JwtEncoder encoder;
    private final String issuer;
    private final long ttl;

    public TokenService(JwtEncoder encoder, @Value("${app.jwt.issuer}") String issuer,
                        @Value("${app.jwt.ttl-seconds}") long ttl) {
        this.encoder = encoder; this.issuer = issuer; this.ttl = ttl;
    }

    public record TokenResponse(String accessToken, String tokenType, long expiresIn, UserProfile user) { }

    public TokenResponse issue(UserProfile user, long version) {
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder().issuer(issuer).subject(user.id().toString())
                .issuedAt(now).notBefore(now).expiresAt(now.plusSeconds(ttl)).id(UUID.randomUUID().toString())
                .claim("role", user.role().name()).claim("ver", version).build();
        String token = encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new TokenResponse(token, "Bearer", ttl, user);
    }
}
