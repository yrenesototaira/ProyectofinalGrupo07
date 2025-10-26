import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private authService = inject(AuthService);

  firstName = '';
  lastName = '';
  phone = '';
  email = '';
  password = '';
  errorMessage = signal<string | null>(null);

  register() {
    this.errorMessage.set(null);
    const userData = {
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      email: this.email,
      password: this.password
    };
    console.log(userData);
    
    this.authService.register(userData)
      .subscribe({
        error: (err: HttpErrorResponse) => this.errorMessage.set(err.error.message || 'No se pudo completar el registro. Inténtelo de nuevo.')
      });
  }
}