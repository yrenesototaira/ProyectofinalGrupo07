import { ChangeDetectionStrategy, Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// Fix: Corrected import paths
import { BookingService } from '../../core/services/booking.service';
import { Reservation } from '../../core/models/restaurant.model';
import { PdfService } from '../../core/services/pdf.service';
import { MenuService } from '../../core/services/menu.service';

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

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    // Get query parameters for payment status
    const queryParams = this.route.snapshot.queryParams;
    this.paymentFailed.set(queryParams['paymentFailed'] === 'true');
    this.paymentSuccess.set(queryParams['paymentSuccess'] === 'true');
    this.paymentError.set(queryParams['paymentError'] || null);
    this.reservationCreated.set(queryParams['reservationCreated'] === 'true');
    this.paymentPending.set(queryParams['paymentPending'] === 'true');
    
    // Handle presential payment
    this.isPresentialPayment.set(queryParams['paymentType'] === 'presencial');
    this.paymentAmount.set(parseFloat(queryParams['amount']) || 0);
    
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
      
      const paymentStatus = isPresential ? 'PENDIENTE' : (reservationData.payments?.[0]?.status || 'PAGADO');
      
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
        paymentMethod: isPresential ? 'Presencial' : (reservationData.payments?.[0]?.paymentMethod || 'Digital'),
        paymentStatus: paymentStatus,
        totalAmount: this.paymentAmount() || reservationData.payments?.[0]?.amount || 0,
        qrCodeUrl: this.qrCodeUrl() || undefined,
        orderItems: orderItems.length > 0 ? orderItems : undefined
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intenta nuevamente.');
    }
  }
}
