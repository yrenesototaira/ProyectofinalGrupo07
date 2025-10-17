import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, RouterLink, ConfirmationModalComponent],
  templateUrl: './admin-users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent {
  private authService = inject(AuthService);
  users = this.authService.getAllUsers();
  
  isDeleteModalOpen = signal(false);
  userToDeleteId = signal<string | null>(null);

  requestDeletion(id: string) {
    this.userToDeleteId.set(id);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeletion() {
    if (this.userToDeleteId()) {
      this.authService.deleteUser(this.userToDeleteId()!);
    }
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.userToDeleteId.set(null);
  }

  getRoleBadgeClass(role: User['role']): string {
    const baseClasses = 'font-bold px-3 py-1 text-xs rounded-full';
    switch (role) {
      case 'Administrador':
        return `${baseClasses} bg-amber-400/20 text-amber-300`;
      case 'Cliente':
        return `${baseClasses} bg-sky-400/20 text-sky-300`;
      default:
        return baseClasses;
    }
  }
}
