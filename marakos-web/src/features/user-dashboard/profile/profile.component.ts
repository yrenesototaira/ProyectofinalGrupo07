import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  
  // Form models
  name = signal('');
  email = signal('');
  bankName = signal('');
  accountNumber = signal('');
  cci = signal('');
  
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  // Feedback messages
  detailsMessage = signal<{type: 'success' | 'error', text: string} | null>(null);
  passwordMessage = signal<{type: 'success' | 'error', text: string} | null>(null);
  bankMessage = signal<{type: 'success' | 'error', text: string} | null>(null);

  ngOnInit() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.name.set(currentUser.name);
      this.email.set(currentUser.email);
      this.bankName.set(currentUser.bankName ?? '');
      this.accountNumber.set(currentUser.accountNumber ?? '');
      this.cci.set(currentUser.cci ?? '');
    }
  }

  updateDetails() {
    this.detailsMessage.set(null);
    const success = this.authService.updateUserProfile({ name: this.name() });
    if (success) {
      this.detailsMessage.set({ type: 'success', text: '¡Tus datos han sido actualizados con éxito!' });
    } else {
      this.detailsMessage.set({ type: 'error', text: 'No se pudieron actualizar tus datos.' });
    }
    setTimeout(() => this.detailsMessage.set(null), 3000);
  }

  updatePassword() {
    this.passwordMessage.set(null);
    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordMessage.set({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }
    if (!this.newPassword() || !this.currentPassword()) {
        this.passwordMessage.set({ type: 'error', text: 'Por favor, rellena todos los campos.' });
        return;
    }
    
    // Mock password change logic
    console.log('Changing password...');
    this.passwordMessage.set({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    setTimeout(() => this.passwordMessage.set(null), 3000);
  }

  updateBankInfo() {
    this.bankMessage.set(null);
    const success = this.authService.updateUserProfile({ 
      bankName: this.bankName(),
      accountNumber: this.accountNumber(),
      cci: this.cci()
    });
     if (success) {
      this.bankMessage.set({ type: 'success', text: '¡Información bancaria actualizada!' });
    } else {
      this.bankMessage.set({ type: 'error', text: 'No se pudo actualizar la información.' });
    }
    setTimeout(() => this.bankMessage.set(null), 3000);
  }
}
