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
  imageUrl?: string;
}

export interface AdditionalService {
  id: number;
  name: string;
  description: string;
  unit: string;
  price: number;
  status: string;
  active: boolean;
  category?: 'entertainment' | 'service' | 'catering'; // Mapped from tipo_servicio
  icon?: string;
  tipo_servicio?: string; // Original field from database
}

export interface Reservation {
  id: string | null;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  date: string | null;
  time: string | null;
  guests: number;
  table: Table | null;
  menuItems: { item: MenuItem; quantity: number }[];
  totalCost: number;
  paymentMethod: 'Tarjeta' | 'Efectivo' | null;
  specialRequests: string;
  termsAccepted: boolean;
  status: 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Chequeado' | 'Atendido';
  paymentStatus?: 'Pagado' | 'Reembolsado';
}