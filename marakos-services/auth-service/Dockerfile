# Dockerfile para auth-service

# ---------- Stage 1: Build ----------
FROM gradle:8.12.1-jdk17 AS build
WORKDIR /workspace

# Copiar archivos de configuración para cachear dependencias
COPY build.gradle settings.gradle gradlew gradlew.bat ./
COPY gradle gradle

# Pre-resolver dependencias (mejor cache)
RUN ./gradlew --version && ./gradlew dependencies || true

# Copiar el código fuente
COPY src src

# Construir el JAR de Spring Boot
RUN ./gradlew clean bootJar --no-daemon

# ---------- Stage 2: Runtime ----------
FROM eclipse-temurin:17-jre-alpine AS runtime

# Seguridad: usuario no root
RUN addgroup -S app && adduser -S app -G app
USER app

WORKDIR /app

# Copiar el JAR construido
COPY --from=build /workspace/build/libs/*.jar app.jar

# Variables (Render puede inyectar PORT)
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75"
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080

EXPOSE 8080

# Run
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
