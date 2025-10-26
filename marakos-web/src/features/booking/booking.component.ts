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
  
  // Step 1 signals - Customer Details
  customerName = signal('');
  customerEmail = signal('');
  customerPhone = signal('');
  
  // Step 2 signals - Date & Time
  guests = signal(2);
  selectedDate = signal(this.getTodayDateString());
  selectedTime = signal('');
  
  // Calendar signals
  currentCalendarMonth = signal(new Date().getMonth());
  currentCalendarYear = signal(new Date().getFullYear());
  availableDates = signal<string[]>([]);
  availableTimes = signal<{ time: string; label: string; available: boolean }[]>([]);
  
  // Step 3 signals - Table Selection
  tables = this.restaurantDataService.getTables();
  selectedTable = signal<Table | null>(null);
  
  // Step 4 signals - Menu
  menu = this.restaurantDataService.getMenu();

  // Step 5 signals - Summary & Terms
  termsAccepted = signal(false);
  isTermsModalOpen = signal(false);
  
  // Step 5 signals
  paymentMethod = signal<'Tarjeta'|'Efectivo'|null>(null);
  
  currentReservation = this.bookingService.currentReservation;
  menuTotal = this.bookingService.menuTotal;
  currentUser = this.authService.currentUser;

  constructor() {
    this.generateAvailableDates();
    this.bookingService.resetBooking();
    
    // Initialize customer data from current user session
    // TODO: Replace with actual backend service call when ready
    effect(() => {
      const user = this.currentUser();
      if (user) {
        // Auto-fill customer data with current user info as default
        this.customerName.set(user.name || '');
        this.customerEmail.set(user.email || '');
        this.customerPhone.set(user.phone || ''); // TODO: Add phone to user model
      }
    });
    
    // Update available times when date or guests change
    effect(() => {
      const date = this.selectedDate();
      const guests = this.guests();
      if (date) {
        const times = this.restaurantDataService.getAvailableTimesForDate(date, guests);
        this.availableTimes.set(times);
        
        // Auto-select first available time if no time is selected
        if (!this.selectedTime() && times.some(t => t.available)) {
          const firstAvailable = times.find(t => t.available);
          if (firstAvailable) {
            this.selectedTime.set(firstAvailable.time);
          }
        }
      }
    });
    
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

  // Step 1 - Customer Details Methods
  canProceedFromStep1(): boolean {
    return !!(this.customerName() && this.customerEmail() && this.customerPhone());
  }

  // Step 2 - Date & Time Methods
  async checkAvailability() {
    // This method is no longer needed - availability is checked automatically
    // Just proceed to next step if date and time are selected
    if (this.selectedDate() && this.selectedTime()) {
      this.bookingService.setBookingDetails({ 
        date: this.selectedDate(), 
        time: this.selectedTime(), 
        guests: this.guests()
      });
      this.nextStep();
    }
  }

  canProceedFromStep2(): boolean {
    return !!(this.selectedDate() && this.selectedTime() && this.availableTimes().some(t => t.time === this.selectedTime() && t.available));
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

  updateCustomerField(field: 'name' | 'email' | 'phone', value: string) {
    // Update local signals
    if (field === 'name') this.customerName.set(value);
    if (field === 'email') this.customerEmail.set(value);
    if (field === 'phone') this.customerPhone.set(value);
    
    // TODO: Add phone support to booking service when backend is ready
    this.bookingService.setCustomerDetails({
      name: this.customerName(),
      email: this.customerEmail()
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

  // Calendar methods
  private generateAvailableDates() {
    const dates = this.restaurantDataService.generateAvailableDatesForBooking();
    this.availableDates.set(dates);
  }

  getCalendarDays(): (number | null)[] {
    const year = this.currentCalendarYear();
    const month = this.currentCalendarMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }

  isDateAvailable(day: number | null): boolean {
    if (!day) return false;
    
    const year = this.currentCalendarYear();
    const month = this.currentCalendarMonth();
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    return this.availableDates().includes(dateStr);
  }

  isDateSelected(day: number | null): boolean {
    if (!day) return false;
    
    const year = this.currentCalendarYear();
    const month = this.currentCalendarMonth();
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    return this.selectedDate() === dateStr;
  }

  selectCalendarDate(day: number | null) {
    if (!day || !this.isDateAvailable(day)) return;
    
    const year = this.currentCalendarYear();
    const month = this.currentCalendarMonth();
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    this.selectedDate.set(dateStr);
  }

  previousMonth() {
    if (this.currentCalendarMonth() === 0) {
      this.currentCalendarMonth.set(11);
      this.currentCalendarYear.update(year => year - 1);
    } else {
      this.currentCalendarMonth.update(month => month - 1);
    }
  }

  nextMonth() {
    if (this.currentCalendarMonth() === 11) {
      this.currentCalendarMonth.set(0);
      this.currentCalendarYear.update(year => year + 1);
    } else {
      this.currentCalendarMonth.update(month => month + 1);
    }
  }

  getMonthName(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[this.currentCalendarMonth()];
  }
}