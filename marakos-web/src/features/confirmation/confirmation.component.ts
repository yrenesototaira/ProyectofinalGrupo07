import { ChangeDetectionStrategy, Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private bookingService = inject(BookingService);

  reservation = signal<Reservation | undefined>(undefined);
  qrCodeUrl = signal<string | null>(null);

  // Fix: Removed menuTotal which incorrectly referenced the active booking state.
  // The total should be retrieved from the reservation object itself.

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Fix: Call getReservationById to fetch the confirmed reservation from the service's list.
      this.reservation.set(this.bookingService.getReservationById(id));
    }
  }

  ngAfterViewInit() {
    this.waitForQRCodeAndGenerate();
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
