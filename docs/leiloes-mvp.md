# SEMEARAS — proposta de leilões para o MVP

Status: proposta para discussão; não implementada. Valores, datas e códigos dos
exemplos são ilustrativos. Esta especificação não define condições jurídicas de venda.

## Organização

Somente ADMIN cria, prepara, publica e cancela leilões. USER pode participar como
proprietário de itens e/ou comprador. Não são necessários novos perfis de acesso.
Um proprietário pode disputar lotes de outros vendedores, mas não os próprios.

Separar o **leilão** (evento) do **lote** (unidade disputada). Um leilão pode começar
com apenas um lote e depois receber vários sem alterar o modelo. Cada lote se
vincula a um animal ou material genético já cadastrado em `catalog_items`.

Há duas ações diferentes:

1. **Autorizar item:** o proprietário seleciona um cadastro próprio e autoriza
   sua inclusão em um leilão em preparação, identificado pelo código compartilhado
   pelo ADMIN. Isso cria um lote proposto. O ADMIN aprova ou recusa e define os
   valores de abertura e incremento, sujeitos à concordância do vendedor.
2. **Inscrever-se para dar lances:** o interessado aceita as condições publicadas
   e solicita participação no leilão. A proposta inicial é aprovação manual pelo
   ADMIN. Essa aprovação não representa análise de crédito ou garantia de pagamento.

ADMIN não recebe acesso irrestrito ao acervo privado. Ele acessa apenas os dados
dos itens compartilhados para aquele evento. Mesmo quando ADMIN for proprietário,
o vínculo e a autorização do item devem ser explícitos.

## Dados do leilão

| Campo | Regra proposta |
| --- | --- |
| `id` | UUID interno |
| `code` | Código público único e imutável, gerado pelo servidor, ex.: `SEM-2026-000001` |
| `title`, `description` | Identificação e apresentação do evento |
| `starts_at`, `ends_at` | Data e hora completas; início anterior ao fim |
| `display_timezone` | Inicialmente `America/Sao_Paulo` |
| `created_by` | ADMIN organizador, obtido do JWT |
| `status` | RASCUNHO, AGENDADO, EM_ANDAMENTO, ENCERRADO ou CANCELADO |
| `terms_version` | Versão das condições aceitas pelos participantes |
| `created_at`, `updated_at` | Auditoria |

Armazenar os instantes em `timestamptz` e exibir o fuso explicitamente. A janela
é `starts_at <= horário do servidor < ends_at`: no instante do fim, já não aceita
lances. O relógio do navegador e a conclusão de um job não autorizam operações.

O código público não substitui o UUID e não concede autorização de acesso.
Sua unicidade precisa de restrição no banco, não apenas validação no formulário.

## Dados do lote

| Campo | Regra proposta |
| --- | --- |
| `id`, `auction_id` | Identificação interna e vínculo com o evento |
| `code` | Identificador único, ex.: `SEM-2026-000001-L001` |
| `catalog_item_id`, `seller_id` | Item existente e proprietário confirmado no backend |
| `status` | PROPOSTO, APROVADO, RECUSADO ou RETIRADO durante a preparação |
| `opening_bid` | Valor mínimo para o primeiro lance |
| `bid_increment` | Incremento mínimo dos lances seguintes, maior que zero |
| `item_snapshot` | Cópia dos dados do item aprovados para o leilão |
| `consented_at`, `approved_by`, `approved_at` | Autorização do vendedor e aprovação administrativa |
| `result` | Após encerramento: ARREMATADO ou SEM_LANCES, calculado pelo sistema |

No MVP, lance e resultado representam o **valor total do lote em BRL**, sem
multiplicação por parcelas. Preço de reserva oculto e parcelamento ficam para
outra etapa. Usar `NUMERIC`/`BigDecimal`, nunca ponto flutuante para dinheiro.

Exemplo: abertura de R$ 5.000 e incremento de R$ 100. O primeiro lance pode ser
R$ 5.000; depois de um lance de R$ 5.300, o próximo mínimo é R$ 5.400.

Animal inteiro: um item corresponde a um lote. Material genético: a proposta
inicial é oferecer toda a quantidade cadastrada como um único lote; o snapshot
deve informar quantidade e unidade. Fracionamento, cotas e reserva parcial de
estoque devem ser tratados separadamente no futuro.

Impedir a vinculação do mesmo item a dois lotes ativos. O item não pode ser
excluído ou alterado enquanto estiver comprometido com leilão publicado/ativo.
O snapshot preserva o que foi efetivamente ofertado mesmo após alterações futuras
no cadastro original. Autorização de oferta não transfere a propriedade do animal.

## Inscrições de compradores

