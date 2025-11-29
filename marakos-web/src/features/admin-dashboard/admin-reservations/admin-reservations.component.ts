import { ChangeDetectionStrategy, Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { Reservation } from '../../../core/models/restaurant.model';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { PdfService } from '../../../core/services/pdf.service';
import { MenuService } from '../../../core/services/menu.service';

@Component({
  selector: 'app-admin-reservations',
  imports: [CommonModule, RouterLink, FormsModule, ConfirmationModalComponent],
  templateUrl: './admin-reservations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReservationsComponent {
  private bookingService = inject(BookingService);
  private pdfService = inject(PdfService);
  private menuService = inject(MenuService);
  
  // State
  isCancelModalOpen = signal(false);
  reservationToCancelId = signal<string | null>(null);

  isCheckinModalOpen = signal(false);
  reservationToCheckinId = signal<string | null>(null);

  isCheckoutModalOpen = signal(false);
  reservationToCheckoutId = signal<string | null>(null);
  
  // Filters
  filterDate = signal(new Date().toISOString().split('T')[0]); // Default to today
  filterStatus = signal<'ALL' | 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'PENDIENTE_PAGO' | 'PAGADO' | 'CHECKED_IN' | 'CHECKED_OUT'>('ALL');

  // Data
  private reservations = signal<Reservation[]>([]);
  filteredReservations = this.reservations.asReadonly();
  
  constructor() {
    effect(() => {
      this.loadReservations();
    });
  }

  loadReservations() {
    const date = this.filterDate();
    const status = this.filterStatus();
    
    if (date) {
      this.bookingService.getReservationsForCurrentAdmin(date, status).subscribe({
        next: (data) => {
          this.reservations.set(data as Reservation[]);
        },
        error: (err) => {
          console.error('Error fetching reservations:', err);
          this.reservations.set([]);
        }
      });
    }
  }

  requestCancellation(id: string) {
    this.reservationToCancelId.set(id);
    this.isCancelModalOpen.set(true);
  }

  confirmCancellation() {
    const reservationId = this.reservationToCancelId();
    if (reservationId) {
      this.bookingService.cancelReservation(reservationId).subscribe({
        next: () => this.loadReservations(),
        error: (err) => console.error('Error canceling reservation:', err)
      });
    }
    this.closeCancelModal();
  }

  closeCancelModal() {
    this.isCancelModalOpen.set(false);
    this.reservationToCancelId.set(null);
  }

  requestCheckin(id: string) {
    this.reservationToCheckinId.set(id);
    this.isCheckinModalOpen.set(true);
  }

  confirmCheckin() {
    const reservationId = this.reservationToCheckinId();
    if (reservationId) {
      this.bookingService.checkinReservation(reservationId).subscribe({
        next: () => this.loadReservations(),
        error: (err) => console.error('Error checking in reservation:', err)
      });
    }
    this.closeCheckinModal();
  }

  closeCheckinModal() {
    this.isCheckinModalOpen.set(false);
    this.reservationToCheckinId.set(null);
  }

  requestCheckout(id: string) {
    this.reservationToCheckoutId.set(id);
    this.isCheckoutModalOpen.set(true);
  }

  confirmCheckout() {
    const reservationId = this.reservationToCheckoutId();
    if (reservationId) {
      this.bookingService.checkoutReservation(reservationId).subscribe({
        next: () => this.loadReservations(),
        error: (err) => console.error('Error checking out reservation:', err)
      });
    }
    this.closeCheckoutModal();
  }

  closeCheckoutModal() {
    this.isCheckoutModalOpen.set(false);
    this.reservationToCheckoutId.set(null);
  }

  getStatusBadgeClass(status: Reservation['status']): string {
    const baseClasses = 'font-bold px-3 py-1 text-xs rounded-full';
    switch (status) {
      case 'PENDIENTE':
        return `${baseClasses} bg-sky-400/20 text-sky-300`;
      case 'CONFIRMADO':
        return `${baseClasses} bg-slate-600 text-slate-200`;
      case 'CANCELADO':
        return `${baseClasses} bg-rose-400/20 text-rose-300`;
      case 'PENDIENTE_PAGO':
        return `${baseClasses} bg-yellow-400/20 text-yellow-300`;
      case 'PAGADO':
        return `${baseClasses} bg-green-400/20 text-green-300`;
      case 'CHECKED_IN':
        return `${baseClasses} bg-green-400/20 text-green-300`;
      case 'CHECKED_OUT':
        return `${baseClasses} bg-blue-400/20 text-blue-300`;
      default:
        return baseClasses;
    }
  }

  /**
   * Descarga el PDF de una reserva específica
   */
  async downloadReservationPDF(reservationId: string): Promise<void> {
    try {
      // Obtener los detalles completos de la reserva
      this.bookingService.getReservationById(reservationId).subscribe({
        next: async (reservation) => {
          // Generar QR Code URL
          const qrData = {
            reservationId: reservation.id,
            code: reservation.code,
            customerName: reservation.holderName,
            date: reservation.reservationDate,
            time: reservation.reservationTime
          };
          const qrContent = encodeURIComponent(JSON.stringify(qrData));
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrContent}`;

          // Determinar estado del pago
          const isPresential = reservation.paymentMethod === 'Presencial' || 
                              reservation.payments?.[0]?.paymentMethod === 'Presencial';
          const paymentStatus = isPresential ? 'PENDIENTE' : (reservation.payments?.[0]?.status || 'PAGADO');

          // Preparar items de la orden obteniendo nombres y precios del MenuService
          const menuItems = this.menuService.getMenuItems()();
          const orderItems = reservation.products?.map((p: any) => {
            const product = menuItems.find(m => m.id === p.productId);
            return {
              productName: product?.name || `Producto #${p.productId}`,
              quantity: p.quantity || 1,
              unitPrice: product?.price || (p.subtotal / p.quantity) || 0,
              subtotal: p.subtotal || 0
            };
          }) || [];

          // Generar PDF
          await this.pdfService.generateReservationPDF({
            id: reservation.id,
            code: reservation.code,
            holderName: reservation.holderName,
            holderEmail: reservation.holderEmail,
            holderPhone: reservation.holderPhone,
            reservationDate: reservation.reservationDate,
            reservationTime: reservation.reservationTime,
            peopleCount: reservation.peopleCount,
            tableId: reservation.tables?.[0]?.tableId,
            observation: reservation.observation,
            paymentMethod: reservation.payments?.[0]?.paymentMethod || reservation.paymentMethod,
            paymentStatus: paymentStatus,
            totalAmount: reservation.payments?.[0]?.amount || 0,
            qrCodeUrl: qrUrl,
            orderItems: orderItems.length > 0 ? orderItems : undefined
          });
        },
        error: (error) => {
          console.error('Error obteniendo detalles de reserva:', error);
          alert('No se pudo obtener la información de la reserva para generar el PDF.');
        }
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intenta nuevamente.');
    }
  }
}
