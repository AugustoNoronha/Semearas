package br.com.semearas.repository;

import br.com.semearas.model.AuthCredentials;
import br.com.semearas.model.UserProfile;
import java.util.Optional;
import java.util.UUID;

public interface AuthRepository {
    Optional<AuthCredentials> byEmail(String email);
    Optional<AuthCredentials> byId(UUID id);
    UserProfile profile(UUID id);
    void create(UUID id, String name, String email, String cpf, String hash);
    void loggedIn(UUID id);
    void revokeTokens(UUID id);
}
