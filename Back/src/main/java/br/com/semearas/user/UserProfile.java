package br.com.semearas.user;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserProfile(UUID id, String name, String email, String cpf, UserRole role,
                          OffsetDateTime createdAt) { }