Tabela `auction_registrations` com `auction_id`, `user_id`, `status`,
`terms_version`, `accepted_terms_at`, `requested_at`, `reviewed_by`, `reviewed_at`
e motivo de recusa, quando houver.

- Unicidade por `(auction_id, user_id)`.
- Estados: PENDENTE → APROVADA ou RECUSADA; antes do início também pode ser CANCELADA.
- Solicitação e aprovação ocorrem até antes do início, nesta proposta.
- Apenas APROVADA permite disputar lotes durante a janela do evento.
- O fato de ter cadastrado um animal não inscreve automaticamente o usuário.
- Recusa e cancelamento de inscrição não devem apagar o histórico.

## Publicação, horários e encerramento

1. ADMIN prepara o evento em RASCUNHO e compartilha o código com os vendedores.
2. Proprietários propõem seus itens; ADMIN aprova lotes e valores autorizados.
3. Publicar exige início futuro, fim posterior, condições definidas, concordância
   do vendedor com os valores finais e pelo menos um lote aprovado. O evento torna-se AGENDADO e abre inscrições de compradores.
4. A publicação congela os lotes, valores, datas e condições. Mudanças posteriores
   exigem fluxo explícito de cancelamento/republicação e nova aceitação, sem
   alterar silenciosamente o evento aceito pelos participantes.
5. No início, a situação efetiva passa a EM_ANDAMENTO pelo horário do servidor.
6. No fim, deixa de aceitar lances e fecha o resultado de cada lote.
7. Sem lance válido: SEM_LANCES. Com lance válido: ARREMATADO, indicando vencedor
   e valor, sem afirmar que houve pagamento ou transferência de propriedade.

Não há prorrogação automática por lance nos segundos finais nesta proposta.
Cancelamento comum só antes do início; contingências durante o evento precisam
de uma regra própria, motivo e trilha de auditoria, sem exclusão dos lances.

O fechamento deve ser idempotente e usar a mesma exclusão mútua dos lances.
Um job pode materializar estados/resultados; as regras de acesso verificam os
horários mesmo se esse job estiver atrasado. Validar o horário após adquirir os
locks, usando o instante real do servidor/banco, e não o início da transação.

## Arquitetura sugerida

`Front → controller → services (contratos) → repository (contratos) → PostgreSQL`.

- `AuctionController / AuctionService / AuctionRepository`: evento e publicação.
- `AuctionLotController / AuctionLotService / AuctionLotRepository`: autorização e lotes.
- `AuctionRegistrationController / AuctionRegistrationService / AuctionRegistrationRepository`: inscrições.
- `BidController / BidService / BidRepository`: contrato previsto para a fase de lances.

A primeira implementação pode entregar criação administrativa, seleção autorizada
de itens, publicação, catálogo de lotes e inscrições, **sem habilitar lances**.
Não apresentar um vencedor real enquanto a fase de lances não estiver implementada.

Na fase seguinte, cada lance terá UUID, lote, usuário, valor, horário de aceitação,
sequência por lote e chave de idempotência. A aceitação deve conferir inscrição,
janela, proprietário e valor em transação. Concorrência precisa ser resolvida no
banco: bloquear o lote, revalidar e gravar o lance e a liderança atomicamente.
O vencedor é o maior lance aceito pelo servidor, não o último clique no celular.

RabbitMQ/SQS fica fora do MVP inicial. Notificações e atualização de telas poderão
consumir eventos após a confirmação da transação. Se no futuro a aceitação dos
lances passar por fila, será necessário definir ordenação por lote, idempotência,
prazo de aceitação e confirmação explícita; a simples entrada na fila não é lance aceito.

## Fora desta etapa

Pagamentos, comissões, análise de crédito, contratos de venda, frete, transferência
na associação, disputa de inadimplência e integração com API de registros.
A avaliação manual de registros continua descrita em [pendencias.md](../pendencias.md); não confundir aprovação de um lote
com validação do registro genealógico.

## Decisões para confirmar antes da implementação

- Inscrição de compradores aprovada pelo ADMIN ou aprovação automática?
- Evento com vários lotes simultâneos, conforme proposto, ou apenas um por evento?
- Prazo fixo sem prorrogação, conforme proposto, ou extensão por lances no final?
- Material genético ofertado como quantidade inteira ou com fracionamento?
- Itens sem registro validado podem participar? A proposta não cria essa restrição automaticamente.

## Diagramas

- `leiloes-mvp.drawio`: editável em https://app.diagrams.net/; abrir em **Arquivo → Abrir de → Dispositivo**.
- `leiloes-mvp.svg`: visão geral para leitura rápida.

## Referências técnicas

- PostgreSQL 17 — [bloqueios de linha](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS).
- PostgreSQL 17 — [datas, horários e fuso](https://www.postgresql.org/docs/17/datatype-datetime.html).
