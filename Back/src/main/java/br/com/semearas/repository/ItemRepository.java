package br.com.semearas.repository;

import br.com.semearas.dto.ItemPage;
import br.com.semearas.dto.ItemRequest;
import br.com.semearas.model.CatalogItem.Category;
import br.com.semearas.model.CatalogItem;
import java.util.Optional;
import java.util.UUID;

public interface ItemRepository {
    ItemPage list(UUID owner, Category category, String query, int page, int size);
    Optional<CatalogItem> find(UUID owner, UUID id);
    CatalogItem create(UUID owner, ItemRequest request);
    Optional<CatalogItem> update(UUID owner, UUID id, ItemRequest request);
    boolean delete(UUID owner, UUID id);
}
