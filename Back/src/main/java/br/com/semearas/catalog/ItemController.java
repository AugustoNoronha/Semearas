package br.com.semearas.catalog;

import br.com.semearas.catalog.CatalogItem.Category;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    private final ItemRepository repository;
    public ItemController(ItemRepository repository) { this.repository = repository; }

    @GetMapping
    public ItemRepository.ItemPage list(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Category category,
            @RequestParam(defaultValue = "") @Size(max = 100) String q,
            @RequestParam(defaultValue = "0") @Min(0) @Max(1000000) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return repository.list(owner(jwt), category, q, page, size);
    }

    @GetMapping("/{id}")
    public CatalogItem get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return repository.find(owner(jwt), id).orElseThrow(this::notFound);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CatalogItem create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ItemRequest request) {
        return repository.create(owner(jwt), request);
    }

    @PutMapping("/{id}")
    public CatalogItem update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @Valid @RequestBody ItemRequest request) {
        return repository.update(owner(jwt), id, request).orElseThrow(this::notFound);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        if (!repository.delete(owner(jwt), id)) throw notFound();
    }

    private UUID owner(Jwt jwt) { return UUID.fromString(jwt.getSubject()); }
    private ResponseStatusException notFound() { return new ResponseStatusException(HttpStatus.NOT_FOUND, "Cadastro não encontrado."); }
}
