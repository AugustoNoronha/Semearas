package br.com.semearas.repository.impl;

import br.com.semearas.dto.ItemPage;
import br.com.semearas.dto.ItemRequest;
import br.com.semearas.model.CatalogItem.*;
import br.com.semearas.model.CatalogItem;
import br.com.semearas.repository.ItemRepository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcItemRepository implements ItemRepository {
    private final JdbcClient jdbc;
    private static final String FILTER = " owner_id = :owner AND deleted_at IS NULL "
            + "AND (:category = '' OR category = :category) "
            + "AND (name ILIKE :q OR species ILIKE :q OR COALESCE(breed, '') ILIKE :q)";

    public JdbcItemRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    @Override
    public ItemPage list(UUID owner, Category category, String query, int page, int size) {
        String type = category == null ? "" : category.name();
        String search = "%" + query.trim() + "%";
        long total = jdbc.sql("SELECT count(*) FROM catalog_items WHERE " + FILTER)
                .param("owner", owner).param("category", type).param("q", search).query(Long.class).single();
        var items = jdbc.sql("SELECT * FROM catalog_items WHERE " + FILTER + " ORDER BY created_at DESC, id DESC LIMIT :limit OFFSET :offset")
                .param("owner", owner).param("category", type).param("q", search)
                .param("limit", size).param("offset", (long) page * size).query(this::map).list();
        return new ItemPage(items, total, page, size);
    }

    @Override
    public Optional<CatalogItem> find(UUID owner, UUID id) {
        return jdbc.sql("SELECT * FROM catalog_items WHERE id = :id AND owner_id = :owner AND deleted_at IS NULL")
                .param("id", id).param("owner", owner).query(this::map).optional();
    }

    @Override
    public CatalogItem create(UUID owner, ItemRequest item) {
        UUID id = UUID.randomUUID();
        return parameters(jdbc.sql("""
                INSERT INTO catalog_items (id, owner_id, category, name, species, breed, registry_number,
                    city, state, description, sex, birth_date, genetic_type, source_animal, quantity)
                VALUES (:id, :owner, :category, :name, :species, :breed, :registry, :city, :state,
                    :description, :sex, :birth, :genetic, :source, :quantity) RETURNING *
                """), owner, id, item).query(this::map).single();
    }

    @Override
    public Optional<CatalogItem> update(UUID owner, UUID id, ItemRequest item) {
        return parameters(jdbc.sql("""
                UPDATE catalog_items SET category = :category, name = :name, species = :species,
                    breed = :breed, registry_number = :registry, city = :city, state = :state,
                    description = :description, sex = :sex, birth_date = :birth, genetic_type = :genetic,
                    source_animal = :source, quantity = :quantity, updated_at = CURRENT_TIMESTAMP
                WHERE id = :id AND owner_id = :owner AND deleted_at IS NULL RETURNING *
                """), owner, id, item).query(this::map).optional();
    }

    @Override
    public boolean delete(UUID owner, UUID id) {
        return jdbc.sql("UPDATE catalog_items SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP "
                + "WHERE id = :id AND owner_id = :owner AND deleted_at IS NULL")
                .param("id", id).param("owner", owner).update() == 1;
    }

    private JdbcClient.StatementSpec parameters(JdbcClient.StatementSpec sql, UUID owner, UUID id, ItemRequest i) {
        return sql.param("id", id).param("owner", owner).param("category", i.category().name())
                .param("name", i.name()).param("species", i.species()).param("breed", i.breed())
                .param("registry", i.registryNumber()).param("city", i.city()).param("state", i.state())
                .param("description", i.description()).param("sex", i.sex() == null ? null : i.sex().name())
                .param("birth", i.birthDate()).param("genetic", i.geneticType() == null ? null : i.geneticType().name())
                .param("source", i.sourceAnimal()).param("quantity", i.quantity());
    }

    private CatalogItem map(ResultSet rs, int row) throws SQLException {
        String sex = rs.getString("sex"), genetic = rs.getString("genetic_type");
        return new CatalogItem(rs.getObject("id", UUID.class), Category.valueOf(rs.getString("category")),
                rs.getString("name"), rs.getString("species"), rs.getString("breed"), rs.getString("registry_number"),
                rs.getString("city"), rs.getString("state"), rs.getString("description"), sex == null ? null : Sex.valueOf(sex),
                rs.getObject("birth_date", LocalDate.class), genetic == null ? null : GeneticType.valueOf(genetic),
                rs.getString("source_animal"), rs.getObject("quantity", Integer.class),
                rs.getObject("created_at", OffsetDateTime.class), rs.getObject("updated_at", OffsetDateTime.class));
    }
}
