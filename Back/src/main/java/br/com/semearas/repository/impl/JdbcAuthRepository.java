package br.com.semearas.repository.impl;

import br.com.semearas.model.AuthCredentials;
import br.com.semearas.model.UserProfile;
import br.com.semearas.model.UserRole;
import br.com.semearas.repository.AuthRepository;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcAuthRepository implements AuthRepository {
    private final JdbcClient jdbc;

    public JdbcAuthRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    @Override
    public Optional<AuthCredentials> byEmail(String email) {
        return credentials("u.email = :value", email);
    }

    @Override
    public Optional<AuthCredentials> byId(UUID id) { return credentials("u.id = :value", id); }

    private Optional<AuthCredentials> credentials(String condition, Object value) {
        return jdbc.sql("SELECT u.id, a.password_hash, a.token_version, u.role FROM users u "
                + "JOIN auth a ON a.user_id = u.id WHERE " + condition)
                .param("value", value).query((rs, row) -> new AuthCredentials(
                        rs.getObject("id", UUID.class), rs.getString("password_hash"),
                        rs.getLong("token_version"), UserRole.valueOf(rs.getString("role"))))
                .optional();
    }

    @Override
    public UserProfile profile(UUID id) {
        return jdbc.sql("SELECT id, name, email, cpf, role, created_at FROM users WHERE id = :id")
                .param("id", id).query((rs, row) -> new UserProfile(
                        rs.getObject("id", UUID.class), rs.getString("name"), rs.getString("email"),
                        rs.getString("cpf"), UserRole.valueOf(rs.getString("role")),
                        rs.getObject("created_at", OffsetDateTime.class))).single();
    }

    @Override
    public void create(UUID id, String name, String email, String cpf, String hash) {
        jdbc.sql("INSERT INTO users (id, name, email, cpf, role) VALUES (:id, :name, :email, :cpf, 'USER')")
                .param("id", id).param("name", name).param("email", email).param("cpf", cpf).update();
        jdbc.sql("INSERT INTO auth (user_id, password_hash) VALUES (:id, :hash)")
                .param("id", id).param("hash", hash).update();
    }

    @Override
    public void loggedIn(UUID id) {
        jdbc.sql("UPDATE auth SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = :id")
                .param("id", id).update();
    }

    @Override
    public void revokeTokens(UUID id) {
        jdbc.sql("UPDATE auth SET token_version = token_version + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = :id")
                .param("id", id).update();
    }
}
