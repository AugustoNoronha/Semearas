package br.com.semearas.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CatalogItem(UUID id, Category category, String name, String species, String breed,
        String registryNumber, String city, String state, String description, Sex sex, LocalDate birthDate,
        GeneticType geneticType, String sourceAnimal, Integer quantity,
        OffsetDateTime createdAt, OffsetDateTime updatedAt) {
    public enum Category { ANIMAL, GENETIC_MATERIAL }
    public enum Sex { MALE, FEMALE, GELDING, UNKNOWN }
    public enum GeneticType { SEMEN, EMBRYO, OOCYTE, COVERING, OTHER }
}
