import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { Reservation } from '../../../core/models/restaurant.model';
import { ReceiptModalComponent } from '../../../shared/components/receipt-modal/receipt-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-admin-payments',
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, ReceiptModalComponent, ConfirmationModalComponent],
  templateUrl: './admin-payments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPaymentsComponent {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  isReceiptModalOpen = signal(false);
  selectedReservation = signal<Reservation | null>(null);

  isRefundModalOpen = signal(false);
  reservationToRefund = signal<Reservation | null>(null);

  filterDate = signal('');
  
  private allReservations = this.bookingService.allReservations;
  private allUsers = this.authService.getAllUsers();
  
  paidReservations = computed(() => {
    let reservations = this.allReservations().filter(r => r.totalCost > 0 && r.paymentMethod);
    if (this.filterDate()) {
      reservations = reservations.filter(r => r.date === this.filterDate());
    }
    return reservations;
  });

  getUserName(userId: string | null): string {
    if (!userId) return 'N/A';
    return this.allUsers().find(u => u.id === userId)?.name ?? 'Usuario Desconocido';
  }

  viewReceipt(reservation: Reservation) {
    this.selectedReservation.set(reservation);
    this.isReceiptModalOpen.set(true);
  }

  closeReceiptModal() {
    this.isReceiptModalOpen.set(false);
    this.selectedReservation.set(null);
  }

  requestRefund(reservation: Reservation) {
    this.reservationToRefund.set(reservation);
    this.isRefundModalOpen.set(true);
  }

  confirmRefund() {
    const res = this.reservationToRefund();
    if (res && res.id) {
      this.bookingService.processRefund(res.id);
    }
    this.closeRefundModal();
  }

  closeRefundModal() {
    this.isRefundModalOpen.set(false);
    this.reservationToRefund.set(null);
  }
}