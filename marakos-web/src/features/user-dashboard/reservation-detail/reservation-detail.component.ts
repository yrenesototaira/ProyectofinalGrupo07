import { ChangeDetectionStrategy, Component, inject, signal, OnInit, AfterViewInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe} from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Reservation } from '../../../core/models/restaurant.model';

@Component({
  selector: 'app-reservation-detail',
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './reservation-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationDetailComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  reservation = signal<any | undefined>(undefined);
  qrCodeUrl = signal<string | null>(null);
  isLoading = signal<boolean>(true);

  totalCost = computed(() => {
    const products = this.reservation()?.products || [];
    return products.reduce((acc: number, curr: any) => acc + curr.subtotal, 0);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading.set(true);
      this.bookingService.getReservationById(id).subscribe({
        next: (data) => {
          this.reservation.set(data);
          this.isLoading.set(false);
          // Generar QR después de cargar los datos
          setTimeout(() => this.generateQRCode(), 100);
        },
        error: (err) => {
          console.error('Error al cargar reserva:', err);
          this.isLoading.set(false);
        }
      });
    }
  }
  
  ngAfterViewInit() {
    // No hacer nada aquí, el QR se genera después de cargar los datos
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
      
      // Usar API externa de QR Code (no requiere librería)
      const qrContent = encodeURIComponent(JSON.stringify(qrData));
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrContent}`;
      
      console.log('QR generado exitosamente con API externa');
      this.qrCodeUrl.set(qrUrl);
    } else {
      console.error('Reservation data not available to generate QR code. Data:', reservationData);
    }
  }
}
