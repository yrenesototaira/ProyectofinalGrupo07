import { ChangeDetectionStrategy, Component, output, input } from '@angular/core';

@Component({
  selector: 'app-modal',
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
