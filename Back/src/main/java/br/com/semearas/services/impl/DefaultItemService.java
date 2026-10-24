package br.com.semearas.services.impl;

import br.com.semearas.dto.ItemPage;
import br.com.semearas.dto.ItemRequest;
import br.com.semearas.model.CatalogItem.Category;
import br.com.semearas.model.CatalogItem;
import br.com.semearas.repository.ItemRepository;
import br.com.semearas.services.ItemService;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DefaultItemService implements ItemService {
    private final ItemRepository repository;

    public DefaultItemService(ItemRepository repository) { this.repository = repository; }

    @Override
    @Transactional(readOnly = true)
    public ItemPage list(UUID owner, Category category, String query, int page, int size) {
        return repository.list(owner, category, query, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public CatalogItem get(UUID owner, UUID id) {
        return repository.find(owner, id).orElseThrow(this::notFound);
    }

    @Override
    @Transactional
    public CatalogItem create(UUID owner, ItemRequest request) { return repository.create(owner, request); }

    @Override
    @Transactional
    public CatalogItem update(UUID owner, UUID id, ItemRequest request) {
        return repository.update(owner, id, request).orElseThrow(this::notFound);
    }

    @Override
    @Transactional
    public void delete(UUID owner, UUID id) {
        if (!repository.delete(owner, id)) throw notFound();
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Cadastro não encontrado.");
    }
}
