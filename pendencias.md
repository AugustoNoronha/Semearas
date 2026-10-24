# Pendências do SEMEARAS

## Validação manual de registros de animais

**Status:** pendente de implementação.

Para o MVP, permitir que um usuário ADMIN confira manualmente o registro informado,
consultando a associação responsável e os documentos disponíveis. A validação
automática fica condicionada à disponibilidade de uma integração oficial autorizada.
Não foi localizada uma API pública documentada da ABCCMM na pesquisa inicial;
confirmar diretamente com a associação a possibilidade de integração.

### Informações necessárias

- Associação emissora do registro e número informado.
- Livro ou categoria do registro, quando aplicável.
- Resultado da conferência e justificativa, especialmente em caso de divergência.
- Fonte ou referência utilizada como evidência.
- Data da avaliação e identificação do ADMIN responsável.
- Histórico das avaliações, preservado para auditoria.

### Etiquetas exibidas aos usuários

| Situação | Etiqueta |
| --- | --- |
| Número não preenchido | Registro não informado |
| Responsável declara que o animal não possui registro | Sem registro — declarado pelo responsável |
| Registro preenchido e ainda não conferido | Aguardando validação |
| Conferência confirma o registro e a correspondência com o animal | Registro validado |
| Conferência identifica inconsistências | Dados divergentes |

### Regras da avaliação

- Campo vazio não comprova ausência de registro; usar a etiqueta “Registro não informado”.
- Oferecer uma opção explícita para o responsável declarar que o animal não possui registro.
- Exigir a identificação da associação ao informar um número de registro.
- Conferir a correspondência com o animal: nome, sexo, nascimento e demais dados
  relevantes disponíveis na fonte oficial. Encontrar apenas um número existente não basta.
- Apenas ADMIN pode concluir a avaliação. O proprietário não pode atribuir o selo
  “Registro validado” ao próprio cadastro.
- Identificar o selo como uma conferência realizada pelo SEMEARAS, sem sugerir
  certificação ou endosso da associação. A validação do registro não comprova,
  isoladamente, que o usuário seja o proprietário legal do animal.
- Alterações no número, associação ou dados usados na conferência devem invalidar
  a avaliação anterior e devolver o cadastro à análise, preservando o histórico.
- Indisponibilidade da consulta ou falta de evidência mantém a análise pendente;
  não deve ser interpretada como registro inválido.
- Para material genético, distinguir o registro do animal de origem da documentação
  do próprio material. A conferência de um não valida automaticamente o outro.

### Referências para a futura implementação

- [Sistema oficial da ABCCMM](https://sistema.abccmm.org.br/)
- [Manual do sistema de registro da ABCCMM](https://sistema.abccmm.org.br/Arquivos/manual_sistema/Manual_SRG_Associado.pdf)
- [Consulta de animais da ABQM](https://consulta.abqm.com.br/)
