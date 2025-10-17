import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private authService = inject(AuthService);

  name = '';
  email = '';
  password = '';
  errorMessage = signal<string | null>(null);

  register() {
    this.errorMessage.set(null);
    if (!this.authService.register(this.name, this.email, this.password)) {
      this.errorMessage.set('No se pudo completar el registro. Inténtelo de nuevo.');
    }
  }
}