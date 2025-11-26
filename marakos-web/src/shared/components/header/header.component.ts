import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  isMobileMenuOpen = false;

  logout() {
    this.authService.logout();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user || !user.nombre) return 'U';
    
    const names = user.nombre.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.nombre[0].toUpperCase();
  }

  getRoleDisplayName(): string {
    const user = this.currentUser();
    if (!user) return '';
    
    // Si es empleado, mostrar su rol específico (Administrador, Mozo, Recepcionista)
    if (user.tipoUsuario === 'Empleado' && user.rol) {
      return user.rol;
    }
    
    // Para clientes u otros, mostrar el tipoUsuario
    return user.tipoUsuario || 'Usuario';
  }
}