import { ChangeDetectionStrategy, Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Fix: Corrected import paths
import { BookingService } from '../../core/services/booking.service';
import { RestaurantDataService } from '../../core/services/restaurant-data.service';
import { TableService } from '../../core/services/table.service';
import { AuthService } from '../../core/services/auth.service';
import { PaymentService, PaymentRequest, PaymentResponse } from '../../core/services/payment.service';
import { NotificationService, WhatsAppNotificationRequest } from '../../core/services/notification.service';
import { MenuService } from '../../core/services/menu.service';
import { Table, MenuItem } from '../../core/models/restaurant.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CanComponentDeactivate } from '../../core/guards/can-deactivate.guard';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, FormsModule, ModalComponent, CurrencyPipe],
  templateUrl: './booking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingComponent implements CanComponentDeactivate {
  private router = inject(Router);
  bookingService = inject(BookingService);
  private restaurantDataService = inject(RestaurantDataService);
  private tableService = inject(TableService);
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);
  private notificationService = inject(NotificationService);
  private menuService = inject(MenuService);

  step = signal(1);
  
  // Tipo de reserva basado en la ruta actual
  reservationType = signal<'MESA' | 'EVENTO'>('MESA');
  
  // Control para navegación - permite salir cuando la reserva se completó
  private reservationCompleted = signal(false);
  
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
  tables = this.tableService.getTablesSignal();
  selectedTable = signal<Table | null>(null);
  
  // Step 4 signals - Menu
  menu = this.restaurantDataService.getMenu();
  
  // Menu filtering and search (Step 4)
  menuItems = this.menuService.getMenuItems();
  menuCategories = this.menuService.getCategories();
  menuLoading = this.menuService.getLoading();
  menuError = this.menuService.getError();
  selectedMenuCategory = signal<string | number>('all');
  menuSearchQuery = signal<string>('');
  
  // Computed filtered menu items
  filteredMenuItems = computed(() => {
    const query = this.menuSearchQuery();
    const category = this.selectedMenuCategory();
    
    if (query.trim()) {
      return this.menuService.searchItems(query);
    }
    
    return this.menuService.getItemsByCategory(category);
  });
  
  // Computed popular menu items
  popularMenuItems = computed(() => {
    return this.menuService.getPopularItems().slice(0, 3); // Only show top 3 popular items
  });

  // Step 5 signals - Summary & Terms
  termsAccepted = signal(false);
  isTermsModalOpen = signal(false);
  
  // Navigation guard modal
  isExitConfirmModalOpen = signal(false);
  private pendingNavigation: (() => void) | null = null;
  
  // Payment Type Selection
  paymentType = signal<'online'|'presencial'|null>(null);
  
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
    // Detectar tipo de reserva desde la URL actual
    const currentUrl = this.router.url;
    if (currentUrl.includes('/booking/evento')) {
      this.reservationType.set('EVENTO');
      console.log('🎉 Tipo de reserva detectado: EVENTO');
    } else {
      this.reservationType.set('MESA');
      console.log('🍽️ Tipo de reserva detectado: MESA');
    }
    
    this.generateAvailableDates();
    this.bookingService.resetBooking();
    this.generateYears();
    
    // Load tables from database
    this.tableService.loadTables().subscribe();
    
    // Initialize customer data from current user session
    // TODO: Replace with actual backend service call when ready
    effect(() => {
      const user = this.currentUser();
      if (user) {
        // Auto-fill customer data with current user info as default
        this.customerDocument.set(user.dni || user.documento || '');
        this.customerName.set(user.nombre +' '+ user.apellido || '');
        this.customerEmail.set(user.email || '');
        this.customerPhone.set(user.telefono || '');
      }
    });

    effect(() => {
      const time = this.selectedTime();
      const availability = this.availabilityData();
      
      if (time && availability.length > 0) {
        const selectedSlot = availability.find(slot => slot.time === time);
        if (selectedSlot && selectedSlot.tables) {
          this.tableService.updateTablesAvailability(selectedSlot.tables);
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

    // Log inicial para debug de notificaciones WhatsApp
    console.log('📱 FRONTEND: BookingComponent inicializado - listo para monitorear notificaciones WhatsApp');
    
    // Verificar disponibilidad del servicio de notificaciones
    this.checkNotificationServiceAvailability();
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
    if (this.selectedDate() && this.selectedTime()) {
      // Load available tables from database for the selected date, time and guests
      this.tableService.getAvailableTables(
        this.selectedDate(), 
        this.selectedTime(), 
        this.guests()
      ).subscribe({
        next: (availableTables) => {
          // The tables signal will be updated automatically by the service
          console.log('Available tables loaded:', availableTables);
        },
        error: (error) => {
          console.error('Error loading available tables:', error);
        }
      });
      
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
  
  // Menu search and filter methods (Step 4)
  selectMenuCategory(category: string | number): void {
    this.selectedMenuCategory.set(category);
    this.menuSearchQuery.set(''); // Clear search when selecting category
  }
  
  onMenuSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.menuSearchQuery.set(target.value);
    this.selectedMenuCategory.set('all'); // Reset category when searching
  }
  
  refreshMenuItems(): void {
    this.menuService.refreshMenuData();
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
      this.nextStep(); // Go to payment type selection step
    } else {
      this.finalizeReservation();
    }
  }

  selectPaymentType(type: 'online' | 'presencial') {
    this.paymentType.set(type);
    
    if (type === 'presencial') {
      // For presential payment, finalize reservation without payment processing
      this.finalizeReservationPresencial();
    } else {
      // For online payment, go to payment details step (step 7)
      this.nextStep();
    }
  }

  processPayment() {
    if(!this.paymentMethod()) return;
    this.bookingService.setPaymentMethod(this.paymentMethod()!);
    // Fake payment processing
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

    console.log('💳 FRONTEND: Iniciando proceso de pago con Culqi');
    console.log('📱 FRONTEND: Datos del cliente para notificación WhatsApp:', {
      customerName: this.customerName(),
      customerPhone: this.customerPhone(),
      customerEmail: this.customerEmail()
    });

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
      status: 'PENDIENTE_PAGO',
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

    // Create reservation first
    console.log('🚀 FRONTEND: Enviando datos de reserva:', reservationData);
    console.log('📱 FRONTEND: Esperando notificación WhatsApp para:', {
      customerName: reservationData.holderName,
      customerPhone: reservationData.holderPhone,
      reservationCode: 'PENDIENTE',
      paymentType: 'Digital'
    });
    this.bookingService.confirmReservation(reservationData).subscribe({
      next: (reservationResponse) => {
        console.log('✅ FRONTEND: Respuesta de confirmación de reserva recibida:', reservationResponse);
        console.log('📱 FRONTEND: Verificando si se activó notificación WhatsApp para reserva ID:', reservationResponse.id);
        
        // Enviar notificación WhatsApp
        this.sendWhatsAppNotification(reservationResponse, 'Digital');
        
        // Update payment request with reservation ID
        paymentRequest.reservationId = reservationResponse.id;
        
        // Process payment with Culqi
        this.paymentService.processPaymentWithCulqi(paymentRequest).subscribe({
          next: (paymentResponse: PaymentResponse) => {
            console.log('💳 FRONTEND: Pago procesado exitosamente:', paymentResponse);
            console.log('📱 FRONTEND: Reserva y pago completados - WhatsApp debería haber sido enviado para reserva ID:', reservationResponse.id);
            this.paymentProcessing.set(false);

            // Actualizar reserva con estado PAGADO
            this.bookingService.paidReservation(reservationResponse.id).subscribe({
              next: () => {
                console.log('✅ FRONTEND: Estado de la reserva actualizado a PAGADO');

                // Marcar reserva como completada para permitir navegación
                this.reservationCompleted.set(true);

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
              error: (err) => {
                console.error('❌ FRONTEND: Error al actualizar el estado de la reserva:', err);
                // Marcar reserva como completada de todas formas porque el pago fue exitoso
                this.reservationCompleted.set(true);
                // Navegar a la página de confirmación indicando el fallo en la actualización de estado
                this.router.navigate(['/confirmation', reservationResponse.id], {
                  queryParams: {
                    transactionId: paymentResponse.culqiChargeId,
                    amount: paymentResponse.amount,
                    status: `PAGO EXITOSO, PERO ${paymentResponse.status}`,
                    paymentSuccess: 'true',
                    statusUpdateFailed: 'true'
                  }
                });
              }
            });
          },
          error: (error) => {
            console.error('Payment failed but reservation was created:', error);
            console.log('📱 FRONTEND: Verificando si se envió notificación WhatsApp a pesar del error de pago');
            console.log('📱 FRONTEND: Reserva creada con ID:', reservationResponse.id, 'pero pago falló');
            this.paymentProcessing.set(false);
            
            // Marcar reserva como completada para permitir navegación
            this.reservationCompleted.set(true);
            
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
        console.error('❌ FRONTEND: Error en confirmación de reserva:', error);
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
      status: 'CONFIRMADO',
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

    console.log('🚀 FRONTEND finalizeReservation: Enviando datos de reserva:', resevationData);
    console.log('📱 FRONTEND finalizeReservation: Esperando notificación WhatsApp para:', {
      customerName: resevationData.holderName,
      customerPhone: resevationData.holderPhone,
      paymentMethod: resevationData.paymentMethod,
      totalAmount: this.menuTotal()
    });
    this.bookingService.confirmReservation(resevationData).subscribe({
        next: (response) => {
          console.log('✅ FRONTEND finalizeReservation: Respuesta de confirmación de reserva recibida:', response);
          console.log('📱 FRONTEND finalizeReservation: Verificando notificación WhatsApp enviada para reserva ID:', response.id);
          console.log('📱 FRONTEND finalizeReservation: Código de reserva para WhatsApp:', response.code || response.reservationCode || 'NO_CODE');
          
          // Enviar notificación WhatsApp
          this.sendWhatsAppNotification(response, this.paymentMethod() || 'Digital');
          
          // Marcar reserva como completada para permitir navegación
          this.reservationCompleted.set(true);
          
          this.router.navigate(['/confirmation', response.id]);
        },
        error: (error) => {
          console.error('❌ FRONTEND finalizeReservation: Error confirmando reserva:', error);
          // Handle error, maybe show a message to the user
        }
      }
    );
    // this.router.navigate(['/confirmation', reservationId]);
  }

  finalizeReservationPresencial() {
    // Activar indicador de procesamiento
    this.paymentProcessing.set(true);
    this.paymentError.set(null);
    
    const products = this.currentReservation().menuItems.map(item => ({
      productId: item.item.id,
      quantity: item.quantity,
      subtotal: item.item.price * item.quantity,
      observation: null
    }));
    
    const resevationData = {
      customerId: this.currentUser()?.idPersona ?? null,
      reservationDate: this.selectedDate(),
      reservationTime: this.selectedTime(),
      peopleCount: this.guests(),
      status: 'PENDIENTE_PAGO',
      paymentMethod: 'Presencial',
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
      payments: [] // No payment yet for presential payment
    };

    console.log('🚀 FRONTEND finalizeReservationPresencial: Enviando datos de reserva:', resevationData);
    console.log('📱 FRONTEND finalizeReservationPresencial: Esperando notificación WhatsApp para pago presencial:', {
      customerName: resevationData.holderName,
      customerPhone: resevationData.holderPhone,
      paymentMethod: 'Presencial',
      reservationType: resevationData.reservationType
    });
    this.bookingService.confirmReservation(resevationData).subscribe({
        next: (response) => {
          console.log('✅ FRONTEND finalizeReservationPresencial: Respuesta de confirmación de reserva recibida:', response);
          console.log('📱 FRONTEND finalizeReservacionPresencial: Verificando notificación WhatsApp para reserva presencial ID:', response.id);
          console.log('📱 FRONTEND finalizeReservationPresencial: Código de reserva:', response.code || response.reservationCode || 'NO_CODE');
          
          // Enviar notificación WhatsApp para pago presencial
          this.sendWhatsAppNotification(response, 'Presencial');
          
          // Desactivar indicador de procesamiento
          this.paymentProcessing.set(false);
          
          // Marcar reserva como completada para permitir navegación
          this.reservationCompleted.set(true);
          
          this.router.navigate(['/confirmation', response.id], {
            queryParams: {
              paymentType: 'presencial',
              amount: this.menuTotal()
            }
          });
        },
        error: (error) => {
          console.error('❌ FRONTEND finalizeReservationPresencial: Error confirmando reserva:', error);
          this.paymentProcessing.set(false);
          this.paymentError.set('Error al confirmar la reserva. Por favor, intenta nuevamente.');
        }
      }
    );
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

  availabilityData = signal<any[]>([]);

  selectCalendarDate(day: number | null) {
    if (!day || !this.isDateAvailable(day)) return;
    
    const year = this.currentCalendarYear();
    const month = this.currentCalendarMonth();
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    this.selectedDate.set(dateStr);

    this.bookingService.getAvailableTables(dateStr).subscribe({
      next: (availability) => {
        this.availabilityData.set(availability);
        const formattedTimes = availability.map(slot => ({
          time: slot.time,
          label: slot.time.substring(0, 5), // "08:00:00" -> "08:00"
          available: slot.available
        }));
        this.availableTimes.set(formattedTimes);

        // Auto-select first available time
        if (formattedTimes.some(t => t.available)) {
          const firstAvailable = formattedTimes.find(t => t.available);
          if (firstAvailable) {
            this.selectedTime.set(firstAvailable.time);
          }
        } else {
          this.selectedTime.set(''); // No available times
        }
      },
      error: (error) => {
        console.error('Error fetching available times:', error);
        this.availableTimes.set([]); // Clear times on error
      }
      });
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

  // Table selection and location methods
  getLocationGroups(): { name: string; tables: any[] }[] {
    const tables = this.tables();
    const locationGroups: { [key: string]: any[] } = {};
    
    // Group tables by location
    tables.forEach(table => {
      if (!locationGroups[table.location]) {
        locationGroups[table.location] = [];
      }
      locationGroups[table.location].push(table);
    });
    
    // Convert to array and sort by location priority (dinámico basado en las ubicaciones reales)
    const allLocations = Object.keys(locationGroups);
    
    // Definir orden de prioridad para ubicaciones conocidas, pero incluir todas las demás
    const locationPriority: { [key: string]: number } = {
      'VIP': 1,
      'Salón privado': 2,
      'Terraza': 3,
      'Zona central': 4,
      'Cerca a ventana': 5,
      'Ventana': 5,
      'Jardín': 6,
      'Zona fumadores': 7,
      'Interior': 8
    };
    
    return allLocations
      .sort((a, b) => {
        const priorityA = locationPriority[a] || 999;
        const priorityB = locationPriority[b] || 999;
        return priorityA - priorityB;
      })
      .map(location => ({
        name: location,
        tables: locationGroups[location].sort((a, b) => a.id - b.id)
      }));
  }

  getLocationIcon(location: string): string {
    const icons: { [key: string]: string } = {
      'VIP': '👑',
      'Salón privado': '🎭',
      'Terraza': '🌅',
      'Zona central': '🏢',
      'Cerca a ventana': '🪟',
      'Ventana': '🪟',
      'Jardín': '🌳',
      'Zona fumadores': '🚬',
      'Interior': '🏠'
    };
    return icons[location] || '📍';
  }

  /**
   * Envía notificación WhatsApp después de una reserva exitosa
   */
  private sendWhatsAppNotification(reservationResponse: any, paymentType: string = 'Digital'): void {
    try {
      console.log('📱 FRONTEND: Iniciando envío de notificación WhatsApp');
      
      // Detectar si tiene pre-orden de comida
      const hasPreOrder = this.currentReservation().menuItems.length > 0 && this.menuTotal() > 0;
      
      // Preparar items de la orden
      const orderItems = this.currentReservation().menuItems.map(item => ({
        productName: item.item.name,
        quantity: item.quantity,
        unitPrice: item.item.price,
        subtotal: item.item.price * item.quantity
      }));
      
      // Preparar datos para la notificación
      const notificationData: WhatsAppNotificationRequest = {
        customerName: this.customerName(),
        customerPhone: this.notificationService.formatPhoneNumber(this.customerPhone()),
        customerEmail: this.customerEmail() || 'no-disponible@marakos.pe',
        reservationCode: reservationResponse.code || reservationResponse.reservationCode || `RES-${reservationResponse.id}`,
        reservationDate: this.selectedDate(),
        reservationTime: this.selectedTime(),
        guestCount: this.guests(),
        tableInfo: `Mesa ${this.selectedTable()?.number || 'por asignar'}`,
        specialRequests: 'Sin observaciones especiales',
        paymentType: paymentType,
        paymentStatus: paymentType === 'presencial' ? 'PENDIENTE' : 'PAGADO',
        totalAmount: this.menuTotal(),
        reservationStatus: 'CONFIRMADA',
        // Nuevos campos para email mejorado con QR y monto condicional
        reservationType: this.reservationType(), // "MESA" o "EVENTO"
        reservationId: reservationResponse.id, // ID para generar QR
        hasPreOrder: hasPreOrder, // Si tiene comida pre-ordenada
        orderItems: hasPreOrder ? orderItems : [] // Detalle de productos
      };

      console.log('📱 FRONTEND: Datos de notificación preparados:', notificationData);
      console.log(`📧 Email incluirá: QR=${!!reservationResponse.id}, Monto=${hasPreOrder || this.reservationType() === 'EVENTO'}, Tipo=${this.reservationType()}`);

      // Enviar notificación
      this.notificationService.sendReservationConfirmation(notificationData).subscribe({
        next: (response) => {
          console.log('✅ FRONTEND: Notificación WhatsApp + Email enviada exitosamente:', response);
        },
        error: (error) => {
          console.error('❌ FRONTEND: Error enviando notificación WhatsApp + Email:', error);
          // La notificación falla pero no afecta el flujo principal de la reserva
        }
      });
    } catch (error) {
      console.error('❌ FRONTEND: Error preparando notificación WhatsApp:', error);
    }
  }

  /**
   * Verifica la disponibilidad del servicio de notificaciones al inicializar
   */
  private checkNotificationServiceAvailability(): void {
    this.notificationService.checkNotificationServiceHealth().subscribe({
      next: (response) => {
        console.log('✅ FRONTEND: Servicio de notificaciones disponible:', response);
      },
      error: (error) => {
        console.warn('⚠️ FRONTEND: Servicio de notificaciones no disponible:', error);
      }
    });
  }

  /**
   * Guard de navegación - previene que el usuario salga accidentalmente del proceso de reserva
   * Implementa CanComponentDeactivate
   */
  canDeactivate(): boolean | Promise<boolean> {
    // Si la reserva fue completada, permitir navegación sin confirmación
    if (this.reservationCompleted()) {
      return true;
    }

    // Si el usuario está en el paso 1 y no ha ingresado ningún dato, permitir salir
    if (this.step() === 1 && 
        !this.customerDocument() && 
        !this.customerName() && 
        !this.customerEmail() && 
        !this.customerPhone()) {
      return true;
    }

    // En cualquier otro caso, mostrar modal de confirmación
    return new Promise<boolean>((resolve) => {
      this.pendingNavigation = () => resolve(true);
      this.isExitConfirmModalOpen.set(true);
      
      // Si el usuario cierra el modal sin confirmar, resolver como false
      const checkModalClosed = () => {
        if (!this.isExitConfirmModalOpen()) {
          resolve(false);
        }
      };
    });
  }

  confirmExit(): void {
    this.isExitConfirmModalOpen.set(false);
    if (this.pendingNavigation) {
      this.pendingNavigation();
      this.pendingNavigation = null;
    }
  }

  cancelExit(): void {
    this.isExitConfirmModalOpen.set(false);
    this.pendingNavigation = null;
  }
}