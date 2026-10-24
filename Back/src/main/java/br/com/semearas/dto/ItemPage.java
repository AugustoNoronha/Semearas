package br.com.semearas.dto;

import br.com.semearas.model.CatalogItem;
import java.util.List;

public record ItemPage(List<CatalogItem> content, long totalElements, int page, int size) { }
