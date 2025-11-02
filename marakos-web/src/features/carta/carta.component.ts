import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MenuService, MenuItem, MenuCategory } from '../../core/services/menu.service';

@Component({
  selector: 'app-carta',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './carta.component.html',
  styleUrl: './carta.component.css'
})
export class CartaComponent implements OnInit {
  // Service injections
  constructor(private menuService: MenuService) {}

  // Reactive state
  selectedCategory = signal<string | number>('all');
  searchQuery = signal<string>('');

  // Computed properties from service
  menuItems = this.menuService.getMenuItems();
  categories = this.menuService.getCategories();
  loading = this.menuService.getLoading();
  error = this.menuService.getError();

  // Computed filtered items
  filteredItems = computed(() => {
    const query = this.searchQuery();
    const category = this.selectedCategory();
    
    if (query.trim()) {
      return this.menuService.searchItems(query);
    }
    
    return this.menuService.getItemsByCategory(category);
  });

  // Computed popular items
  popularItems = computed(() => {
    return this.menuService.getPopularItems();
  });

  ngOnInit(): void {
    // Data is automatically loaded in the service constructor
    // We can add any additional initialization here if needed
  }

  selectCategory(category: string | number): void {
    this.selectedCategory.set(category);
    this.searchQuery.set(''); // Clear search when selecting category
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.selectedCategory.set('all'); // Reset category when searching
  }

  refreshMenu(): void {
    this.menuService.refreshMenuData();
  }

  // Fallback data for development/demo purposes
  private fallbackMenuItems: MenuItem[] = [
    // Entradas
    {
      id: 1,
      name: 'Provoleta a la Parrilla',
      description: 'Queso provolone fundido con oregano y ají molido',
      price: 18,
      category: 'entradas',
      categoryId: 1,
      popular: true,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      name: 'Chorizo Criollo',
      description: 'Chorizo argentino a la parrilla con chimichurri',
      price: 15,
      category: 'entradas',
      categoryId: 1,
      image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    
    // Carnes
    {
      id: 4,
      name: 'Bife de Chorizo',
      description: 'Corte premium de 400gr a la parrilla con guarnición',
      price: 45,
      category: 'carnes',
      categoryId: 2,
      popular: true,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 5,
      name: 'Asado de Tira',
      description: 'Costillas de res con cocción lenta, 500gr',
      price: 42,
      category: 'carnes',
      categoryId: 2,
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    
    // Pollo
    {
      id: 8,
      name: 'Pollo a la Parrilla',
      description: 'Medio pollo marinado con hierbas y especias',
      price: 28,
      category: 'pollo',
      categoryId: 3,
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    
    // Bebidas
    {
      id: 12,
      name: 'Vino Tinto de la Casa',
      description: 'Selección especial Marakos, copa',
      price: 8,
      category: 'bebidas',
      categoryId: 5,
      image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];
}
