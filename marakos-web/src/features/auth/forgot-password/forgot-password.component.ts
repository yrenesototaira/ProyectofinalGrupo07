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

  sendRecoveryEmail() {
    this.errorMessage.set(null);
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.step.set('enterCode');
        this.successMessage.set('Se ha enviado un código de verificación a tu correo.');
      },
      error: (err) => {
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

    const data = {
      email: this.email,
      verificationCode: this.verificationCode,
      newPassword: this.newPassword
    };

    this.authService.resetPassword(data).subscribe({
      next: () => {
        this.step.set('success');
        this.successMessage.set('¡Tu contraseña ha sido restablecida con éxito!');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'El código de verificación es incorrecto o ha expirado. Por favor, inténtalo de nuevo.');
        this.step.set('error');
      }
    });
  }
}