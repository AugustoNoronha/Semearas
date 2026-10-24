package br.com.semearas.dto;

import br.com.semearas.model.UserProfile;

public record TokenResponse(String accessToken, String tokenType, long expiresIn, UserProfile user) { }
