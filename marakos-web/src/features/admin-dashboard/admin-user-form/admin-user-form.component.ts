import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-user-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-user-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  userId = signal<string | null>(null);
  isEditMode = signal(false);
  
  // Form model
  name = signal('');
  email = signal('');
  phone = signal('');
  role = signal<'Cliente' | 'Administrador'>('Cliente');

  feedbackMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(id);
      const user = this.authService.getUserById(id);
      if (user) {
        this.name.set(user.name);
        this.email.set(user.email);
        this.phone.set(user.phone ?? '');
        this.role.set(user.role);
      } else {
        // User not found, redirect
        this.router.navigate(['/admin/users']);
      }
    }
  }

  saveUser() {
    this.feedbackMessage.set(null);
    if (!this.name() || !this.email()) {
        this.feedbackMessage.set({ type: 'error', text: 'Nombre y correo son requeridos.' });
        return;
    }

    if (this.isEditMode() && this.userId()) {
      const updatedUser: User = {
        id: this.userId()!,
        name: this.name(),
        email: this.email(),
        phone: this.phone(),
        role: this.role()
      };
      this.authService.updateUser(updatedUser);
      this.feedbackMessage.set({ type: 'success', text: 'Usuario actualizado con éxito.' });
    } else {
      const newUser: Omit<User, 'id'> = {
        name: this.name(),
        email: this.email(),
        phone: this.phone(),
        role: this.role()
      };
      this.authService.createUser(newUser);
      this.feedbackMessage.set({ type: 'success', text: 'Usuario creado con éxito.' });
    }
    
    setTimeout(() => {
        this.router.navigate(['/admin/users']);
    }, 1500);
  }
}