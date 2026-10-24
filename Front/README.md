# Semearas — Front

Aplicativo SEMEARAS em React Native, Expo e TypeScript.

## Telas

- `/`: login com e-mail e senha.
- `/cadastro`: cadastro com nome, e-mail, CPF e senha.
- `/conta`: dados do usuário autenticado e logout.
- `/meus-cadastros`: acervo privado, com busca, filtro por categoria e paginação.
- `/cadastros/novo`: cadastro de animal ou material genético.
- `/cadastros/[id]`: consulta e edição de um cadastro próprio.

Após o login, o usuário entra em **Meus cadastros**. Animais têm nome, espécie,
raça, registro, sexo, nascimento, localização e descrição. Para material genético,
o formulário oferece tipo (sêmen, embrião, oócito, cobertura ou outro), animal de
origem e quantidade, além dos dados comuns. Apenas nome, espécie e os campos
específicos indicados com asterisco são obrigatórios.

É possível criar, editar e excluir com confirmação. A exclusão é lógica no banco.
Todos os registros pertencem ao usuário autenticado e só aparecem para ele.
O cadastro não publica anúncios e ainda não inclui fotos, negociação ou pagamentos.

As telas usam Expo Router e se adaptam a celular e desktop. Incluem máscara e
validação dos dígitos do CPF, validação de e-mail, campos obrigatórios e opção
de mostrar a senha. O cadastro exige senha com pelo menos 8 caracteres.

A autenticação está integrada ao Spring Boot: cadastro e login recebem o JWT,
a tela de conta consulta `/api/auth/me` e o botão de sair chama `/api/auth/logout`.
Há estados de carregamento, bloqueio de envio repetido e tratamento de erros.

O JWT é guardado no SecureStore em Android/iOS e no `sessionStorage` da aba no
navegador. Apenas o token e a data de expiração são persistidos; senhas e dados
cadastrais não são armazenados. Se o dispositivo bloquear o armazenamento, a
sessão continua apenas em memória. A sessão é validada com a API ao reabrir o
aplicativo/recarregar a página. Expiração e respostas 401 levam de volta ao login.
Não há refresh token: após os 15 minutos de validade é necessário entrar novamente.
O logout revoga todos os tokens do usuário no backend. Se a API não puder confirmar
o logout, a tela informa o erro e permite tentar novamente.

## Conexão com o backend

Inicie primeiro o backend:

```sh
cd ../Back
docker compose up -d
```

Sem configuração adicional, a web usa o hostname atual na porta 8080, o simulador
iOS usa `http://localhost:8080` e o emulador Android usa `http://10.0.2.2:8080`.
Para configurar outro servidor, crie `Front/.env.local`:

```dotenv
EXPO_PUBLIC_API_URL=https://api.seu-dominio.com
```

Recarregue o aplicativo após alterar a variável. Ela é pública: não coloque
senhas, tokens ou `JWT_SECRET` nas variáveis `EXPO_PUBLIC_`.

Para celular físico, use o IP local do computador, por exemplo
`EXPO_PUBLIC_API_URL=http://192.168.1.10:8080`, com ambos na mesma rede. A API
fica restrita ao computador por padrão; para permitir o acesso pela rede local,
adicione `API_BIND_HOST=0.0.0.0` ao `Back/.env` e execute `docker compose up -d api`
na pasta `Back`. Apenas a API precisa desse acesso; o PostgreSQL continua local.

O backend permite as origens web locais nas portas 8081 e 8082. Se o front usar
outra origem, adicione-a ao `CORS_ORIGINS` do `Back/.env` e atualize o container da API.

## Verificações

```sh
npm run lint
npm run typecheck
```

## Executar

Com Node.js LTS e npm instalados:

```sh
npm install
npm start
```

Para abrir no navegador:

```sh
npm run web
```

Para Android ou iOS, use o Expo Go compatível no dispositivo ou um emulador/simulador configurado. O simulador de iOS exige macOS e Xcode.

```sh
npm run android
npm run ios
```
