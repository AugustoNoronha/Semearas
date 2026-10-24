package br.com.semearas.services;

import br.com.semearas.dto.ItemPage;
import br.com.semearas.dto.ItemRequest;
import br.com.semearas.model.CatalogItem.Category;
import br.com.semearas.model.CatalogItem;
import java.util.UUID;

public interface ItemService {
    ItemPage list(UUID owner, Category category, String query, int page, int size);
    CatalogItem get(UUID owner, UUID id);
    CatalogItem create(UUID owner, ItemRequest request);
    CatalogItem update(UUID owner, UUID id, ItemRequest request);
    void delete(UUID owner, UUID id);
}
