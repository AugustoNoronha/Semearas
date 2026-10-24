package br.com.semearas.dto;

import br.com.semearas.model.CatalogItem.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.Locale;

public record ItemRequest(
        @NotNull Category category,
        @NotBlank @Size(min = 2, max = 150) String name,
        @NotBlank @Size(min = 2, max = 80) String species,
        @Size(max = 100) String breed,
        @Size(max = 100) String registryNumber,
        @Size(max = 100) String city,
        @Pattern(regexp = "AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO") String state,
        @Size(max = 3000) String description,
        Sex sex,
        @PastOrPresent LocalDate birthDate,
        GeneticType geneticType,
        @Size(max = 150) String sourceAnimal,
        @Min(1) @Max(1000000) Integer quantity) {

    public ItemRequest {
        name = clean(name); species = clean(species); breed = clean(breed);
        registryNumber = clean(registryNumber); city = clean(city); state = clean(state);
        if (state != null) state = state.toUpperCase(Locale.ROOT);
        description = clean(description); sourceAnimal = clean(sourceAnimal);
    }

    @AssertTrue(message = "Confira os campos específicos da categoria.")
    public boolean isCategoryFieldsValid() {
        if (category == null) return true;
        return category == Category.ANIMAL
                ? sex != null && geneticType == null && quantity == null && sourceAnimal == null
                : geneticType != null && quantity != null && sex == null && birthDate == null;
    }

    private static String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
