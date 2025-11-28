# Dockerfile para auth-service
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY ../gradlew .
COPY ../gradle ./gradle
COPY . .
RUN chmod +x gradlew
RUN ./gradlew build --no-daemon
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
