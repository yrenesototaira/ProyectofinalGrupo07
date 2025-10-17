import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Reservation } from '../../../core/models/restaurant.model';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-my-reservations',
  imports: [CommonModule, RouterLink, ConfirmationModalComponent],
  templateUrl: './my-reservations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyReservationsComponent {
  private bookingService = inject(BookingService);
  reservations = this.bookingService.reservationsForCurrentUser;

  isCancelModalOpen = signal(false);
  reservationToCancelId = signal<string | null>(null);

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

  getReservationContainerClass(status: Reservation['status']): string {
    const baseClasses = 'border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4';
    switch (status) {
      case 'Confirmada':
        return `${baseClasses} bg-sky-500/10 border-sky-500/20`;
      case 'Completada':
        return `${baseClasses} bg-slate-700/50 border-slate-700 text-slate-400`;
      case 'Cancelada':
        return `${baseClasses} bg-rose-500/10 border-rose-500/20 text-slate-400`;
      default:
        return baseClasses;
    }
  }

  getStatusBadgeClass(status: Reservation['status']): string {
    const baseClasses = 'font-bold px-3 py-1 text-sm rounded-full';
    switch (status) {
      case 'Confirmada':
        return `${baseClasses} bg-sky-400/20 text-sky-300`;
      case 'Completada':
        return `${baseClasses} bg-slate-600 text-slate-200`;
      case 'Cancelada':
        return `${baseClasses} bg-rose-400/20 text-rose-300`;
      default:
        return baseClasses;
    }
  }
}
