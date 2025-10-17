import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RestaurantDataService } from '../../../core/services/restaurant-data.service';
import { MenuItem } from '../../../core/models/restaurant.model';

@Component({
  selector: 'app-admin-menu-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-menu-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMenuFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restaurantDataService = inject(RestaurantDataService);

  itemId = signal<number | null>(null);
  isEditMode = signal(false);
  
  // Form model
  name = signal('');
  description = signal('');
  price = signal(0);
  category = signal<'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage'>('Main Course');
  imageUrl = signal('');

  feedbackMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);
  
  readonly categories: MenuItem['category'][] = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numericId = parseInt(id, 10);
      this.isEditMode.set(true);
      this.itemId.set(numericId);
      const item = this.restaurantDataService.getMenuItemById(numericId);
      if (item) {
        this.name.set(item.name);
        this.description.set(item.description);
        this.price.set(item.price);
        this.category.set(item.category);
        this.imageUrl.set(item.imageUrl ?? '');
      } else {
        this.router.navigate(['/admin/menu']);
      }
    }
  }

  saveItem() {
    this.feedbackMessage.set(null);
    if (!this.name() || this.price() <= 0) {
        this.feedbackMessage.set({ type: 'error', text: 'Nombre y precio (mayor a 0) son requeridos.' });
        return;
    }

    if (this.isEditMode() && this.itemId() !== null) {
      const updatedItem: MenuItem = {
        id: this.itemId()!,
        name: this.name(),
        description: this.description(),
        price: this.price(),
        category: this.category(),
        imageUrl: this.imageUrl()
      };
      this.restaurantDataService.updateMenuItem(updatedItem);
      this.feedbackMessage.set({ type: 'success', text: 'Plato actualizado con éxito.' });
    } else {
      const newItem: Omit<MenuItem, 'id'> = {
        name: this.name(),
        description: this.description(),
        price: this.price(),
        category: this.category(),
        imageUrl: this.imageUrl()
      };
      this.restaurantDataService.addMenuItem(newItem);
      this.feedbackMessage.set({ type: 'success', text: 'Plato creado con éxito.' });
    }
    
    setTimeout(() => {
        this.router.navigate(['/admin/menu']);
    }, 1500);
  }
}