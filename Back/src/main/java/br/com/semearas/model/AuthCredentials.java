package br.com.semearas.model;

import java.util.UUID;

public record AuthCredentials(UUID userId, String passwordHash, long tokenVersion, UserRole role) { }
