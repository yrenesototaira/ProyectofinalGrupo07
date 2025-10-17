import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { RestaurantDataService } from '../../core/services/restaurant-data.service';
import { MenuItem, Reservation } from '../../core/models/restaurant.model';

@Component({
  selector: 'app-edit-reservation',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-reservation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditReservationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private restaurantDataService = inject(RestaurantDataService);

  reservationId = signal<string | null>(null);
  reservation = signal<Reservation | null>(null);

  // Dynamic return path
  returnPath = signal('/dashboard/reservations');

  // Editable fields
  guests = signal(2);
  selectedDate = signal('');
  selectedTime = signal('');
  menuItems = signal<{ item: MenuItem; quantity: number }[]>([]);
  specialRequests = signal('');

  // Control state
  isCheckingAvailability = signal(false);
  availabilityMessage = signal('');
  availabilityChecked = signal(false);

  // Data
  menu = this.restaurantDataService.getMenu();

  totalCost = computed(() =>
    this.menuItems().reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0)
  );

  ngOnInit() {
    if (this.router.url.startsWith('/admin')) {
      this.returnPath.set('/admin/reservations');
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existingReservation = this.bookingService.getReservationById(id);
      if (existingReservation && existingReservation.status === 'Confirmada') {
        this.reservationId.set(id);
        this.reservation.set(existingReservation);
        // Initialize editable fields
        this.guests.set(existingReservation.guests);
        this.selectedDate.set(existingReservation.date ?? '');
        this.selectedTime.set(existingReservation.time ?? '');
        this.menuItems.set(JSON.parse(JSON.stringify(existingReservation.menuItems))); // Deep copy
        this.specialRequests.set(existingReservation.specialRequests ?? '');
      } else {
        // If not found or not editable, go back to the list
        this.router.navigate([this.returnPath()]);
      }
    }
  }
  
  getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  onDetailsChange() {
    this.availabilityChecked.set(false);
    this.availabilityMessage.set('');
  }

  async checkAvailability() {
    this.isCheckingAvailability.set(true);
    this.availabilityMessage.set('');
    const available = await this.restaurantDataService.checkAvailability(
      this.selectedDate(),
      this.selectedTime(),
      this.guests()
    );
    if (available) {
      this.availabilityMessage.set('¡Perfecto! Hay disponibilidad para la nueva fecha/hora.');
      this.availabilityChecked.set(true);
    } else {
      this.availabilityMessage.set('Lo sentimos, no hay disponibilidad en el nuevo horario. Por favor, intenta de nuevo.');
      this.availabilityChecked.set(false);
    }
    this.isCheckingAvailability.set(false);
  }

  addMenuItem(item: MenuItem) {
    this.menuItems.update(items => {
      const existingItem = items.find(i => i.item.id === item.id);
      if (existingItem) {
        existingItem.quantity++;
        return [...items];
      }
      return [...items, { item, quantity: 1 }];
    });
  }

  removeMenuItem(itemId: number) {
    this.menuItems.update(items => {
      const updatedItems = items.map(i => {
        if (i.item.id === itemId) {
          return { ...i, quantity: i.quantity - 1 };
        }
        return i;
      });
      return updatedItems.filter(i => i.quantity > 0);
    });
  }

  getItemQuantity(itemId: number): number {
    return this.menuItems().find(i => i.item.id === itemId)?.quantity ?? 0;
  }
  
  saveChanges() {
    if (!this.availabilityChecked() && this.detailsChanged()) {
      this.availabilityMessage.set('Debes verificar la disponibilidad de los nuevos detalles antes de guardar.');
      return;
    }
    
    if (this.reservationId()) {
      this.bookingService.updateReservation(this.reservationId()!, {
        date: this.selectedDate(),
        time: this.selectedTime(),
        guests: this.guests(),
        menuItems: this.menuItems(),
        totalCost: this.totalCost(),
        specialRequests: this.specialRequests(),
      });
      
      // Navigate to the correct place after saving
      if (this.router.url.startsWith('/admin')) {
        this.router.navigate(['/admin/reservations']);
      } else {
        this.router.navigate(['/dashboard/reservations', this.reservationId()]);
      }
    }
  }

  detailsChanged(): boolean {
      const original = this.reservation();
      if (!original) return false;
      return original.date !== this.selectedDate() || original.time !== this.selectedTime() || original.guests !== this.guests();
  }
}