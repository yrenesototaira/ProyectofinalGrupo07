export interface Table {
  id: number;
  capacity: number;
  isAvailable: boolean;
  shape: 'square' | 'round';
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
}

export interface Reservation {
  id: string | null;
  date: string | null;
  time: string | null;
  guests: number;
  table: Table | null;
  menuItems: { item: MenuItem; quantity: number }[];
  totalCost: number;
  paymentMethod: 'Tarjeta' | 'Efectivo' | null;
}