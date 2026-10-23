# Semearas — Front

Aplicativo SEMEARAS em React Native, Expo e TypeScript.

## Telas

- `/`: login com e-mail e senha.
- `/cadastro`: cadastro com nome, e-mail, CPF e senha.

As telas usam Expo Router e se adaptam a celular e desktop. Incluem máscara e
validação dos dígitos do CPF, validação de e-mail, campos obrigatórios e opção
de mostrar a senha. O cadastro exige senha com pelo menos 8 caracteres.

A autenticação ainda não está integrada ao backend. O envio valida o formulário
e informa essa indisponibilidade, sem criar contas, autenticar ou persistir dados.

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
