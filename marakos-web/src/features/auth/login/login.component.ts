import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);

  email = 'test@marakos.pe';
  password = 'password';
  errorMessage = signal<string | null>(null);

  login() {
    this.errorMessage.set(null);
    if (!this.authService.login(this.email, this.password)) {
      this.errorMessage.set('Correo o contraseña incorrectos.');
    }
  }
}