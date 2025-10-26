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

  getAvailableTimesForDate(date: string, guests: number): { time: string; label: string; available: boolean }[] {
    // Mock data - simulate available time slots based on date and guests
    const allTimes = [
      { time: '18:00', label: '06:00 PM' },
      { time: '18:30', label: '06:30 PM' },
      { time: '19:00', label: '07:00 PM' },
      { time: '19:30', label: '07:30 PM' },
      { time: '20:00', label: '08:00 PM' },
      { time: '20:30', label: '08:30 PM' },
      { time: '21:00', label: '09:00 PM' },
      { time: '21:30', label: '09:30 PM' }
    ];

    // Simulate availability based on date and number of guests
    return allTimes.map(timeSlot => {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      
      // More availability on weekdays, less on weekends
      // Larger groups have less availability
      let availabilityChance = isWeekend ? 0.6 : 0.8;
      if (guests >= 6) availabilityChance -= 0.2;
      if (guests >= 8) availabilityChance -= 0.1;
      
      // Prime time (7-8 PM) has less availability
      if (timeSlot.time >= '19:00' && timeSlot.time <= '20:30') {
        availabilityChance -= 0.2;
      }

      return {
        ...timeSlot,
        available: Math.random() < availabilityChance
      };
    });
  }

  generateAvailableDatesForBooking(): string[] {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Mondays (restaurant closed)
      if (date.getDay() !== 1) {
        // Simulate some dates being fully booked (10% chance)
        if (Math.random() > 0.1) {
          dates.push(date.toISOString().split('T')[0]);
        }
      }
    }
    
    return dates;
  }
}