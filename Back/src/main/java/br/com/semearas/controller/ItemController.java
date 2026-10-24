package br.com.semearas.controller;

import br.com.semearas.dto.ItemPage;
import br.com.semearas.dto.ItemRequest;
import br.com.semearas.model.CatalogItem.Category;
import br.com.semearas.model.CatalogItem;
import br.com.semearas.services.ItemService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    private final ItemService service;
    public ItemController(ItemService service) { this.service = service; }

    @GetMapping
    public ItemPage list(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Category category,
            @RequestParam(defaultValue = "") @Size(max = 100) String q,
            @RequestParam(defaultValue = "0") @Min(0) @Max(1000000) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return service.list(owner(jwt), category, q, page, size);
    }

    @GetMapping("/{id}")
    public CatalogItem get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.get(owner(jwt), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CatalogItem create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ItemRequest request) {
        return service.create(owner(jwt), request);
    }

    @PutMapping("/{id}")
    public CatalogItem update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @Valid @RequestBody ItemRequest request) {
        return service.update(owner(jwt), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        service.delete(owner(jwt), id);
    }

    private UUID owner(Jwt jwt) { return UUID.fromString(jwt.getSubject()); }
}
