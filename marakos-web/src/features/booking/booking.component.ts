import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Fix: Corrected import paths
import { BookingService } from '../../core/services/booking.service';
import { RestaurantDataService } from '../../core/services/restaurant-data.service';
import { AuthService } from '../../core/services/auth.service';
import { PaymentService, PaymentRequest, PaymentResponse } from '../../core/services/payment.service';
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
  private paymentService = inject(PaymentService);

  step = signal(1);
  
  // Step 1 signals - Customer Details
  customerDocument = signal('');
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
  
  // Step 6 signals - Payment
  paymentMethod = signal<'Tarjeta'|'Efectivo'|null>(null);
  cardNumber = signal('');
  expirationMonth = signal('');
  expirationYear = signal('');
  cvv = signal('');
  paymentProcessing = signal(false);
  paymentError = signal<string | null>(null);
  
  currentReservation = this.bookingService.currentReservation;
  menuTotal = this.bookingService.menuTotal;
  currentUser = this.authService.currentUser;

  // Helper data for dropdowns
  months = [
    { value: '01', label: '01 - Enero' },
    { value: '02', label: '02 - Febrero' },
    { value: '03', label: '03 - Marzo' },
    { value: '04', label: '04 - Abril' },
    { value: '05', label: '05 - Mayo' },
    { value: '06', label: '06 - Junio' },
    { value: '07', label: '07 - Julio' },
    { value: '08', label: '08 - Agosto' },
    { value: '09', label: '09 - Septiembre' },
    { value: '10', label: '10 - Octubre' },
    { value: '11', label: '11 - Noviembre' },
    { value: '12', label: '12 - Diciembre' }
  ];

  years: string[] = [];

  constructor() {
    this.generateAvailableDates();
    this.bookingService.resetBooking();
    this.generateYears();
    
    // Initialize customer data from current user session
    // TODO: Replace with actual backend service call when ready
    effect(() => {
      console.log("Effect called Ingreso a la pantalla de reserva de mesa")
      const user = this.currentUser();
      if (user) {
        // Auto-fill customer data with current user info as default
        this.customerName.set(user.nombre +' '+ user.apellido || '');
        this.customerEmail.set(user.email || '');
        this.customerPhone.set(user.telefono || ''); // TODO: Add phone to user model
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
        this.bookingService.setCustomerDetails({ name: user.nombre, email: user.email });
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
    return !!(this.customerDocument() && this.customerName() && this.customerEmail() && this.customerPhone());
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

  updateCustomerField(field: 'document' | 'name' | 'email' | 'phone', value: string) {
    // Update local signals
    if (field === 'document') this.customerDocument.set(value);
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

  // Payment-related methods
  private generateYears() {
    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let i = 0; i <= 10; i++) {
      this.years.push((currentYear + i).toString());
    }
  }

  updateCardNumber(value: string) {
    // Format card number with spaces
    const formatted = this.paymentService.formatCardNumber(value);
    this.cardNumber.set(formatted);
  }

  isCardNumberValid(): boolean {
    return this.paymentService.validateCardNumber(this.cardNumber());
  }

  getCardType(): string {
    if (!this.cardNumber()) return '';
    return this.paymentService.getCardType(this.cardNumber());
  }

  isCvvValid(): boolean {
    if (!this.cvv()) return false;
    return this.paymentService.validateCVV(this.cvv(), this.getCardType());
  }

  isExpirationValid(): boolean {
    if (!this.expirationMonth() || !this.expirationYear()) return false;
    return this.paymentService.validateExpirationDate(this.expirationMonth(), this.expirationYear());
  }

  isPaymentFormValid(): boolean {
    return this.isCardNumberValid() && 
           this.isCvvValid() && 
           this.isExpirationValid() &&
           !!this.customerName() &&
           !!this.customerEmail() &&
           !!this.customerPhone();
  }

  clearPaymentError() {
    this.paymentError.set(null);
  }

  processPaymentWithCulqi() {
    if (!this.isPaymentFormValid()) {
      this.paymentError.set('Por favor complete todos los campos correctamente.');
      return;
    }

    this.paymentProcessing.set(true);
    this.paymentError.set(null);

    // Prepare payment request
    const paymentRequest: PaymentRequest = {
      reservationId: 0, // Will be set after reservation creation
      amount: this.menuTotal(),
      customerEmail: this.customerEmail(),
      customerName: this.customerName(),
      customerPhone: this.customerPhone(),
      paymentMethod: 'Tarjeta', // Set as card payment
      cardNumber: this.cardNumber().replace(/\s/g, ''), // Remove spaces
      cvv: this.cvv(),
      expirationMonth: this.expirationMonth(),
      expirationYear: this.expirationYear()
    };

    // First create the reservation, then process payment
    this.createReservationAndProcessPayment(paymentRequest);
  }

  private createReservationAndProcessPayment(paymentRequest: PaymentRequest) {
    const products = this.currentReservation().menuItems.map(item => ({
      productId: item.item.id,
      quantity: item.quantity,
      subtotal: item.item.price * item.quantity,
      observation: null
    }));
    
    const paymentDate = this.selectedDate() + 'T' + this.selectedTime();

    const reservationData = {
      customerId: this.currentUser()?.idPersona ?? null,
      reservationDate: this.selectedDate(),
      reservationTime: this.selectedTime(),
      peopleCount: this.guests(),
      status: 'PENDIENTE',
      paymentMethod: 'Digital',
      reservationType: 'MESA',
      eventTypeId: null,
      eventShift: null,
      tableDistributionType: null,
      tableClothColor: null,
      holderDocument: this.customerDocument(),
      holderPhone: this.customerPhone(),
      holderName: this.customerName(),
      holderEmail: this.customerEmail(),
      observation: this.currentReservation().specialRequests,
      employeeId: null,
      createdBy: this.currentUser()?.idUsuario ?? null,
      tables: [
        { tableId: this.currentReservation().table?.id }
      ],
      products: products,
      events: null,
      payments: [] // Will be updated after payment processing
    };

    console.log('Creating reservation with payment...', reservationData);

    // Create reservation first
    this.bookingService.confirmReservation(reservationData).subscribe({
      next: (reservationResponse) => {
        console.log('Reservation created successfully:', reservationResponse);
        
        // Update payment request with reservation ID
        paymentRequest.reservationId = reservationResponse.id;
        
        // Process payment with Culqi
        this.paymentService.processPaymentWithCulqi(paymentRequest).subscribe({
          next: (paymentResponse: PaymentResponse) => {
            console.log('Payment processed successfully:', paymentResponse);
            this.paymentProcessing.set(false);
            
            // Navigate to confirmation page with payment success details
            this.router.navigate(['/confirmation', reservationResponse.id], {
              queryParams: {
                transactionId: paymentResponse.culqiChargeId,
                amount: paymentResponse.amount,
                status: paymentResponse.status,
                paymentSuccess: 'true'
              }
            });
          },
          error: (error) => {
            console.error('Payment failed but reservation was created:', error);
            this.paymentProcessing.set(false);
            
            // Important: Don't navigate multiple times
            // Only navigate once with payment failure information
            this.router.navigate(['/confirmation', reservationResponse.id], {
              queryParams: {
                paymentFailed: 'true',
                paymentError: error.userMessage || 'Error procesando el pago',
                reservationCreated: 'true'
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
        this.paymentProcessing.set(false);
        this.paymentError.set('Error creando la reserva. Intente nuevamente.');
        // Don't navigate on reservation creation error
      }
    });
  }

  finalizeReservation() {
    const products = this.currentReservation().menuItems.map(item => ({
      productId: item.item.id,
      quantity: item.quantity,
      subtotal: item.item.price * item.quantity,
      observation: null
    }));
    console.log('productos', products);
    
    const paymentDate = this.selectedDate()+'T'+this.selectedTime();

    const resevationData = {
      customerId: this.currentUser()?.idPersona ?? null,
      reservationDate: this.selectedDate(),
      reservationTime: this.selectedTime(),
      peopleCount: this.guests(),
      status: 'PENDIENTE',
      paymentMethod: 'Digital',
      reservationType: 'MESA',
      eventTypeId: null,
      eventShift: null,
      tableDistributionType: null,
      tableClothColor: null,
      holderDocument: this.customerDocument(),
      holderPhone: this.customerPhone(),
      holderName: this.customerName(),
      holderEmail: this.customerEmail(),
      observation: this.currentReservation().specialRequests,
      employeeId: null,
      createdBy: this.currentUser()?.idUsuario ?? null,
      tables: [
        { tableId: this.currentReservation().table?.id }
      ],
      products: products,
      // events: [
      //   { serviceId: 2, quantity: 1, subtotal: 150.00, observation: null },
      //   { serviceId: 3, quantity: 1, subtotal: 200.00, observation: null }
      // ],
      events: null,
      payments: [ 
        { paymentDate: paymentDate, paymentMethod: this.paymentMethod(), amount: this.menuTotal(), status: 'PAGADO', externalTransactionId: null, createdBy: this.currentUser()?.idUsuario ?? null }
      ]
    };
    console.log('resevationData', resevationData);

    this.bookingService.confirmReservation(resevationData).subscribe({
        next: (response) => {
          console.log('Reservation confirmed successfully:', response);
          this.router.navigate(['/confirmation', response.id]);
        },
        error: (error) => {
          console.error('Error confirming reservation:', error);
          // Handle error, maybe show a message to the user
        }
      }
    );
    // this.router.navigate(['/confirmation', reservationId]);
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