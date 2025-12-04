import { ChangeDetectionStrategy, Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// Fix: Corrected import paths
import { BookingService } from '../../core/services/booking.service';
import { Reservation } from '../../core/models/restaurant.model';
import { PdfService } from '../../core/services/pdf.service';
import { MenuService } from '../../core/services/menu.service';
import { EventTypeService } from '../../core/services/event-type.service';
import { AdditionalServicesService } from '../../core/services/additional-services.service';
import { TABLE_DISTRIBUTIONS, LINEN_COLORS, EVENT_SHIFTS } from '../../config/event-config';

@Component({
  selector: 'app-confirmation',
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './confirmation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private pdfService = inject(PdfService);
  private menuService = inject(MenuService);
  private eventTypeService = inject(EventTypeService);
  private additionalServicesService = inject(AdditionalServicesService);

  reservation = signal<any | undefined>(undefined);
  qrCodeUrl = signal<string | null>(null);
  isLoading = signal<boolean>(true);
  
  // Payment status signals
  paymentFailed = signal<boolean>(false);
  paymentSuccess = signal<boolean>(false);
  paymentError = signal<string | null>(null);
  reservationCreated = signal<boolean>(false);
  paymentPending = signal<boolean>(false);
  
  // Presential payment signals
  isPresentialPayment = signal<boolean>(false);
  paymentAmount = signal<number>(0);
  
  // Event payment signals
  isEventAdelanto = signal<boolean>(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    // Get query parameters for payment status
    const queryParams = this.route.snapshot.queryParams;
    this.paymentFailed.set(queryParams['paymentFailed'] === 'true');
    this.paymentSuccess.set(queryParams['paymentSuccess'] === 'true');
    this.paymentError.set(queryParams['paymentError'] || null);
    this.reservationCreated.set(queryParams['reservationCreated'] === 'true');
    this.paymentPending.set(queryParams['paymentPending'] === 'true');
    
    // Handle presential payment - check both paymentType and paymentStatus
    this.isPresentialPayment.set(
      queryParams['paymentType'] === 'presencial' || 
      queryParams['paymentStatus'] === 'PENDIENTE_PRESENCIAL'
    );
    this.paymentAmount.set(parseFloat(queryParams['amount']) || 0);
    
    // Handle event adelanto payment
    this.isEventAdelanto.set(queryParams['isEventAdelanto'] === 'true');
    
    // Cargar tipos de eventos y servicios adicionales
    this.eventTypeService.getEventTypes().subscribe();
    this.additionalServicesService.loadServices();
    
    if (id) {
      this.isLoading.set(true);
      this.bookingService.getReservationById(id).subscribe({
        next: (data) => {
          console.log('Reserva cargada:', data);
          this.reservation.set(data);
          this.isLoading.set(false);
          // Generar QR después de cargar los datos - intentar varias veces si es necesario
          this.tryGenerateQR(0);
        },
        error: (error) => {
          console.error('Error loading reservation:', error);
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  ngAfterViewInit() {
    // No hacer nada aquí, el QR se genera después de cargar los datos
  }

  retryPayment() {
    // TODO: Implementar lógica para reintentar el pago
    // Podría redirigir a una página de pago específica o mostrar un modal de pago
    // Por ahora, simplemente refrescar la página o redirigir al booking
    // this.router.navigate(['/payment-retry'], { queryParams: { reservationId: this.reservation()?.id } });
  }

  private tryGenerateQR(attempt: number): void {
    console.log('Generando QR con API externa (no requiere librería)');
    this.generateQRCode();
  }

  private generateQRCode(): void {
    const reservationData = this.reservation();
    console.log('Intentando generar QR con datos:', reservationData);
    
    if (reservationData && (reservationData.id || reservationData.code)) {
      const qrData = {
        reservationId: reservationData.id,
        code: reservationData.code,
        customerName: reservationData.holderName,
        date: reservationData.reservationDate,
        time: reservationData.reservationTime
      };
      
      console.log('Generando QR con datos:', qrData);
      
      // Usar API de QR Code de Google Charts (alternativa sin librería)
      const qrContent = encodeURIComponent(JSON.stringify(qrData));
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrContent}`;
      
      console.log('QR generado exitosamente con API externa');
      this.qrCodeUrl.set(qrUrl);
    } else {
      console.error('Reservation data not available to generate QR code. Data:', reservationData);
    }
  }

  /**
   * Descarga el PDF con los detalles de la reserva
   */
  async downloadReservationPDF(): Promise<void> {
    const reservationData = this.reservation();
    
    if (!reservationData) {
      console.error('No hay datos de reserva disponibles para generar PDF');
      return;
    }

    try {
      // Determinar el estado del pago
      const isPresential = this.isPresentialPayment() || 
                          reservationData.payments?.[0]?.paymentMethod === 'Presencial' ||
                          reservationData.paymentMethod === 'Presencial';
      
      // Para eventos con adelanto, usar el estado real (PAGADO_PARCIAL)
      // Para otros casos, usar la lógica anterior
      let paymentStatus = isPresential ? 'PENDIENTE' : (reservationData.payments?.[0]?.status || 'PAGADO');
      
      // Si es evento y el estado de la reserva es PAGADO_PARCIAL, usarlo
      if (reservationData.reservationType === 'EVENTO' && reservationData.status === 'PAGADO_PARCIAL') {
        paymentStatus = 'PAGADO_PARCIAL';
      }
      
      // Preparar items de la orden obteniendo nombres y precios del MenuService
      const menuItems = this.menuService.getMenuItems()();
      const orderItems = reservationData.products?.map((p: any) => {
        const product = menuItems.find(m => m.id === p.productId);
        return {
          productName: product?.name || `Producto #${p.productId}`,
          quantity: p.quantity || 1,
          unitPrice: product?.price || (p.subtotal / p.quantity) || 0,
          subtotal: p.subtotal || 0
        };
      }) || [];

      // Preparar servicios adicionales para eventos
      const allServices = this.additionalServicesService.getServices()();
      const additionalServices = reservationData.events?.map((e: any) => {
        const service = allServices.find(s => s.id === e.serviceId);
        return {
          serviceName: service?.name || `Servicio #${e.serviceId}`,
          quantity: e.quantity || 1,
          unitPrice: e.unitPrice || (e.subtotal / e.quantity) || 0,
          subtotal: e.subtotal || 0
        };
      }) || [];

      // Obtener nombres descriptivos para eventos
      const eventTypeName = this.getEventTypeName(reservationData.eventTypeId);
      const eventShiftName = this.getShiftName(reservationData.eventShift);
      const tableDistributionName = this.getTableDistributionName(reservationData.tableDistributionType);
      const linenColorName = this.getLinenColorName(reservationData.tableClothColor);

      await this.pdfService.generateReservationPDF({
        id: reservationData.id,
        code: reservationData.code,
        holderName: reservationData.holderName,
        holderEmail: reservationData.holderEmail,
        holderPhone: reservationData.holderPhone,
        reservationDate: reservationData.reservationDate,
        reservationTime: reservationData.reservationTime,
        peopleCount: reservationData.peopleCount,
        tableId: reservationData.tables?.[0]?.tableId,
        observation: reservationData.observation,
        reservationType: reservationData.reservationType,
        paymentMethod: isPresential ? 'Presencial' : (reservationData.payments?.[0]?.paymentMethod || 'Digital'),
        paymentStatus: paymentStatus,
        totalAmount: this.paymentAmount() || reservationData.payments?.[0]?.amount || 0,
        qrCodeUrl: this.qrCodeUrl() || undefined,
        isEventAdelanto: this.isEventAdelanto(),
        orderItems: orderItems.length > 0 ? orderItems : undefined,
        // Información específica de eventos
        eventType: eventTypeName,
        eventShift: eventShiftName,
        tableDistribution: tableDistributionName,
        linenColor: linenColorName,
        additionalServices: additionalServices.length > 0 ? additionalServices : undefined
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intenta nuevamente.');
    }
  }

  /**
   * Obtiene el nombre del turno desde event-config
   * @param shiftId ID del turno ('1' = Mañana, '2' = Tarde, '3' = Noche)
   * @returns Nombre del turno con su horario y precio
   */
  getShiftName(shiftId: string | undefined): string {
    if (!shiftId) return 'No especificado';
    
    const shift = EVENT_SHIFTS.find(s => s.id === shiftId);
    return shift ? `${shift.name} (${shift.timeRange}) S/ ${shift.price}` : 'No especificado';
  }

  /**
   * Obtiene el nombre del tipo de evento desde la base de datos
   */
  getEventTypeName(eventTypeId: number | undefined): string {
    if (!eventTypeId) return '';
    
    const eventTypes = this.eventTypeService.getEventTypesSignal()();
    const eventType = eventTypes.find(et => et.idTipoEvento === eventTypeId);
    
    return eventType?.nombre || 'Evento Especial';
  }

  /**
   * Obtiene el nombre de la distribución de mesa desde event-config con precio
   */
  getTableDistributionName(distributionId: number | undefined): string {
    if (!distributionId) return '';
    
    const distribution = TABLE_DISTRIBUTIONS.find(d => d.id === distributionId.toString());
    if (!distribution) return '';
    
    return `${distribution.name} S/ 0`;
  }

  /**
   * Obtiene el nombre del color de mantelería desde event-config con precio
   */
  getLinenColorName(colorId: number | undefined): string {
    if (!colorId) return '';
    
    const linenColor = LINEN_COLORS.find(c => c.id === colorId.toString());
    if (!linenColor) return '';
    
    return `${linenColor.name} S/ ${linenColor.price}`;
  }

  /**
   * Calcula el subtotal sin IGV de la reserva
   * Los precios vienen SIN IGV, por lo que getTotalAmount / 1.18 nos da el subtotal base
   */
  getSubtotalSinIGV(): number {
    const total = this.getTotalAmount();
    return total / 1.18; // Extraer el subtotal del total que ya incluye IGV
  }

  /**
   * Calcula el IGV (18%) de la reserva
   */
  getIGVAmount(): number {
    const subtotal = this.getSubtotalSinIGV();
    return subtotal * 0.18; // IGV = 18% del subtotal
  }

  /**
   * Calcula el importe total de la reserva (incluye IGV)
   * Para eventos con adelanto (50%), devuelve el doble del monto pagado
   * Para otros casos, devuelve el monto de la reserva
   */
  getTotalAmount(): number {
    const reservationData = this.reservation();
    
    // Si es un evento con adelanto (pago parcial 50%)
    if (this.isEventAdelanto() && reservationData?.payments?.[0]?.amount) {
      return reservationData.payments[0].amount * 2;
    }
    
    // Si hay un monto de pago registrado
    if (reservationData?.payments?.[0]?.amount) {
      return reservationData.payments[0].amount;
    }
    
    // Si hay un paymentAmount del query params
    if (this.paymentAmount() > 0) {
      // Si es evento con adelanto, multiplicar por 2
      if (this.isEventAdelanto()) {
        return this.paymentAmount() * 2;
      }
      return this.paymentAmount();
    }
    
    return 0;
  }

  /**
   * Calcula el adelanto a pagar (50% para eventos)
   * Para eventos presenciales, retorna el monto del adelanto
   */
  getAdelantoAmount(): number {
    // Si hay un monto en paymentAmount (viene de query params con el 50% ya calculado)
    if (this.paymentAmount() > 0) {
      return this.paymentAmount();
    }
    
    // Si no hay paymentAmount, calcular 50% del total de la reserva
    const reservationData = this.reservation();
    if (reservationData?.reservationType === 'EVENTO' && this.isPresentialPayment()) {
      const total = this.getTotalAmount();
      return total * 0.5;
    }
    
    return 0;
  }

  /**
   * Verifica si la reserva es de tipo evento
   */
  isEventReservation(): boolean {
    return this.reservation()?.reservationType === 'EVENTO';
  }
}


