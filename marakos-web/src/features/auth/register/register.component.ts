import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  phone = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // Validaciones
  passwordTouched = signal(false);
  emailTouched = signal(false);
  phoneTouched = signal(false);
  confirmPasswordTouched = signal(false);

  // Validadores de contraseña
  get passwordValidations() {
    return {
      minLength: this.password.length >= 8,
      hasUpperCase: /[A-Z]/.test(this.password),
      hasLowerCase: /[a-z]/.test(this.password),
      hasNumber: /[0-9]/.test(this.password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(this.password)
    };
  }

  get isPasswordValid(): boolean {
    const validations = this.passwordValidations;
    return validations.minLength && 
           validations.hasUpperCase && 
           validations.hasLowerCase && 
           validations.hasNumber;
  }

  get isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  get isPhoneValid(): boolean {
    // Acepta formato: 9 dígitos o +51 seguido de 9 dígitos
    const phoneRegex = /^(\+51)?9\d{8}$/;
    return phoneRegex.test(this.phone.replace(/\s/g, ''));
  }

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword && this.confirmPassword.length > 0;
  }

  get isFormValid(): boolean {
    return this.firstName.trim() !== '' &&
           this.lastName.trim() !== '' &&
           this.isPhoneValid &&
           this.isEmailValid &&
           this.isPasswordValid &&
           this.passwordsMatch;
  }

  onPasswordBlur() {
    this.passwordTouched.set(true);
  }

  onEmailBlur() {
    this.emailTouched.set(true);
  }

  onPhoneBlur() {
    this.phoneTouched.set(true);
  }

  onConfirmPasswordBlur() {
    this.confirmPasswordTouched.set(true);
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  register() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    
    if (!this.isFormValid) {
      this.errorMessage.set('Por favor, complete todos los campos correctamente.');
      return;
    }

    this.isLoading.set(true);
    
    const userData = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      phone: this.phone.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password
    };
    
    this.authService.register(userData)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('¡Registro exitoso! 🎉 Se ha enviado un correo electrónico de bienvenida a tu cuenta. Redirigiendo al inicio de sesión...');
          
          // Redirigir después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'No se pudo completar el registro. Inténtelo de nuevo.');
        }
      });
  }
}