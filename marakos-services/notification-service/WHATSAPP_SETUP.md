# Configuración del Servicio de Notificaciones WhatsApp

## Descripción
El servicio de notificaciones permite enviar mensajes de WhatsApp automáticamente cuando se crean, modifican o cancelan reservas en el sistema Marakos Grill.

## Arquitectura Implementada

### Microservicios
1. **notification-service** (Puerto 8084): Manejo de notificaciones WhatsApp
2. **reservation-service** (Puerto 8083): Integrado con notificaciones automáticas

### Flujo de Notificaciones
1. Usuario confirma reserva → reservation-service
2. reservation-service → llama a notification-service
3. notification-service → envía mensaje via WhatsApp Business API
4. Cliente recibe notificación en WhatsApp

## Configuración Requerida

### 1. Meta WhatsApp Business API

#### Pasos para Configurar:
1. **Crear cuenta Meta for Developers**
   - Ir a https://developers.facebook.com/
   - Crear una aplicación de tipo "Business"

2. **Configurar WhatsApp Business API**
   - Agregar producto "WhatsApp" a la aplicación
   - Verificar número de teléfono de negocio
   - Obtener las credenciales necesarias

3. **Obtener Credenciales**
   - **Phone Number ID**: ID del número de teléfono verificado
   - **Access Token**: Token temporal o permanente de acceso
   - **Webhook Verify Token**: Token para verificar webhooks

### 2. Actualizar application.properties

Editar: `notification-service/src/main/resources/application.properties`

```properties
# WhatsApp Business API Configuration
whatsapp.api.base-url=https://graph.facebook.com/v22.0
whatsapp.api.phone-number-id=TU_PHONE_NUMBER_ID_AQUI
whatsapp.api.access-token=TU_ACCESS_TOKEN_AQUI
whatsapp.api.webhook-verify-token=TU_WEBHOOK_TOKEN_AQUI
```

### 3. Configurar Base de Datos

El servicio usa la misma base de datos PostgreSQL. Verificar conexión:

```properties
spring.datasource.url=jdbc:postgresql://marakosbd.cx4a2amsay8c.us-east-2.rds.amazonaws.com:5432/db_marakos_grill
spring.datasource.username=usrDbMarakos
spring.datasource.password=Marakos2025
```

## Estructura de Archivos Creados

```
notification-service/
├── src/main/java/com/marakosgrill/notification/
│   ├── NotificationServiceApplication.java          # Aplicación principal
│   ├── controller/
│   │   └── NotificationController.java              # API endpoints
│   ├── service/
│   │   ├── NotificationService.java                 # Lógica de negocio
│   │   ├── WhatsAppService.java                     # Integración WhatsApp API
│   │   └── ReservationNotificationData.java        # DTO de datos
│   └── config/
│       ├── WhatsAppConfig.java                      # Configuración WhatsApp
│       └── CorsConfig.java                          # Configuración CORS
├── src/main/resources/
│   └── application.properties                       # Configuración
├── build.gradle                                     # Dependencias Gradle
├── settings.gradle                                  # Configuración Gradle
├── gradlew                                         # Gradle Wrapper
├── gradlew.bat                                     # Gradle Wrapper (Windows)
└── gradle/                                         # Gradle Wrapper files

reservation-service/
└── src/main/java/com/marakosgrill/reservation/
    └── service/
        └── WhatsAppNotificationService.java        # Cliente para notificaciones
```

## Endpoints Disponibles

### Notification Service (Puerto 8084)

#### 1. Enviar Confirmación de Reserva
```http
POST /api/notification/reservation/confirmed
Content-Type: application/json

{
  "customerName": "Juan Pérez",
  "customerPhone": "+51-987-654-321",
  "reservationCode": "RES-20250115-001",
  "reservationDate": "2025-01-20",
  "reservationTime": "19:00",
  "peopleCount": 4,
  "paymentType": "ONLINE",
  "totalAmount": 125.50,
  "tableNumber": "MESA-03",
  "location": "Salón Principal"
}
```

#### 2. Enviar Notificación de Cancelación
```http
POST /api/notification/reservation/cancelled
```

#### 3. Enviar Recordatorio
```http
POST /api/notification/reservation/reminder
```

#### 4. Health Check
```http
GET /api/notification/health
```

## Formatos de Mensaje

### Confirmación de Reserva
```
🎉 ¡Reserva Confirmada! - Marakos Grill

¡Hola [NOMBRE]! Tu reserva ha sido confirmada exitosamente.

📋 Detalles de tu reserva:
• Código: [CÓDIGO]
• Fecha: [FECHA]
• Hora: [HORA]
• Personas: [CANTIDAD]
• Mesa: [MESA]
• Ubicación: [UBICACIÓN]
• Tipo de pago: [PAGO]
• Total: $[MONTO]

📞 Contacto: +51-987-654-321
📍 Ciudad de Panamá, Panamá
🌐 https://marakosgrill.com

¡Te esperamos! 🍽️
```

### Recordatorio
```
⏰ Recordatorio de Reserva - Marakos Grill

¡Hola [NOMBRE]! Te recordamos tu reserva para mañana.

📋 Tu reserva:
• Código: [CÓDIGO]
• Fecha: [FECHA]
• Hora: [HORA]
• Personas: [CANTIDAD]

Si necesitas modificar o cancelar, contáctanos.
📞 +51-987-654-321

¡Te esperamos! 🍽️
```

### Cancelación
```
❌ Reserva Cancelada - Marakos Grill

¡Hola [NOMBRE]! Tu reserva ha sido cancelada.

📋 Reserva cancelada:
• Código: [CÓDIGO]
• Fecha: [FECHA]
• Hora: [HORA]

Para nueva reserva, visita:
🌐 https://marakosgrill.com
📞 +51-987-654-321

¡Gracias por elegir Marakos Grill! 🍽️
```

## Pasos para Ejecutar

1. **Iniciar notification-service**
   ```bash
   cd notification-service
   ./gradlew bootRun
   ```

2. **Iniciar reservation-service**
   ```bash
   cd reservation-service
   ./gradlew bootRun
   ```

3. **Verificar servicios**
   - Notification: http://localhost:8084/api/notification/health
   - Reservation: http://localhost:8083/api/reservations

## Integración Automática

El sistema está configurado para enviar notificaciones automáticamente:

- ✅ **Al crear reserva**: Notificación de confirmación
- ✅ **Al cancelar reserva**: Notificación de cancelación
- 🔄 **Recordatorios**: Programables para envío automático

## Logs y Monitoreo

Los logs incluyen información detallada:
```
2025-01-15 19:30:15 INFO  - Enviando notificación de WhatsApp para reserva: RES-20250115-001
2025-01-15 19:30:16 INFO  - Notificación de WhatsApp enviada exitosamente para reserva: RES-20250115-001
```

## Manejo de Errores

- Las notificaciones fallan sin afectar el proceso de reserva
- Logs detallados para debugging
- Circuit breaker para alta disponibilidad
- Reintentos automáticos configurados

## Seguridad

- Tokens de acceso seguros
- Validación de números de teléfono
- CORS configurado para dominios autorizados
- Headers de autenticación en API calls

## Notas Importantes

1. **Número de Prueba**: Meta proporciona números de prueba limitados
2. **Verificación**: Números de destino deben estar verificados en desarrollo
3. **Límites**: API tiene límites de mensajes por día en modo sandbox
4. **Producción**: Requiere verificación de negocio para uso completo

Para soporte técnico o dudas sobre la configuración, contactar al equipo de desarrollo.