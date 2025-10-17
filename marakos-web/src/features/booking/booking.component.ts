import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Fix: Corrected import paths
import { BookingService } from '../../core/services/booking.service';
import { RestaurantDataService } from '../../core/services/restaurant-data.service';
import { AuthService } from '../../core/services/auth.service';
import { Table, MenuItem } from '../../core/models/restaurant.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './booking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingComponent {
  private router = inject(Router);
  bookingService = inject(BookingService);
  private restaurantDataService = inject(RestaurantDataService);
  private authService = inject(AuthService);

  step = signal(1);
  
  // Step 1 signals
  guests = signal(2);
  selectedDate = signal(this.getTodayDateString());
  selectedTime = signal('19:00');
  isCheckingAvailability = signal(false);
  availabilityMessage = signal('');
  
  // Step 2 signals
  tables = this.restaurantDataService.getTables();
  selectedTable = signal<Table | null>(null);
  
  // Step 3 signals
  menu = this.restaurantDataService.getMenu();

  // Step 4 signals
  termsAccepted = signal(false);
  isTermsModalOpen = signal(false);
  
  // Step 5 signals
  paymentMethod = signal<'Tarjeta'|'Efectivo'|null>(null);
  
  currentReservation = this.bookingService.currentReservation;
  menuTotal = this.bookingService.menuTotal;
  currentUser = this.authService.currentUser;

  constructor() {
    this.bookingService.resetBooking();
    effect(() => {
      const user = this.currentUser();
      const currentRes = this.currentReservation();
      // Only set if the user is logged in and the fields are empty (e.g., on initial load)
      if (user && (!currentRes.customerName || !currentRes.customerEmail)) {
        this.bookingService.setCustomerDetails({ name: user.name, email: user.email });
      }
    });
  }

  getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  nextStep() {
    this.step.update(s => s + 1);
  }

  prevStep() {
    this.step.update(s => s - 1);
  }
  
  goToStep(stepNum: number) {
    if (stepNum < this.step()) {
      this.step.set(stepNum);
    }
  }

  async checkAvailability() {
    this.isCheckingAvailability.set(true);
    this.availabilityMessage.set('');
    const available = await this.restaurantDataService.checkAvailability(this.selectedDate(), this.selectedTime(), this.guests());
    if (available) {
      this.availabilityMessage.set('¡Perfecto! Tenemos mesas disponibles en ese horario.');
      this.bookingService.setBookingDetails({ date: this.selectedDate(), time: this.selectedTime(), guests: this.guests()});
      setTimeout(() => this.nextStep(), 1500);
    } else {
      this.availabilityMessage.set('Lo sentimos, no hay mesas disponibles en el horario seleccionado. Por favor, intenta con otra hora.');
    }
    this.isCheckingAvailability.set(false);
  }

  selectTable(table: Table) {
    if(table.isAvailable && table.capacity >= this.guests()) {
      this.selectedTable.set(table);
      this.bookingService.setTable(table);
      this.nextStep();
    }
  }

  isTableSelected(table: Table): boolean {
    return this.selectedTable()?.id === table.id;
  }

  addMenuItemToBooking(item: MenuItem) {
    this.bookingService.addMenuItem(item);
  }

  removeMenuItemFromBooking(itemId: number) {
    this.bookingService.removeMenuItem(itemId);
  }
  
  getItemQuantity(itemId: number): number {
    return this.currentReservation().menuItems.find(i => i.item.id === itemId)?.quantity ?? 0;
  }

  updateCustomerDetails(field: 'name' | 'email', value: string) {
    const current = this.currentReservation();
    this.bookingService.setCustomerDetails({
      name: field === 'name' ? value : current.customerName,
      email: field === 'email' ? value : current.customerEmail
    });
  }
  
  updateSpecialRequests(event: Event) {
    const requests = (event.target as HTMLTextAreaElement).value;
    this.bookingService.setSpecialRequests(requests);
  }

  updateTerms(event: Event) {
    const accepted = (event.target as HTMLInputElement).checked;
    this.termsAccepted.set(accepted);
    this.bookingService.setTermsAccepted(accepted);
  }

  completeBooking() {
    if (this.menuTotal() > 0) {
      this.nextStep(); // Go to payment step
    } else {
      this.finalizeReservation();
    }
  }

  processPayment() {
    if(!this.paymentMethod()) return;
    this.bookingService.setPaymentMethod(this.paymentMethod()!);
    // Fake payment processing
    console.log('Processing payment...');
    this.finalizeReservation();
  }

  finalizeReservation() {
    const reservationId = this.bookingService.confirmReservation();
    this.router.navigate(['/confirmation', reservationId]);
  }
}