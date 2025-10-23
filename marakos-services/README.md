# 🏪 Marakos Grill - Microservicios Backend

## 📋 Descripción

Sistema de microservicios para el restaurante Marakos Grill desarrollado con Spring Boot 3.5.6 y Java 17.

## 🏗️ Arquitectura

```
marakos-services/
├── auth-service/        # Autenticación y autorización (Puerto 8081)
├── customer-service/    # Gestión de clientes (Puerto 8082)
├── management-service/  # Gestión administrativa (Puerto 8083)
├── reservation-service/ # Sistema de reservas (Puerto 8084)
├── compile-all.ps1     # Script de compilación
├── run-all.ps1         # Script de ejecución
└── README.md           # Esta documentación
```

## 🛠️ Tecnologías

- **Java**: 17 (Eclipse Adoptium)
- **Spring Boot**: 3.5.6
- **Gradle**: 8.14.3
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT
- **Documentación API**: OpenAPI/Swagger

## 🚀 Inicio Rápido

### Prerrequisitos

1. **Java 17**: Eclipse Adoptium JDK 17
2. **PostgreSQL**: Base de datos configurada
3. **PowerShell**: Para ejecutar scripts de automatización

### Compilación

```powershell
# Compilar todos los servicios
.\compile-all.ps1

# O compilar individualmente
cd auth-service
.\gradlew.bat compileJava --no-daemon
```

### Ejecución

```powershell
# Compilar y ejecutar todos los servicios
.\run-all.ps1 -Build

# Solo ejecutar (sin compilar)
.\run-all.ps1

# Detener todos los servicios
.\run-all.ps1 -Stop
```

## 🌐 Endpoints de Servicios

| Servicio | Puerto | Base URL | Descripción |
|----------|--------|----------|-------------|
| Auth Service | 8081 | `http://localhost:8081` | Autenticación JWT |
| Customer Service | 8082 | `http://localhost:8082` | Gestión de clientes |
| Management Service | 8083 | `http://localhost:8083` | Panel administrativo |
| Reservation Service | 8084 | `http://localhost:8084` | Sistema de reservas |

## 📝 Configuración

### Variables de Entorno

Cada servicio puede configurarse mediante `application.properties` o variables de entorno:

```properties
# Base de datos
spring.datasource.url=jdbc:postgresql://localhost:5432/marakos_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT
jwt.secret=your_jwt_secret
jwt.expiration=86400000
```

### Perfiles de Entorno

```powershell
# Desarrollo
.\gradlew.bat bootRun --args='--spring.profiles.active=dev'

# Producción
.\gradlew.bat bootRun --args='--spring.profiles.active=prod'
```

## 🧪 Testing

```powershell
# Ejecutar tests de todos los servicios
.\gradlew.bat test

# Tests con cobertura
.\gradlew.bat test jacocoTestReport
```

## 📊 Monitoreo

### Health Checks

- Auth Service: `http://localhost:8081/actuator/health`
- Customer Service: `http://localhost:8082/actuator/health`
- Management Service: `http://localhost:8083/actuator/health`
- Reservation Service: `http://localhost:8084/actuator/health`

### Métricas

- Métricas: `http://localhost:8081/actuator/metrics`
- Info: `http://localhost:8081/actuator/info`

## 🐛 Solución de Problemas

### Error de Puerto Ocupado

```powershell
# Verificar puertos en uso
netstat -ano | findstr :8081

# Liberar puerto específico
taskkill /PID <PID> /F
```

### Error de Java Version

```powershell
# Verificar versión de Java
java -version

# Configurar JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
```

### Error de Base de Datos

1. Verificar que PostgreSQL esté ejecutándose
2. Validar credenciales en `application.properties`
3. Crear base de datos si no existe:

```sql
CREATE DATABASE marakos_db;
```

## 📚 Documentación API

Una vez iniciados los servicios, la documentación está disponible en:

- Auth Service: `http://localhost:8081/swagger-ui.html`
- Customer Service: `http://localhost:8082/swagger-ui.html`
- Management Service: `http://localhost:8083/swagger-ui.html`
- Reservation Service: `http://localhost:8084/swagger-ui.html`

## 🤝 Desarrollo

### Estructura de Proyecto

```
service-name/
├── src/main/java/
│   ├── config/         # Configuraciones
│   ├── controller/     # Controladores REST
│   ├── dto/           # Data Transfer Objects
│   ├── entity/        # Entidades JPA
│   ├── repository/    # Repositorios
│   ├── service/       # Lógica de negocio
│   └── util/          # Utilidades
├── src/main/resources/
│   └── application.properties
└── build.gradle
```

### Convenciones

- **Rutas API**: `/api/v1/`
- **Autenticación**: Bearer Token JWT
- **Formato de fecha**: ISO 8601
- **Códigos de estado**: Estándar HTTP

## 📦 Deploy

### Construcción para Producción

```powershell
# Generar JAR ejecutable
.\gradlew.bat bootJar

# Los archivos JAR estarán en:
# service-name/build/libs/service-name-1.0.0.jar
```

### Docker (Opcional)

```dockerfile
FROM openjdk:17-jre-slim
COPY build/libs/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 📞 Contacto

- **Proyecto**: Marakos Grill Restaurant System
- **Equipo**: Grupo 07 - Sistema Integrador I
- **Universidad**: UTP

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024