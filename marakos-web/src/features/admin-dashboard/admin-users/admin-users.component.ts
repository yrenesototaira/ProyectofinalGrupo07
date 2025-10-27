import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { AdminService } from '../../../core/services/admin.service';
import { UserListResponse, PagedUserResponse } from '../../../core/models/admin.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, RouterLink, FormsModule, ConfirmationModalComponent],
  templateUrl: './admin-users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  
  // Expose Math to template
  Math = Math;
  
  // Datos de paginación
  pagedResponse = signal<PagedUserResponse | null>(null);
  currentPage = signal(0);
  pageSize = signal(8);
  searchTerm = signal('');
  isLoading = signal(false);
  
  // Búsqueda con debounce
  private searchSubject = new Subject<string>();
  
  // Modal de eliminación
  isDeleteModalOpen = signal(false);
  userToDeleteId = signal<number | null>(null);

  // Computed properties
  users = computed(() => this.pagedResponse()?.users || []);
  totalPages = computed(() => this.pagedResponse()?.totalPages || 0);
  totalElements = computed(() => this.pagedResponse()?.totalElements || 0);
  hasNext = computed(() => this.pagedResponse()?.hasNext || false);
  hasPrevious = computed(() => this.pagedResponse()?.hasPrevious || false);

  ngOnInit() {
    this.loadUsers();
    
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm.set(searchTerm);
      this.currentPage.set(0); // Reset to first page when searching
      this.loadUsers();
    });
  }

  loadUsers() {
    this.isLoading.set(true);
    this.adminService.getUsersPaginated(
      this.currentPage(),
      this.pageSize(),
      this.searchTerm() || undefined
    ).subscribe({
      next: (response) => {
        this.pagedResponse.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: any) {
    this.searchSubject.next(event.target.value);
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  nextPage() {
    if (this.hasNext()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.hasPrevious()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    
    // Mostrar menos páginas en dispositivos móviles
    const isMobile = window.innerWidth < 640; // Tailwind's sm breakpoint
    const delta = isMobile ? 1 : 2; // Number of pages to show on each side of current page
    
    let start = Math.max(0, current - delta);
    let end = Math.min(total - 1, current + delta);
    
    // Adjust if we're near the beginning or end
    if (end - start < 2 * delta) {
      if (start === 0) {
        end = Math.min(total - 1, start + 2 * delta);
      } else if (end === total - 1) {
        start = Math.max(0, end - 2 * delta);
      }
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  requestDeletion(id: number) {
    this.userToDeleteId.set(id);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeletion() {
    if (this.userToDeleteId()) {
      this.adminService.deleteUser(this.userToDeleteId()!).subscribe({
        next: (response) => {
          console.log('Usuario eliminado exitosamente:', response.message);
          // Recargar la lista de usuarios
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          // TODO: Mostrar mensaje de error al usuario
        }
      });
    }
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.userToDeleteId.set(null);
  }

  getRoleBadgeClass(role: string): string {
    const baseClasses = 'font-bold px-3 py-1 text-xs rounded-full';
    switch (role) {
      case 'Administrador':
      case 'Admin':
        return `${baseClasses} bg-amber-400/20 text-amber-300`;
      case 'Cliente':
        return `${baseClasses} bg-sky-400/20 text-sky-300`;
      case 'Empleado':
        return `${baseClasses} bg-green-400/20 text-green-300`;
      default:
        return `${baseClasses} bg-gray-400/20 text-gray-300`;
    }
  }

  getUserTypeBadgeClass(userType: string): string {
    const baseClasses = 'font-bold px-2 py-1 text-xs rounded';
    switch (userType) {
      case 'Cliente':
        return `${baseClasses} bg-blue-500/20 text-blue-300`;
      case 'Empleado':
        return `${baseClasses} bg-purple-500/20 text-purple-300`;
      default:
        return `${baseClasses} bg-gray-500/20 text-gray-300`;
    }
  }
}
