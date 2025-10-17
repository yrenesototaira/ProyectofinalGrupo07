import { Injectable, signal } from '@angular/core';
import { Table, MenuItem } from '../models/restaurant.model';

@Injectable({ providedIn: 'root' })
export class RestaurantDataService {
  private readonly tables: Table[] = [
    { id: 1, capacity: 2, isAvailable: true, shape: 'square' },
    { id: 2, capacity: 2, isAvailable: true, shape: 'square' },
    { id: 3, capacity: 4, isAvailable: false, shape: 'round' },
    { id: 4, capacity: 4, isAvailable: true, shape: 'square' },
    { id: 5, capacity: 6, isAvailable: true, shape: 'square' },
    { id: 6, capacity: 8, isAvailable: true, shape: 'round' },
    { id: 7, capacity: 2, isAvailable: true, shape: 'round' },
    { id: 8, capacity: 4, isAvailable: true, shape: 'square' },
  ];

  private readonly initialMenu: MenuItem[] = [
    { id: 101, name: 'Bruschetta', description: 'Grilled bread with tomatoes, garlic, basil.', price: 12, category: 'Appetizer', imageUrl: 'https://picsum.photos/id/10/400/300' },
    { id: 102, name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, and basil.', price: 15, category: 'Appetizer', imageUrl: 'https://picsum.photos/id/20/400/300' },
    { id: 201, name: 'Filet Mignon', description: '8oz center-cut tenderloin, with mashed potatoes.', price: 45, category: 'Main Course', imageUrl: 'https://picsum.photos/id/30/400/300' },
    { id: 202, name: 'Lobster Ravioli', description: 'Handmade ravioli with a creamy lobster sauce.', price: 38, category: 'Main Course', imageUrl: 'https://picsum.photos/id/40/400/300' },
    { id: 203, name: 'Mushroom Risotto', description: 'Creamy Arborio rice with wild mushrooms.', price: 28, category: 'Main Course', imageUrl: 'https://picsum.photos/id/50/400/300' },
    { id: 301, name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert.', price: 14, category: 'Dessert', imageUrl: 'https://picsum.photos/id/60/400/300' },
    { id: 302, name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a molten center.', price: 14, category: 'Dessert', imageUrl: 'https://picsum.photos/id/70/400/300' },
    { id: 401, name: 'Red Wine', description: 'Glass of house Cabernet Sauvignon.', price: 16, category: 'Beverage', imageUrl: 'https://picsum.photos/id/80/400/300' },
  ];
  
  private menuSignal = signal<MenuItem[]>(this.initialMenu);

  getTables() {
    return signal(this.tables);
  }

  getMenu() {
    return this.menuSignal.asReadonly();
  }

  getMenuItemById(id: number): MenuItem | undefined {
    return this.menuSignal().find(item => item.id === id);
  }

  addMenuItem(item: Omit<MenuItem, 'id'>): void {
    const newItem: MenuItem = { ...item, id: Date.now() };
    this.menuSignal.update(menu => [...menu, newItem]);
  }

  updateMenuItem(updatedItem: MenuItem): void {
    this.menuSignal.update(menu => menu.map(item => item.id === updatedItem.id ? updatedItem : item));
  }

  deleteMenuItem(id: number): void {
    this.menuSignal.update(menu => menu.filter(item => item.id !== id));
  }

  checkAvailability(date: string, time: string, guests: number): Promise<boolean> {
    // Mock API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(Math.random() > 0.2); // 80% chance of availability
      }, 500);
    });
  }
}