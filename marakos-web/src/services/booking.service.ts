import { Injectable, signal, computed } from '@angular/core';
import { Reservation, Table, MenuItem } from '../models/restaurant.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private initialReservationState: Reservation = {
    id: null,
    date: null,
    time: null,
    guests: 2,
    table: null,
    menuItems: [],
    totalCost: 0,
    paymentMethod: null,
  };

  private reservationState = signal<Reservation>(this.initialReservationState);

  // Public signals
  currentReservation = this.reservationState.asReadonly();
  
  menuTotal = computed(() => 
    this.reservationState().menuItems.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0)
  );

  setBookingDetails(details: { date: string; time: string; guests: number }) {
    this.reservationState.update(state => ({ ...state, ...details }));
  }

  setTable(table: Table) {
    this.reservationState.update(state => ({ ...state, table }));
  }

  addMenuItem(item: MenuItem) {
    this.reservationState.update(state => {
      const existingItem = state.menuItems.find(i => i.item.id === item.id);
      if (existingItem) {
        existingItem.quantity++;
        return { ...state, menuItems: [...state.menuItems] };
      } else {
        return { ...state, menuItems: [...state.menuItems, { item, quantity: 1 }] };
      }
    });
    this.updateTotalCost();
  }

  removeMenuItem(itemId: number) {
    this.reservationState.update(state => {
        let items = state.menuItems.map(i => {
            if (i.item.id === itemId) {
                return { ...i, quantity: i.quantity - 1 };
            }
            return i;
        }).filter(i => i.quantity > 0);
        return { ...state, menuItems: items };
    });
    this.updateTotalCost();
  }
  
  private updateTotalCost() {
    this.reservationState.update(state => ({ ...state, totalCost: this.menuTotal() }));
  }
  
  setPaymentMethod(method: 'Tarjeta' | 'Efectivo') {
    this.reservationState.update(state => ({ ...state, paymentMethod: method }));
  }

  confirmReservation(): string {
    const reservationId = `R${Date.now()}${Math.floor(Math.random() * 1000)}`;
    this.reservationState.update(state => ({ ...state, id: reservationId }));
    console.log('Reservation Confirmed:', this.reservationState());
    return reservationId;
  }

  resetBooking() {
    this.reservationState.set(this.initialReservationState);
  }
}