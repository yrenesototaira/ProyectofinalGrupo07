import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  email = '';
  emailSent = signal(false);

  sendRecoveryEmail() {
    console.log(`Password recovery email sent to: ${this.email}`);
    this.emailSent.set(true);
  }
}