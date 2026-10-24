package br.com.semearas.services;

import br.com.semearas.dto.AuthRequests;
import br.com.semearas.dto.TokenResponse;
import br.com.semearas.model.UserProfile;
import java.util.UUID;

public interface AuthService {
    TokenResponse register(AuthRequests.Register request);
    TokenResponse login(AuthRequests.Login request);
    UserProfile profile(UUID id);
    void logout(UUID id);
}
