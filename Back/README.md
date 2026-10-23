# Semearas — Back

Projeto Java 21 com Spring Boot 4.1.1, Maven e Spring Web MVC.
Base vazia, sem endpoints, banco de dados ou regras de negócio.

## Requisitos

- JDK 21 ou superior
- Maven 3.9 ou superior

## Compilar e executar

```sh
mvn spring-boot:run
```

O servidor inicia em `http://localhost:8080`. Como não há endpoints definidos,
acessar a raiz retorna HTTP 404.

Para gerar e executar o JAR:

```sh
mvn package
java -jar target/semearas-back-0.1.0-SNAPSHOT.jar
```
