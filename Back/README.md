# SEMEARAS — Back

Java 21, Spring Boot 4.1.1, Spring Security, JWT, PostgreSQL 17 e Flyway.

## Subir banco e API

Requisito: Docker Desktop ativo. Java e Maven locais não são necessários.

```sh
cd Back
python3 scripts/setup_env.py
docker compose up -d --build
```

API: `http://localhost:8080`. O Flyway cria as tabelas automaticamente ao iniciar.
As credenciais e a chave JWT são geradas em `.env`, ignorado pelo Git.
O script preserva qualquer `.env` existente.

```sh
docker compose ps
docker compose logs -f api
docker compose stop
docker compose start
```

Os dados permanecem no volume `semearas_postgres_data` após remover os containers.

## DBeaver

Crie uma conexão **PostgreSQL**, teste e salve:

| Campo | Valor padrão |
| --- | --- |
| Host | `localhost` |
| Porta | `5433` |
| Database | `semearas` |
| Usuário | `semearas` |
| Senha | Valor de `POSTGRES_PASSWORD` em `Back/.env` |
| JDBC URL | `jdbc:postgresql://localhost:5433/semearas` |

A porta 5433 evita conflito com o banco de outro projeto. Banco e API são
expostos apenas na interface local. Para alterar portas, edite `.env` e execute
`docker compose up -d`.

## Tabelas

| Tabela | Dados |
| --- | --- |
| `users` | UUID, nome, e-mail único, CPF único sem máscara, `role` USER/ADMIN, datas |
| `auth` | FK `user_id` (1:1), hash BCrypt, versão dos tokens, último login, datas |

`flyway_schema_history` é uma tabela técnica para controle das migrações.
Migração inicial: `src/main/resources/db/migration/V1__create_users_and_auth.sql`.
Altere o esquema em novas migrações, preservando as já aplicadas.

E-mails são normalizados para minúsculas e CPFs têm máscara removida e dígitos
verificadores validados. O banco restringe `role` a `USER` e `ADMIN`.
O cadastro público sempre cria `USER`, mesmo que o cliente envie outro tipo.

Para promover uma conta existente via conexão administrativa no DBeaver:

```sql
UPDATE users
SET role = 'ADMIN', updated_at = CURRENT_TIMESTAMP
WHERE email = 'email-da-conta@exemplo.com';
```

Após alterar o tipo, faça login novamente: tokens com o tipo anterior são rejeitados.
Nenhuma conta administrativa ou senha padrão é criada automaticamente.

## Endpoints

| Método | Rota | Acesso | Resultado |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Público | Cria usuário e retorna JWT (201) |
| POST | `/api/auth/login` | Público | Valida credenciais e retorna JWT (200) |
| GET | `/api/auth/me` | Bearer JWT | Retorna o próprio cadastro (200) |
| POST | `/api/auth/logout` | Bearer JWT | Invalida todos os tokens do usuário (204) |

Cadastro:

```json
{
  "name": "Maria Silva",
  "email": "maria@exemplo.com",
  "cpf": "529.982.247-25",
  "password": "MinhaSenha123!"
}
```

Login:

```json
{
  "email": "maria@exemplo.com",
  "password": "MinhaSenha123!"
}
```

Resposta do cadastro/login: `accessToken`, `tokenType` (`Bearer`), `expiresIn`
(`900`, em segundos) e `user` (`id`, `name`, `email`, `cpf`, `role`, `createdAt`).
O hash da senha nunca é retornado.

Envie o token nos endpoints protegidos:

```http
Authorization: Bearer <accessToken>
```

Senhas de cadastro têm de 8 caracteres a 72 bytes UTF-8, limite do BCrypt.
Dados inválidos retornam 400; e-mail/CPF duplicado, 409; credenciais ou token
inválidos/expirados/revogados, 401; permissão insuficiente, 403.

JWT assinado com HS256, emissor `semearas` e validade de 15 minutos. Os claims
contêm ID, tipo, versão e metadados de validade; não contêm CPF, e-mail ou senha.
Cada requisição verifica a versão e o tipo atuais no banco para permitir revogação.
O logout encerra todas as sessões daquele usuário. Ainda não há refresh token;
após expirar, faça login novamente. Rotacionar `JWT_SECRET` invalida tokens existentes.

As demais rotas exigem autenticação. `/api/admin/**` exige `ADMIN`;
ainda não há funcionalidades administrativas. CORS usa `CORS_ORIGINS` do `.env`.
Adicione a origem do front se ele iniciar em outra porta.
As telas do Front ainda não estão conectadas a esses endpoints.

## Testes

O build Docker executa testes Java de assinatura, expiração, emissor, revogação,
alteração de tipo e exclusão de usuário.

Com a API ativa:

```sh
python3 scripts/test_auth.py
```

O teste HTTP verifica cadastro, validação, duplicidade, login, restrição de ADMIN,
JWT, isolamento de usuários e logout contra o PostgreSQL real. Cria duas contas
fictícias `@example.invalid` e exibe seus UUIDs para remoção opcional.

## Executar fora do Docker

Com JDK 21 e Maven 3.9, mantenha apenas o banco no Docker. Exporte no shell
`DATABASE_PASSWORD` (valor de `POSTGRES_PASSWORD`) e `JWT_SECRET` do `.env`:

```sh
docker compose stop api
docker compose up -d postgres
mvn verify
mvn spring-boot:run
```

Spring não lê `.env` automaticamente fora do Compose. URL local padrão:
`jdbc:postgresql://localhost:5433/semearas`, usuário `semearas`.
