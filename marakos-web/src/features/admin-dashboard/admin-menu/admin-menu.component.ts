import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RestaurantDataService } from '../../../core/services/restaurant-data.service';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { MenuItem } from '../../../core/models/restaurant.model';

@Component({
  selector: 'app-admin-menu',
  imports: [CommonModule, RouterLink, ConfirmationModalComponent],
  templateUrl: './admin-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMenuComponent {
  private restaurantDataService = inject(RestaurantDataService);
  menu = this.restaurantDataService.getMenu();
  
  isDeleteModalOpen = signal(false);
  itemToDelete = signal<MenuItem | null>(null);

  requestDeletion(item: MenuItem) {
    this.itemToDelete.set(item);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeletion() {
    if (this.itemToDelete()) {
      this.restaurantDataService.deleteMenuItem(this.itemToDelete()!.id);
    }
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.itemToDelete.set(null);
  }
}
