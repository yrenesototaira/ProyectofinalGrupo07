import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { Reservation } from '../../../core/models/restaurant.model';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-admin-reservations',
  imports: [CommonModule, RouterLink, FormsModule, ConfirmationModalComponent],
  templateUrl: './admin-reservations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReservationsComponent {
  private bookingService = inject(BookingService);
  
  // State
  isCancelModalOpen = signal(false);
  reservationToCancelId = signal<string | null>(null);
  
  // Filters
  filterDate = signal('');
  filterStatus = signal<'all' | Reservation['status']>('all');

  // Data
  private allReservations = this.bookingService.allReservations;
  
  filteredReservations = computed(() => {
    let reservations = this.allReservations();
    if (this.filterDate()) {
      reservations = reservations.filter(r => r.date === this.filterDate());
    }
    if (this.filterStatus() !== 'all') {
      reservations = reservations.filter(r => r.status === this.filterStatus());
    }
    return reservations;
  });

  requestCancellation(id: string) {
    this.reservationToCancelId.set(id);
    this.isCancelModalOpen.set(true);
  }

  confirmCancellation() {
    if (this.reservationToCancelId()) {
      this.bookingService.cancelReservation(this.reservationToCancelId()!);
    }
    this.closeCancelModal();
  }

  closeCancelModal() {
    this.isCancelModalOpen.set(false);
    this.reservationToCancelId.set(null);
  }

  getStatusBadgeClass(status: Reservation['status']): string {
    const baseClasses = 'font-bold px-3 py-1 text-xs rounded-full';
    switch (status) {
      case 'Pendiente':
        return `${baseClasses} bg-sky-400/20 text-sky-300`;
      case 'Confirmado':
        return `${baseClasses} bg-slate-600 text-slate-200`;
      case 'Cancelado':
        return `${baseClasses} bg-rose-400/20 text-rose-300`;
      default:
        return baseClasses;
    }
  }
}
