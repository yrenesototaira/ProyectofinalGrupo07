import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);

  email = 'admin@restaurante.com';
  password = 'admin123';
  errorMessage = signal<string | null>(null);

  login() {
    this.errorMessage.set(null);
    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        error: (err: HttpErrorResponse) => this.errorMessage.set(err.error.message || 'Correo o contraseña incorrectos.')
      });
  }
}