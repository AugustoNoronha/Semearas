CREATE TABLE catalog_items (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('ANIMAL', 'GENETIC_MATERIAL')),
    name VARCHAR(150) NOT NULL CHECK (length(trim(name)) >= 2),
    species VARCHAR(80) NOT NULL CHECK (length(trim(species)) >= 2),
    breed VARCHAR(100),
    registry_number VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2) CHECK (state IS NULL OR state IN ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
    description VARCHAR(3000),
    sex VARCHAR(10) CHECK (sex IS NULL OR sex IN ('MALE', 'FEMALE', 'GELDING', 'UNKNOWN')),
    birth_date DATE,
    genetic_type VARCHAR(10) CHECK (genetic_type IS NULL OR genetic_type IN ('SEMEN', 'EMBRYO', 'OOCYTE', 'COVERING', 'OTHER')),
    source_animal VARCHAR(150),
    quantity INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT catalog_category_fields CHECK (
        (category = 'ANIMAL' AND sex IS NOT NULL AND genetic_type IS NULL AND quantity IS NULL AND source_animal IS NULL)
        OR (category = 'GENETIC_MATERIAL' AND genetic_type IS NOT NULL AND quantity > 0 AND quantity IS NOT NULL AND sex IS NULL AND birth_date IS NULL)
    )
);

CREATE INDEX catalog_items_owner_created_idx ON catalog_items(owner_id, created_at DESC, id DESC) WHERE deleted_at IS NULL;
