package br.com.semearas.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Locale;
import org.hibernate.validator.constraints.br.CPF;

public final class AuthRequests {
    private AuthRequests() { }

    public record Register(
            @NotBlank @Size(min = 2, max = 150) String name,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @CPF @Pattern(regexp = "[0-9]{11}") String cpf,
            @NotBlank @Size(min = 8, max = 72) String password) {
        public Register {
            name = name == null ? null : name.trim();
            email = normalizeEmail(email);
            cpf = cpf == null ? null : cpf.replaceAll("[.\\-\\s]", "");
        }
    }

    public record Login(@NotBlank @Email @Size(max = 254) String email,
                        @NotBlank @Size(max = 72) String password) {
        public Login { email = normalizeEmail(email); }
    }

    private static String normalizeEmail(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }
}
