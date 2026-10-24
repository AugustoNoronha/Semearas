package br.com.semearas.services;

import br.com.semearas.dto.TokenResponse;
import br.com.semearas.model.UserProfile;

public interface TokenService {
    TokenResponse issue(UserProfile user, long version);
}
