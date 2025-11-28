package com.marakosgrill.reservation.service.impl;

import com.marakosgrill.reservation.dto.*;
import com.marakosgrill.reservation.model.*;
import com.marakosgrill.reservation.repository.*;
import com.marakosgrill.reservation.service.NotificationService;
import com.marakosgrill.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.marakosgrill.reservation.util.constant.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {
    private final ReservationRepository reservationRepository;
    private final ReservationTableRepository reservationTableRepository;
    private final ReservationProductRepository reservationProductRepository;
    private final ReservationEventRepository reservationEventRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final TableRepository tableRepository;

    @Override
    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        log.info("🟢 ===== INICIO createReservation =====");
        log.info("📝 Request recibido: {}", request.getHolderName());
        log.info("📞 Teléfono: {}", request.getHolderPhone());
        log.info("📅 Fecha: {}", request.getReservationDate());
        
        // Validar disponibilidad de mesas/eventos
        if ("MESA".equalsIgnoreCase(request.getReservationType())) {
            for (ReservationTableRequest tableReq : request.getTables()) {
                if (!isTableAvailable(tableReq.getTableId(), request.getReservationDate(), request.getReservationTime())) {
                    throw new RuntimeException("Table not available for selected date and time");
                }
            }
        } else if ("EVENTO".equalsIgnoreCase(request.getReservationType())) {
            if (!isEventAvailable(request.getEventTypeId(), request.getReservationDate(), request.getEventShift())) {
                throw new RuntimeException("Event not available for selected date and shift");
            }
        }
        // Crear reserva principal
        Reservation reservation = Reservation.builder()
                .code(generateReservationCode(request.getReservationDate()))
                .customerId(request.getCustomerId())
                .reservationDate(request.getReservationDate())
                .reservationTime(request.getReservationTime())
                .peopleCount(request.getPeopleCount())
                .status(request.getStatus())
                .paymentMethod(request.getPaymentMethod())
                .reservationType(request.getReservationType())
                .eventType(request.getEventTypeId() != null ? EventType.builder().id(request.getEventTypeId()).build() : null)
                .eventShift("EVENTO".equalsIgnoreCase(request.getReservationType()) ? parseShift(request.getEventShift()) : null)
                .tableDistributionType(request.getTableDistributionType())
                .tableClothColor(request.getTableClothColor())
                .holderDocument(request.getHolderDocument())
                .holderPhone(request.getHolderPhone())
                .holderName(request.getHolderName())
                .holderEmail(request.getHolderEmail())
                .observation(request.getObservation())
                .employeeId(request.getEmployeeId())
                .createdBy(request.getCreatedBy())
                .createdAt(java.time.LocalDateTime.now())
                .active(true)
                .build();
        reservation = reservationRepository.save(reservation);

        // Asociar mesas
        List<ReservationTableResponse> tableResponses = null;
        if (request.getTables() != null) {
            Reservation finalReservation = reservation;
            tableResponses = request.getTables().stream().map(tableReq -> {
                ReservationTable table = ReservationTable.builder()
                        .reservation(finalReservation)
                        .tableId(tableReq.getTableId())
                        .createdBy(request.getCreatedBy())
                        .createdAt(java.time.LocalDateTime.now())
                        .active(true)
                        .build();
                table = reservationTableRepository.save(table);
                return ReservationTableResponse.builder()
                        .id(table.getId())
                        .tableId(table.getTableId())
                        .build();
            }).collect(Collectors.toList());
        }

        // Asociar productos
        List<ReservationProductResponse> productResponses = null;
        if (request.getProducts() != null) {
            Reservation finalReservation1 = reservation;
            productResponses = request.getProducts().stream().map(prodReq -> {
                ReservationProduct prod = ReservationProduct.builder()
                        .reservation(finalReservation1)
                        .productId(prodReq.getProductId())
                        .quantity(prodReq.getQuantity())
                        .subtotal(prodReq.getSubtotal())
                        .observation(prodReq.getObservation())
                        .createdBy(request.getCreatedBy())
                        .createdAt(java.time.LocalDateTime.now())
                        .active(true)
                        .build();
                prod = reservationProductRepository.save(prod);
                return ReservationProductResponse.builder()
                        .id(prod.getId())
                        .productId(prod.getProductId())
                        .quantity(prod.getQuantity())
                        .subtotal(prod.getSubtotal())
                        .observation(prod.getObservation())
                        .build();
            }).collect(Collectors.toList());
        }

        // Asociar servicios/eventos
        List<ReservationEventResponse> eventResponses = null;
        if (request.getEvents() != null) {
            Reservation finalReservation2 = reservation;
            eventResponses = request.getEvents().stream().map(eventReq -> {
                ReservationEvent event = ReservationEvent.builder()
                        .reservation(finalReservation2)
                        .serviceId(eventReq.getServiceId())
                        .quantity(eventReq.getQuantity())
                        .subtotal(eventReq.getSubtotal())
                        .observation(eventReq.getObservation())
                        .createdBy(request.getCreatedBy())
                        .createdAt(java.time.LocalDateTime.now())
                        .active(true)
                        .build();
                event = reservationEventRepository.save(event);
                return ReservationEventResponse.builder()
                        .id(event.getId())
                        .serviceId(event.getServiceId())
                        .quantity(event.getQuantity())
                        .subtotal(event.getSubtotal())
                        .observation(event.getObservation())
                        .build();
            }).collect(Collectors.toList());
        }

        // Registrar pagos
        List<PaymentResponse> paymentResponses = null;
        if (request.getPayments() != null) {
            Reservation finalReservation3 = reservation;
            paymentResponses = request.getPayments().stream().map(payReq -> {
                Transaction transaction = Transaction.builder()
                        .reservation(finalReservation3)
                        .paymentDate(payReq.getPaymentDate())
                        .paymentMethod(payReq.getPaymentMethod())
                        .amount(payReq.getAmount())
                        .status(payReq.getStatus())
                        .externalTransactionId(payReq.getExternalTransactionId())
                        .createdBy(payReq.getCreatedBy())
                        .createdAt(java.time.LocalDateTime.now())
                        .active(true)
                        .build();
                transaction = transactionRepository.save(transaction);
                return PaymentResponse.builder()
                        .id(transaction.getId())
                        .paymentDate(transaction.getPaymentDate())
                        .paymentMethod(transaction.getPaymentMethod())
                        .amount(transaction.getAmount())
                        .status(transaction.getStatus())
                        .externalTransactionId(transaction.getExternalTransactionId())
                        .createdBy(transaction.getCreatedBy())
                        .build();
            }).collect(Collectors.toList());
        }

        // Notificación al crear reserva
        log.info("📧 Creando notificación EMAIL...");
        notificationService.createNotification(
                NotificationRequest.builder()
                        .reservationId(reservation.getId())
                        .notificationType("CREATION")
                        .channel("EMAIL")
                        .message(RESERVATION_CREATED_MESSAGE + reservation.getCode())
                        .status(NOTIFICATION_STATUS_PENDING)
                        .sentDate(null)
                        .createdBy(request.getCreatedBy())
                        .build()
        );
        log.info("✅ Notificación EMAIL creada exitosamente");

        // Enviar notificación de WhatsApp
        try {
            log.info("🔔 ===== INICIANDO NOTIFICACIÓN WHATSAPP =====");
            log.info("🎫 Reserva creada: {}", reservation.getCode());
            log.info("👤 Cliente: {}", reservation.getHolderName());
            log.info("📞 Teléfono: {}", reservation.getHolderPhone());
            log.info("📅 Fecha: {}", reservation.getReservationDate());
            log.info("⏰ Hora: {}", reservation.getReservationTime());
            
            // Calcular total de la reserva
            BigDecimal totalAmount = BigDecimal.ZERO;
            if (request.getProducts() != null) {
                totalAmount = request.getProducts().stream()
                    .map(p -> p.getSubtotal() != null ? p.getSubtotal() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            if (request.getEvents() != null) {
                BigDecimal eventTotal = request.getEvents().stream()
                    .map(e -> e.getSubtotal() != null ? e.getSubtotal() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                totalAmount = totalAmount.add(eventTotal);
            }

            log.info("💰 Total calculado: {}", totalAmount);
            log.info("� NOTA: Notificación WhatsApp será enviada desde el frontend");
        } catch (Exception e) {
            // Log pero no fallar la reserva
            log.error("🔥 Error enviando notificación de WhatsApp: {}", e.getMessage(), e);
        }

        log.info("🎉 ===== FIN createReservation =====");

        // Construir respuesta
        return ReservationResponse.builder()
                .id(reservation.getId())
                .code(reservation.getCode())
                .customerId(reservation.getCustomerId())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .peopleCount(reservation.getPeopleCount())
                .status(reservation.getStatus())
                .paymentMethod(reservation.getPaymentMethod())
                .reservationType(reservation.getReservationType())
                .eventTypeId(reservation.getEventType() != null ? reservation.getEventType().getId() : null)
                .eventShift(request.getEventShift())
                .tableDistributionType(reservation.getTableDistributionType())
                .tableClothColor(reservation.getTableClothColor())
                .holderDocument(reservation.getHolderDocument())
                .holderPhone(reservation.getHolderPhone())
                .holderName(reservation.getHolderName())
                .holderEmail(reservation.getHolderEmail())
                .observation(reservation.getObservation())
                .employeeId(reservation.getEmployeeId())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .active(reservation.getActive())
                .tables(tableResponses)
                .products(productResponses)
                .events(eventResponses)
                .payments(paymentResponses)
                .build();
    }

    @Override
    public ReservationResponse getReservationById(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));
        return toResponse(reservation);
    }

    @Override
    public List<ReservationResponse> findReservationsByCustomer(Integer customerId) {
        List<Reservation> reservations = reservationRepository.findByCustomerId(customerId);
        return reservations.stream()
                .map(this::toBasicResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<ReservationResponse> findReservationsByDateAndStatus(LocalDate date, String status) {
        if ("ALL".equalsIgnoreCase(status)) {
            List<Reservation> reservations = reservationRepository.findByReservationDate(date);
            return reservations.stream()
                    .map(this::toBasicResponse)
                    .collect(java.util.stream.Collectors.toList());
        }

        List<Reservation> reservations = reservationRepository.findByReservationDateAndStatus(date, status);
        return reservations.stream()
                .map(this::toBasicResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public boolean isTableAvailable(Integer tableId, LocalDate date, LocalTime time) {
        // Verifica si la mesa está reservada en la fecha/hora
        return reservationTableRepository.findAll().stream()
                .filter(rt -> rt.getTableId().equals(tableId) && rt.getReservation().getReservationDate().equals(date)
                        && rt.getReservation().getReservationTime().equals(time) && Boolean.TRUE.equals(rt.getActive()))
                .findAny().isEmpty();
    }

    @Override
    public boolean isEventAvailable(Integer eventTypeId, LocalDate date, String shift) {
        // Verifica si ya existe un evento de ese tipo en la fecha/turno
        return reservationRepository.findAll().stream()
                .filter(r -> "EVENTO".equalsIgnoreCase(r.getReservationType()) && r.getEventType() != null
                        && r.getEventType().getId().equals(eventTypeId)
                        && r.getReservationDate().equals(date)
                        && shift.equalsIgnoreCase(r.getEventShift().toString())
                        && Boolean.TRUE.equals(r.getActive()))
                .findAny().isEmpty();
    }

    @Override
    public List<ScheduleAvailabilityResponse> getScheduleAvailability(LocalDate date) {
        // Definir horarios fijos
        String[][] schedules = {
            {"08:00:00", "Mañana"}, {"09:00:00", "Mañana"}, {"10:00:00", "Mañana"}, {"11:00:00", "Mañana"}, {"12:00:00", "Mañana"},
            {"13:00:00", "Tarde"}, {"14:00:00", "Tarde"}, {"15:00:00", "Tarde"}, {"16:00:00", "Tarde"}, {"17:00:00", "Tarde"}, {"18:00:00", "Tarde"},
            {"19:00:00", "Noche"}, {"20:00:00", "Noche"}, {"21:00:00", "Noche"}, {"22:00:00", "Noche"}, {"23:00:00", "Noche"}
        };

        // Obtener mesas activas desde la base de datos
        List<TableEntity> activeTables = tableRepository.findByActiveTrue();

        // Consulta optimizada de mesas reservadas
        List<ReservationTable> reservationTables = reservationTableRepository.findByReservation_ReservationDateAndActiveTrueAndReservation_StatusNot(
                date, RESERVATION_STATUS_CANCELED);

        List<ScheduleAvailabilityResponse> result = new java.util.ArrayList<>();
        for (String[] schedule : schedules) {
            String time = schedule[0];
            String shift = schedule[1];
            List<TableAvailabilityResponse> tables = new java.util.ArrayList<>();
            int reservedtables = 0;
            for (TableEntity table : activeTables) {
                int tableId = table.getId();
                String tableName = table.getCode();

                boolean isReserved = reservationTables.stream().anyMatch(rt ->
                        rt.getTableId() == tableId &&
                        rt.getReservation().getReservationTime().equals(java.time.LocalTime.parse(time))
                );
                if (isReserved) reservedtables++;
                tables.add(new TableAvailabilityResponse(tableId, tableName, !isReserved));
            }
            boolean scheduleAvailable = reservedtables < activeTables.size();
            result.add(new ScheduleAvailabilityResponse(time, shift, scheduleAvailable, tables));
        }
        return result;
    }

    // Método para mapear solo los datos básicos de la reserva
    private ReservationResponse toBasicResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .code(reservation.getCode())
                .customerId(reservation.getCustomerId())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .peopleCount(reservation.getPeopleCount())
                .status(reservation.getStatus())
                .reservationType(reservation.getReservationType())
                .holderName(reservation.getHolderName())
                .holderPhone(reservation.getHolderPhone())
                .createdAt(reservation.getCreatedAt())
                .active(reservation.getActive())
                .build();
    }

    private ReservationResponse toResponse(Reservation reservation) {
        List<ReservationTableResponse> tables = reservationTableRepository.findByReservation_Id(reservation.getId()).stream()
                .map(rt -> ReservationTableResponse.builder()
                        .id(rt.getId())
                        .tableId(rt.getTableId())
                        .build())
                .collect(java.util.stream.Collectors.toList());
        List<ReservationProductResponse> products = reservationProductRepository.findByReservation_Id(reservation.getId()).stream()
                .map(rp -> ReservationProductResponse.builder()
                        .id(rp.getId())
                        .productId(rp.getProductId())
                        .quantity(rp.getQuantity())
                        .subtotal(rp.getSubtotal())
                        .observation(rp.getObservation())
                        .build())
                .collect(java.util.stream.Collectors.toList());
        List<ReservationEventResponse> events = reservationEventRepository.findByReservation_Id(reservation.getId()).stream()
                .map(re -> ReservationEventResponse.builder()
                        .id(re.getId())
                        .serviceId(re.getServiceId())
                        .quantity(re.getQuantity())
                        .subtotal(re.getSubtotal())
                        .observation(re.getObservation())
                        .build())
                .collect(java.util.stream.Collectors.toList());
        List<PaymentResponse> payments = transactionRepository.findByReservation_Id(reservation.getId()).stream()
                .map(t -> PaymentResponse.builder()
                        .id(t.getId())
                        .paymentDate(t.getPaymentDate())
                        .paymentMethod(t.getPaymentMethod())
                        .amount(t.getAmount())
                        .status(t.getStatus())
                        .externalTransactionId(t.getExternalTransactionId())
                        .createdBy(t.getCreatedBy())
                        .build())
                .collect(java.util.stream.Collectors.toList());
        return ReservationResponse.builder()
                .id(reservation.getId())
                .code(reservation.getCode())
                .customerId(reservation.getCustomerId())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .peopleCount(reservation.getPeopleCount())
                .status(reservation.getStatus())
                .paymentMethod(reservation.getPaymentMethod())
                .reservationType(reservation.getReservationType())
                .eventTypeId(reservation.getEventType() != null ? reservation.getEventType().getId() : null)
                .eventShift(String.valueOf(reservation.getEventShift()))
                .tableDistributionType(reservation.getTableDistributionType())
                .tableClothColor(reservation.getTableClothColor())
                .holderDocument(reservation.getHolderDocument())
                .holderPhone(reservation.getHolderPhone())
                .holderName(reservation.getHolderName())
                .holderEmail(reservation.getHolderEmail())
                .observation(reservation.getObservation())
                .employeeId(reservation.getEmployeeId())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .active(reservation.getActive())
                .tables(tables)
                .products(products)
                .events(events)
                .payments(payments)
                .build();
    }

    @Override
    @Transactional
    public ReservationResponse updateReservation(Integer id, ReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (!Boolean.TRUE.equals(reservation.getActive())) {
            throw new RuntimeException("Reservation is not active");
        }
        // Validar disponibilidad si se modifican fecha/hora/mesas
        if ("MESA".equalsIgnoreCase(request.getReservationType())) {
            for (ReservationTableRequest tableReq : request.getTables()) {
                if (!isTableAvailable(tableReq.getTableId(), request.getReservationDate(), request.getReservationTime())) {
                    throw new RuntimeException("Table not available for selected date and time");
                }
            }
        } else if ("EVENTO".equalsIgnoreCase(request.getReservationType())) {
            if (!isEventAvailable(request.getEventTypeId(), request.getReservationDate(), request.getEventShift())) {
                throw new RuntimeException("Event not available for selected date and shift");
            }
        }
        // Actualizar datos principales
        reservation.setCustomerId(request.getCustomerId());
        reservation.setReservationDate(request.getReservationDate());
        reservation.setReservationTime(request.getReservationTime());
        reservation.setPeopleCount(request.getPeopleCount());
        reservation.setPaymentMethod(request.getPaymentMethod());
        reservation.setReservationType(request.getReservationType());
        reservation.setEventType(request.getEventTypeId() != null ? EventType.builder().id(request.getEventTypeId()).build() : null);
        reservation.setEventShift("EVENTO".equalsIgnoreCase(request.getReservationType()) ? parseShift(request.getEventShift()) : null);
        reservation.setTableDistributionType(request.getTableDistributionType());
        reservation.setTableClothColor(request.getTableClothColor());
        reservation.setHolderDocument(request.getHolderDocument());
        reservation.setHolderPhone(request.getHolderPhone());
        reservation.setHolderName(request.getHolderName());
        reservation.setHolderEmail(request.getHolderEmail());
        reservation.setObservation(request.getObservation());
        reservation.setEmployeeId(request.getEmployeeId());
        reservation.setUpdatedBy(request.getCreatedBy());
        reservation.setUpdatedAt(java.time.LocalDateTime.now());
        reservationRepository.save(reservation);

        // Actualizar mesas asociadas
        reservationTableRepository.findAll().stream()
            .filter(rt -> rt.getReservation().getId().equals(id))
            .forEach(rt -> { rt.setActive(false); reservationTableRepository.save(rt); });
        List<ReservationTableResponse> tableResponses = null;
        if (request.getTables() != null) {
            tableResponses = request.getTables().stream().map(tableReq -> {
                ReservationTable table = ReservationTable.builder()
                        .reservation(reservation)
                        .tableId(tableReq.getTableId())
                        .createdBy(request.getCreatedBy())
                        .createdAt(java.time.LocalDateTime.now())
                        .active(true)
                        .build();
                table = reservationTableRepository.save(table);
                return ReservationTableResponse.builder()
                        .id(table.getId())
                        .tableId(table.getTableId())
                        .build();
            }).collect(java.util.stream.Collectors.toList());
        }

        // Actualizar productos asociados
        reservationProductRepository.findAll().stream()
            .filter(rp -> rp.getReservation().getId().equals(id))
            .forEach(rp -> { rp.setActive(false); reservationProductRepository.save(rp); });
        List<ReservationProductResponse> productResponses = null;
        if (request.getProducts() != null) {
            productResponses = request.getProducts().stream().map(prodReq -> {
                ReservationProduct prod = ReservationProduct.builder()
                        .reservation(reservation)
                        .productId(prodReq.getProductId())
                        .quantity(prodReq.getQuantity())
                        .subtotal(prodReq.getSubtotal())
                        .observation(prodReq.getObservation())
                        .createdBy(request.getCreatedBy())
                        .createdAt(java.time.LocalDateTime.now())
                        .active(true)
                        .build();
                prod = reservationProductRepository.save(prod);
                return ReservationProductResponse.builder()
                        .id(prod.getId())
                        .productId(prod.getProductId())
                        .quantity(prod.getQuantity())
                        .subtotal(prod.getSubtotal())
                        .observation(prod.getObservation())
                        .build();
            }).collect(java.util.stream.Collectors.toList());
        }

        // Actualizar servicios/eventos asociados
        reservationEventRepository.findAll().stream()
            .filter(re -> re.getReservation().getId().equals(id))
            .forEach(re -> { re.setActive(false); reservationEventRepository.save(re); });
        List<ReservationEventResponse> eventResponses = null;
        if (request.getEvents() != null) {
            eventResponses = request.getEvents().stream().map(eventReq -> {
                ReservationEvent event = ReservationEvent.builder()
                        .reservation(reservation)
                        .serviceId(eventReq.getServiceId())
                        .quantity(eventReq.getQuantity())
                        .subtotal(eventReq.getSubtotal())
                        .observation(eventReq.getObservation())
                        .createdBy(request.getCreatedBy())
                        .createdAt(java.time.LocalDateTime.now())
                        .active(true)
                        .build();
                event = reservationEventRepository.save(event);
                return ReservationEventResponse.builder()
                        .id(event.getId())
                        .serviceId(event.getServiceId())
                        .quantity(event.getQuantity())
                        .subtotal(event.getSubtotal())
                        .observation(event.getObservation())
                        .build();
            }).collect(java.util.stream.Collectors.toList());
        }

        // Actualizar pagos asociados
        transactionRepository.findAll().stream()
            .filter(t -> t.getReservation().getId().equals(id))
            .forEach(t -> { t.setActive(false); transactionRepository.save(t); });
        List<PaymentResponse> paymentResponses = null;
        if (request.getPayments() != null) {
            paymentResponses = request.getPayments().stream().map(payReq -> {
                Transaction transaction = Transaction.builder()
                        .reservation(reservation)
                        .paymentDate(payReq.getPaymentDate())
                        .paymentMethod(payReq.getPaymentMethod())
                        .amount(payReq.getAmount())
                        .status(payReq.getStatus())
                        .externalTransactionId(payReq.getExternalTransactionId())
                        .createdBy(payReq.getCreatedBy())
                        .createdAt(java.time.LocalDateTime.now())
                        .active(true)
                        .build();
                transaction = transactionRepository.save(transaction);
                return PaymentResponse.builder()
                        .id(transaction.getId())
                        .paymentDate(transaction.getPaymentDate())
                        .paymentMethod(transaction.getPaymentMethod())
                        .amount(transaction.getAmount())
                        .status(transaction.getStatus())
                        .externalTransactionId(transaction.getExternalTransactionId())
                        .createdBy(transaction.getCreatedBy())
                        .build();
            }).collect(java.util.stream.Collectors.toList());
        }

        // Registrar notificación de modificación
        notificationService.createNotification(
            NotificationRequest.builder()
                .reservationId(reservation.getId())
                .notificationType("UPDATE")
                .channel("EMAIL")
                .message(RESERVATION_UPDATED_MESSAGE + reservation.getCode())
                .status(NOTIFICATION_STATUS_PENDING)
                .sentDate(null)
                .createdBy(request.getCreatedBy())
                .build()
        );

        // Construir respuesta
        return ReservationResponse.builder()
                .id(reservation.getId())
                .code(reservation.getCode())
                .customerId(reservation.getCustomerId())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .peopleCount(reservation.getPeopleCount())
                .status(reservation.getStatus())
                .paymentMethod(reservation.getPaymentMethod())
                .reservationType(reservation.getReservationType())
                .eventTypeId(reservation.getEventType() != null ? reservation.getEventType().getId() : null)
                .eventShift(request.getEventShift())
                .tableDistributionType(reservation.getTableDistributionType())
                .tableClothColor(reservation.getTableClothColor())
                .holderDocument(reservation.getHolderDocument())
                .holderPhone(reservation.getHolderPhone())
                .holderName(reservation.getHolderName())
                .holderEmail(reservation.getHolderEmail())
                .observation(reservation.getObservation())
                .employeeId(reservation.getEmployeeId())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .active(reservation.getActive())
                .tables(tableResponses)
                .products(productResponses)
                .events(eventResponses)
                .payments(paymentResponses)
                .build();
    }

    @Override
    @Transactional
    public ReservationResponse cancelReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        if (RESERVATION_STATUS_CANCELED.equalsIgnoreCase(reservation.getStatus())) {
            throw new RuntimeException("La reserva ya está cancelada");
        }
        reservation.setStatus(RESERVATION_STATUS_CANCELED);
        reservation.setCancellationDate(java.time.LocalDateTime.now());
        reservation = reservationRepository.save(reservation);

        // Registrar notificación de cancelación
        registerReservationNotification(reservation, "CANCELLATION", RESERVATION_CANCELLED_MESSAGE + reservation.getCode());

        // Nota: Notificación de cancelación por WhatsApp será enviada desde el frontend
        log.info("📱 NOTA: Notificación de cancelación WhatsApp será enviada desde el frontend para reserva: {}", reservation.getCode());
        
        return toResponse(reservation);
    }

    @Override
    @Transactional
    public ReservationResponse checkinReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (RESERVATION_STATUS_CHECK_IN.equalsIgnoreCase(reservation.getStatus())) {
            throw new RuntimeException("La reserva ya está en CHECK-IN");
        }
        reservation.setStatus(RESERVATION_STATUS_CHECK_IN);
        reservation.setUpdatedAt(java.time.LocalDateTime.now());
        reservationRepository.save(reservation);
        registerReservationNotification(reservation, RESERVATION_STATUS_CHECK_IN, RESERVATION_CHECK_IN_MESSAGE + reservation.getCode());
        return toResponse(reservation);
    }

    @Override
    @Transactional
    public ReservationResponse checkoutReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (RESERVATION_STATUS_CHECK_OUT.equalsIgnoreCase(reservation.getStatus())) {
            throw new RuntimeException("La reserva ya está en CHECK-OUT");
        }
        reservation.setStatus(RESERVATION_STATUS_CHECK_OUT);
        reservation.setUpdatedAt(java.time.LocalDateTime.now());
        reservationRepository.save(reservation);
        registerReservationNotification(reservation, RESERVATION_STATUS_CHECK_OUT, RESERVATION_CHECK_OUT_MESSAGE + reservation.getCode());
        return toResponse(reservation);
    }

    @Override
    @Transactional
    public ReservationResponse paidReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        reservation.setStatus(RESERVATION_STATUS_PAID);
        reservation.setUpdatedAt(java.time.LocalDateTime.now());
        reservationRepository.save(reservation);
        registerReservationNotification(reservation, RESERVATION_STATUS_PAID, RESERVATION_PAID_MESSAGE + reservation.getCode());
        return toResponse(reservation);
    }

    private void registerReservationNotification(Reservation reservation, String status, String message) {
        notificationService.createNotification(
                NotificationRequest.builder()
                        .reservationId(reservation.getId())
                        .notificationType(status)
                        .channel("EMAIL")
                        .message(message)
                        .status(NOTIFICATION_STATUS_PENDING)
                        .sentDate(null)
                        .createdBy(DEFAULT_CREATED_BY_USER_ID)
                        .build()
        );
    }

    private String generateReservationCode(LocalDate reservationDate) {
        String datePart = reservationDate.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "RES-" + datePart + "-";
        // Buscar el máximo correlativo para la fecha
        int maxCorrelative = reservationRepository.findAll().stream()
            .filter(r -> r.getCode() != null && r.getCode().startsWith(prefix))
            .mapToInt(r -> {
                String[] parts = r.getCode().split("-");
                if (parts.length == 3) {
                    try {
                        return Integer.parseInt(parts[2]);
                    } catch (NumberFormatException e) {
                        return 0;
                    }
                }
                return 0;
            })
            .max()
            .orElse(0);
        int newCorrelative = maxCorrelative + 1;
        return prefix + String.format("%03d", newCorrelative);
    }

    private Integer parseShift(String shift) {
        if (shift == null) return null;
        switch (shift.toLowerCase()) {
            case "mañana": return 1;
            case "tarde": return 2;
            case "noche": return 3;
            default: return null;
        }
    }
}
