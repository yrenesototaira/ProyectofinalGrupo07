import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  
  // Personal Information
  firstName = signal('');
  lastName = signal('');
  phone = signal('');
  photo = signal('');
  birthDate = signal('');
  identityDocument = signal('');

  // Refund Information
  financialEntity = signal('');
  refundAccount = signal('');

  // Change Password
  newPassword = signal('');
  confirmPassword = signal('');

  // Feedback messages
  detailsMessage = signal<{type: 'success' | 'error', text: string} | null>(null);
  passwordMessage = signal<{type: 'success' | 'error', text: string} | null>(null);

  ngOnInit() {
    this.loadCustomerData();
  }

  loadCustomerData() {
    const currentUser = this.authService.currentUser();
    if (currentUser && currentUser.idPersona) {
      this.customerService.getCustomer(currentUser.idPersona).subscribe({
        next: (data) => {
          this.firstName.set(data.firstName);
          this.lastName.set(data.lastName);
          this.phone.set(data.phone);
          this.photo.set(data.photo);
          this.birthDate.set(data.birthDate);
          this.identityDocument.set(data.identityDocument);
          this.financialEntity.set(data.financialEntity);
          this.refundAccount.set(data.refundAccount);
        },
        error: (err) => console.error('Error loading customer data', err)
      });
    }
  }

  updateProfile() {
    this.detailsMessage.set(null);
    const currentUser = this.authService.currentUser();
    if (!currentUser || !currentUser.idPersona) {
      this.detailsMessage.set({ type: 'error', text: 'No se pudo identificar al usuario.' });
      return;
    }

    const profileData = {
      firstName: this.firstName(),
      lastName: this.lastName(),
      phone: this.phone(),
      photo: this.photo(),
      birthDate: this.birthDate(),
      identityDocument: this.identityDocument(),
      financialEntity: this.financialEntity(),
      refundAccount: this.refundAccount(),
      // These fields are from the request example, may need adjustment
      userId: currentUser.idUsuario,
      status: 'ACTIVO',
      createdByUserId: currentUser.idUsuario
    };

    this.customerService.updateCustomer(currentUser.idPersona, profileData).subscribe({
      next: () => {
        this.detailsMessage.set({ type: 'success', text: '¡Tus datos han sido actualizados con éxito!' });
        setTimeout(() => this.detailsMessage.set(null), 3000);
      },
      error: (err) => {
        this.detailsMessage.set({ type: 'error', text: 'No se pudieron actualizar tus datos.' });
        console.error('Error updating profile', err);
        setTimeout(() => this.detailsMessage.set(null), 3000);
      }
    });
  }

  updatePassword() {
    this.passwordMessage.set(null);
    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordMessage.set({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }
    if (!this.newPassword()) {
        this.passwordMessage.set({ type: 'error', text: 'Por favor, ingresa una nueva contraseña.' });
        return;
    }
    
    const currentUser = this.authService.currentUser();
    console.log('currentUser', currentUser);

    if (!currentUser || !currentUser.idUsuario) {
      this.passwordMessage.set({ type: 'error', text: 'No se pudo identificar al usuario.' });
      return;
    }

    const passwordData = {
      userId: currentUser.idUsuario,
      newPassword: this.newPassword()
    };

    console.log('passwordData', passwordData);

    this.authService.changePassword(passwordData).subscribe({
      next: () => {
        this.passwordMessage.set({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
        this.newPassword.set('');
        this.confirmPassword.set('');
        setTimeout(() => this.passwordMessage.set(null), 3000);
      },
      error: (err) => {
        this.passwordMessage.set({ type: 'error', text: 'No se pudo actualizar la contraseña.' });
        console.error('Error updating password', err);
        setTimeout(() => this.passwordMessage.set(null), 3000);
      }
    });
  }
}
