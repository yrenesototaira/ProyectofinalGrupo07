import { ChangeDetectionStrategy, Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('Modal Title');
  closeModal = output<void>();

  onClose() {
    this.closeModal.emit();
  }
}
