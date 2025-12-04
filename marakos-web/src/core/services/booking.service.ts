import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Reservation, Table, MenuItem } from '../models/restaurant.model';
import { ReservationEdit } from '../models/reservation-edit.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  getReservationsForCurrentUser(): Observable<any[]> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      return new Observable(observer => observer.next([]));
    }
    return this.http.get<any[]>(`${environment.apiUrlReservation}/reservation/customer/${currentUser.idPersona}`);
  }

  getReservationById(id: string): Observable<ReservationEdit> {
    return this.http.get<ReservationEdit>(`${environment.apiUrlReservation}/reservation/${id}`);
  }

  getReservationsForCurrentAdmin(date: string, status: string): Observable<any[]> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      return new Observable(observer => observer.next([]));
    }
    return this.http.get<any[]>(`${environment.apiUrlReservation}/reservation/date/${date}/status/${status}`);
  }

  confirmReservation(resevationData: any): Observable<any> {
    console.log('🌐 BOOKING SERVICE: Enviando petición HTTP a:', `${environment.apiUrlReservation}/reservation`);
    console.log('📦 BOOKING SERVICE: Datos de reserva:', resevationData);
    return this.http.post<any>(`${environment.apiUrlReservation}/reservation`, resevationData);
  }

  updateReservation(id: number, resevationData: any) {
    return this.http.put(`${environment.apiUrlReservation}/reservation/${id}`, resevationData);
  }

  cancelReservation(id: string): Observable<any> {
    return this.http.patch(`${environment.apiUrlReservation}/reservation/${id}/cancel`, {});
  }

  checkinReservation(id: string): Observable<any> {
    return this.http.patch(`${environment.apiUrlReservation}/reservation/${id}/checkin`, {});
  }

  checkoutReservation(id: string): Observable<any> {
    return this.http.patch(`${environment.apiUrlReservation}/reservation/${id}/checkout`, {});
  }

  paidReservation(id: string): Observable<any> {
    return this.http.patch(`${environment.apiUrlReservation}/reservation/${id}/paid`, {});
  }

  updateReservationStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${environment.apiUrlReservation}/reservation/${id}/status`, { status });
  }

  getAvailableTables(date: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlReservation}/reservation/availability?date=${date}`, {});
  }



  // Metodos antiguos:
    private initialReservationState: Reservation = {
    id: null,
    userId: null,
    customerName: '',
    customerEmail: '',
    date: null,
    time: null,
    guests: 2,
    table: null,
    menuItems: [],
    totalCost: 0,
    paymentMethod: null,
    specialRequests: '',
    termsAccepted: false,
    status: 'CONFIRMADO',
    paymentStatus: undefined,
  };

    private allReservationsState = signal<Reservation[]>([
    {
      id: 'R17000000000001',
      userId: '1',
      customerName: 'Usuario de Prueba',
      customerEmail: 'test@marakos.pe',
      date: '2024-08-15',
      time: '20:00',
      guests: 2,
      table: { id: 4, capacity: 4, isAvailable: true, shape: 'square', location: 'Terraza' },
      menuItems: [
        { item: { id: 201, name: 'Filet Mignon', description: '8oz center-cut tenderloin, with mashed potatoes.', price: 45, category: 'Main Course' }, quantity: 2 },
        { item: { id: 401, name: 'Red Wine', description: 'Glass of house Cabernet Sauvignon.', price: 16, category: 'Beverage' }, quantity: 2 },
      ],
      totalCost: 122,
      paymentMethod: 'Tarjeta',
      specialRequests: 'Window seat if possible.',
      termsAccepted: true,
      status: 'CONFIRMADO',
      paymentStatus: 'Pagado'
    }
  ]);

  private reservationState = signal<Reservation>(this.initialReservationState);

    // Public signals for current booking process
  currentReservation = this.reservationState.asReadonly();

  menuTotal = computed(() => 
    this.reservationState().menuItems.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0)
  );
  
  allReservations = this.allReservationsState.asReadonly();
  reservationsForCurrentUser = computed(() => {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];
    return this.allReservationsState().filter(r => r.userId === currentUser.idUsuario);
  });

  setBookingDetails(details: { date: string; time: string; guests: number }) {
    this.reservationState.update(state => ({ ...state, ...details }));
  }

  setTable(table: Table) {
    this.reservationState.update(state => ({ ...state, table }));
  }

  setCustomerDetails(details: { name: string; email: string }) {
    this.reservationState.update(state => ({
      ...state,
      customerName: details.name,
      customerEmail: details.email,
    }));
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

  setSpecialRequests(requests: string) {
    this.reservationState.update(state => ({ ...state, specialRequests: requests }));
  }

  setTermsAccepted(accepted: boolean) {
    this.reservationState.update(state => ({ ...state, termsAccepted: accepted }));
  }
  
  setPaymentMethod(method: 'Tarjeta' | 'Efectivo') {
    this.reservationState.update(state => ({ ...state, paymentMethod: method }));
  }

  confirmReservation_Old(): string {
    const reservationId = `R${Date.now()}${Math.floor(Math.random() * 1000)}`;
    this.reservationState.update(state => ({ 
        ...state, 
        id: reservationId,
        userId: this.authService.currentUser()?.idUsuario ?? null,
        status: 'CONFIRMADO',
        paymentStatus: state.totalCost > 0 ? 'Pagado' : undefined
    }));
    const newReservation = this.reservationState();
    this.allReservationsState.update(reservations => [...reservations, newReservation]);
    return reservationId;
  }


  

  getReservationById_Old(id: string): Reservation | undefined {
    // This is a temporary fix for when confirming a reservation.
    // The "confirmed" reservation is still in the booking service's transient state.
    if (this.currentReservation().id === id) {
      return this.currentReservation();
    }
    return this.allReservationsState().find(r => r.id === id);
  }

  processRefund(id: string) {
    this.allReservationsState.update(reservations => 
      reservations.map(r => r.id === id ? { ...r, status: 'CANCELADO', paymentStatus: 'Reembolsado' } : r)
    );
  }

  resetBooking() {
    this.reservationState.set(this.initialReservationState);
  }

  getEventShiftAvailability(date: string): Observable<{availableShifts: number[], occupiedShifts: number[]}> {
    return this.http.get<{availableShifts: number[], occupiedShifts: number[]}>(
      `${environment.apiUrlReservation}/reservation/event-shifts/availability?date=${date}`
    );
  }

}
