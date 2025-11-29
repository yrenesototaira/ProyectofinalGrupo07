# Dockerfile for customer-service

# ---------- Stage 1: Build ----------
FROM gradle:8.12.1-jdk17-alpine AS build
WORKDIR /workspace

# Copy configuration files to cache dependencies
COPY build.gradle settings.gradle gradlew gradlew.bat ./
COPY gradle gradle

# Ensure permissions and convert line endings if necessary
RUN chmod +x ./gradlew

# Copy source code
COPY src src

# Building the Spring Boot JAR
RUN ./gradlew clean bootJar --no-daemon

# ---------- Stage 2: Runtime ----------
FROM eclipse-temurin:17-jre-alpine AS runtime

# Security: non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

WORKDIR /app

# Copy the built JAR
COPY --from=build /workspace/build/libs/*.jar app.jar

EXPOSE 8080

# Run
ENTRYPOINT ["java", "-jar", "app.jar"]
