import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  
  logout() {
    this.authService.logout();
  }
  
  /**
   * Verifica si el usuario tiene un rol restringido (Mozo o Recepcionista)
   * Estos roles solo pueden ver la gestión de reservas
   */
  isRestrictedRole(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    
    const rol = user.rol || user.tipoUsuario || '';
    return rol === 'Mozo' || rol === 'Recepcionista';
  }
  
  /**
   * Verifica si el usuario es Administrador completo
   * Los administradores tienen acceso a todas las funcionalidades
   */
  isFullAdmin(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    
    const rol = user.rol || user.tipoUsuario || '';
    return rol === 'Administrador' || rol === 'Empleado';
  }
}
