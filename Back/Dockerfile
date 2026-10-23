FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B verify

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S semearas && adduser -S semearas -G semearas
COPY --from=build --chown=semearas:semearas /app/target/semearas-back-0.1.0-SNAPSHOT.jar app.jar
USER semearas
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
