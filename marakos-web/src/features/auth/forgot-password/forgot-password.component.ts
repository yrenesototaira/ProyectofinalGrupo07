import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@/src/core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  step = signal('enterEmail'); // 'enterEmail' | 'enterCode' | 'success' | 'error'
  email = '';
  verificationCode = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoadingSendCode = signal(false);
  isLoadingReset = signal(false);
  
  // Validación de contraseña
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordTouched = signal(false);
  confirmPasswordTouched = signal(false);
  
  passwordValidations = {
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  };
  
  get isPasswordValid(): boolean {
    return Object.values(this.passwordValidations).every(v => v);
  }
  
  get passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword && this.confirmPassword.length > 0;
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
  
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
  
  onPasswordBlur() {
    this.passwordTouched.set(true);
  }
  
  onConfirmPasswordBlur() {
    this.confirmPasswordTouched.set(true);
  }
  
  validatePassword() {
    this.passwordValidations = {
      minLength: this.newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(this.newPassword),
      hasLowerCase: /[a-z]/.test(this.newPassword),
      hasNumber: /[0-9]/.test(this.newPassword)
    };
  }

  sendRecoveryEmail() {
    this.errorMessage.set(null);
    this.isLoadingSendCode.set(true);
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoadingSendCode.set(false);
        this.step.set('enterCode');
        this.successMessage.set('Se ha enviado un código de verificación a tu correo.');
      },
      error: (err) => {
        this.isLoadingSendCode.set(false);
        this.errorMessage.set(err.error?.message || 'Ocurrió un error al enviar el correo. Por favor, inténtalo de nuevo.');
      }
    });
  }

  resetPassword(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }
    this.errorMessage.set(null);
    this.isLoadingReset.set(true);

    const data = {
      email: this.email,
      verificationCode: this.verificationCode,
      newPassword: this.newPassword
    };

    this.authService.resetPassword(data).subscribe({
      next: () => {
        this.isLoadingReset.set(false);
        this.step.set('success');
        this.successMessage.set('¡Tu contraseña ha sido restablecida con éxito!');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.isLoadingReset.set(false);
        this.errorMessage.set(err.error?.message || 'El código de verificación es incorrecto o ha expirado. Por favor, inténtalo de nuevo.');
        this.step.set('error');
      }
    });
  }
}