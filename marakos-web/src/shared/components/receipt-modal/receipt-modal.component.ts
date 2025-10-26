import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Reservation } from '../../../core/models/restaurant.model';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-receipt-modal',
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './receipt-modal.component.html',
  styleUrls: ['./receipt-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptModalComponent {
  private authService = inject(AuthService);
  
  isOpen = input.required<boolean>();
  reservation = input<Reservation | null>();
  closeModal = output<void>();

  onClose() {
    this.closeModal.emit();
  }

  getCustomerName(): string {
    const res = this.reservation();
    if (!res || !res.userId) return 'Cliente';
    return this.authService.getUserById(res.userId)?.name ?? 'Cliente';
  }

  printReceipt() {
    window.print();
  }
}