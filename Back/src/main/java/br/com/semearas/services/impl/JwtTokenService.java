package br.com.semearas.services.impl;

import br.com.semearas.dto.TokenResponse;
import br.com.semearas.model.UserProfile;
import br.com.semearas.services.TokenService;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService implements TokenService {
    private final JwtEncoder encoder;
    private final String issuer;
    private final long ttl;

    public JwtTokenService(JwtEncoder encoder, @Value("${app.jwt.issuer}") String issuer,
                        @Value("${app.jwt.ttl-seconds}") long ttl) {
        this.encoder = encoder; this.issuer = issuer; this.ttl = ttl;
    }

    @Override
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
