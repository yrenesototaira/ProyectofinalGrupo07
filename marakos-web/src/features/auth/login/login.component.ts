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

  email = '';
  password = '';
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  showPassword = signal(false);

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  login() {
    this.errorMessage.set(null);
    this.isLoading.set(true);
    
    console.log('Attempting login with:', { email: this.email, password: this.password });
    
    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Login error:', err);
          this.isLoading.set(false);
          
          let errorMsg = 'Error de conexión. Verifica que el servidor esté funcionando.';
          
          if (err.error?.message) {
            errorMsg = err.error.message;
          } else if (err.status === 401) {
            errorMsg = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.';
          } else if (err.status === 400) {
            errorMsg = 'Datos de login inválidos.';
          } else if (err.status === 0) {
            errorMsg = 'No se puede conectar al servidor. Por favor, intenta más tarde.';
          }
          
          this.errorMessage.set(errorMsg);
        }
      });
  }
}