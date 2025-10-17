import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('Confirmar Acción');
  message = input<string>('¿Estás seguro de que deseas continuar?');
  confirmButtonText = input<string>('Confirmar');
  cancelButtonText = input<string>('Cancelar');

  confirm = output<void>();
  close = output<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onClose() {
    this.close.emit();
  }
}
