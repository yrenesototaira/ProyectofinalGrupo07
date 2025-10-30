import { ChangeDetectionStrategy, Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// Fix: Corrected import paths
import { BookingService } from '../../core/services/booking.service';
import { Reservation } from '../../core/models/restaurant.model';

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

  reservation = signal<any | undefined>(undefined);
  qrCodeUrl = signal<string | null>(null);
  isLoading = signal<boolean>(true);
  
  // Payment status signals
  paymentFailed = signal<boolean>(false);
  paymentSuccess = signal<boolean>(false);
  paymentError = signal<string | null>(null);
  reservationCreated = signal<boolean>(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    // Get query parameters for payment status
    const queryParams = this.route.snapshot.queryParams;
    this.paymentFailed.set(queryParams['paymentFailed'] === 'true');
    this.paymentSuccess.set(queryParams['paymentSuccess'] === 'true');
    this.paymentError.set(queryParams['paymentError'] || null);
    this.reservationCreated.set(queryParams['reservationCreated'] === 'true');
    
    console.log('Confirmation Component - Query params:', queryParams);
    console.log('Payment failed:', this.paymentFailed());
    console.log('Reservation created:', this.reservationCreated());
    
    if (id) {
      this.bookingService.getReservationById(id).subscribe({
        next: (data) => {
          console.log('Reservation data loaded:', data);
          this.reservation.set(data);
          this.isLoading.set(false);
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
    this.waitForQRCodeAndGenerate();
  }

  retryPayment() {
    // TODO: Implementar lógica para reintentar el pago
    // Podría redirigir a una página de pago específica o mostrar un modal de pago
    console.log('Retry payment for reservation:', this.reservation()?.id);
    // Por ahora, simplemente refrescar la página o redirigir al booking
    // this.router.navigate(['/payment-retry'], { queryParams: { reservationId: this.reservation()?.id } });
  }

  private waitForQRCodeAndGenerate(): void {
    const qrCodeGenerator = (window as any).QRCode;
    if (typeof qrCodeGenerator !== 'undefined') {
      this.generateQRCode();
    } else {
      setTimeout(() => this.waitForQRCodeAndGenerate(), 100);
    }
  }

  private generateQRCode(): void {
    const reservationData = this.reservation();
    if (reservationData && reservationData.id) {
      const qrCodeGenerator = (window as any).QRCode;
      qrCodeGenerator.toDataURL(JSON.stringify({ reservationId: reservationData.id }), { width: 200 }, (err: any, url: string) => {
        if (err) {
          console.error('Failed to generate QR code', err);
          return;
        }
        this.qrCodeUrl.set(url);
      });
    } else {
      console.error('Reservation data not available to generate QR code.');
    }
  }
}
