import { ChangeDetectionStrategy, Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RestaurantDataService } from '../../core/services/restaurant-data.service';
import { AdditionalServicesService } from '../../core/services/additional-services.service';
import { EventTypeService, EventType } from '../../core/services/event-type.service';
import { MenuItem, AdditionalService } from '../../core/models/restaurant.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CanComponentDeactivate } from '../../core/guards/can-deactivate.guard';
import { TABLE_DISTRIBUTIONS, EVENT_SHIFTS, LINEN_COLORS, GUEST_LIMITS, DATE_CONFIG, PRICING_CONFIG } from '../../config/event-config';

export interface EventShift {
  id: string;
  name: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface TableDistribution {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
}

export interface LinenColor {
  id: string;
  name: string;
  hexColor: string;
  price: number;
  imageUrl: string;
}

export interface EventPlanningReservation {
  // Step 1
  documentType: 'DNI' | 'CARNET' | null;
  customerDocument: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: EventType | null;
  paymentMethod: 'online' | 'presencial' | null;
  
  // Step 2
  selectedDate: string;
  selectedShift: EventShift | null;
  numberOfGuests: number;
  
  // Step 3
  tableDistribution: TableDistribution | null;
  linenColor: LinenColor | null;
  includeMenu: boolean;
  menuItems: { item: MenuItem; quantity: number }[];
  
  // Step 4
  additionalServices: AdditionalService[];
  
  // Step 5 & 6
  specialRequests: string;
  termsAccepted: boolean;
  
  // Totals
  subtotal: number;
  taxes: number;
  total: number;
}

@Component({
  selector: 'app-event-planning',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './event-planning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

  
export class EventPlanningComponent implements CanComponentDeactivate {
  // Services
  private authService = inject(AuthService);
  private router = inject(Router);
  private restaurantDataService = inject(RestaurantDataService);
  private additionalServicesService = inject(AdditionalServicesService);
  private eventTypeService = inject(EventTypeService);

  // Component state
  step = signal(1);
  availableDates = signal<string[]>([]);
  currentCalendarMonth = signal(new Date().getMonth());
  currentCalendarYear = signal(new Date().getFullYear());
  isTermsModalOpen = signal(false);
  
  // Control para navegación - permite salir cuando la reserva se completó
  private eventReservationCompleted = signal(false);
  
  // Modal de confirmación de salida
  isExitConfirmModalOpen = signal(false);
  private pendingNavigation: (() => void) | null = null;

  // Variable temporal para el input de número de invitados
  guestCountInput = signal<number>(10);
  guestCountError = signal<string>('');

  // Event types from database
  eventTypes = this.eventTypeService.getEventTypesSignal();

  eventShifts = signal<EventShift[]>(EVENT_SHIFTS);

  tableDistributions = signal<TableDistribution[]>(TABLE_DISTRIBUTIONS);

  linenColors = signal<LinenColor[]>(LINEN_COLORS);

  // Use the same menu as booking/mesa
  menu = this.restaurantDataService.getMenu();

  // Get services from the service instead of hardcoded data
  additionalServices = this.additionalServicesService.getServices();

  // Variable temporal para validación de documento
  documentError = signal<string>('');

  // Event planning reservation state simplificado
  eventReservation = signal<EventPlanningReservation>({
    documentType: null,
    customerDocument: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventType: null,
    paymentMethod: null,
    selectedDate: '',
    selectedShift: null,
    numberOfGuests: 10,
    tableDistribution: null,
    linenColor: null,
    includeMenu: false,
    menuItems: [],
    additionalServices: [],
    specialRequests: '',
    termsAccepted: false,
    subtotal: 0,
    taxes: 0,
    total: 0
  });

  constructor() {
    // Cargar tipos de evento desde la base de datos
    this.eventTypeService.getEventTypes().subscribe({
      next: (types) => console.log('Tipos de evento cargados:', types),
      error: (error) => console.error('Error cargando tipos de evento:', error)
    });

    // Efecto para pre-llenar datos del usuario
    effect(() => {
      const user = this.authService.currentUser();
      if (user && !this.eventReservation().customerName) {
        const userDoc = user.dni || user.documento || '';
        // Intentar detectar el tipo de documento basado en el formato
        let docType: 'DNI' | 'CARNET' | null = null;
        if (userDoc) {
          // Si son 8 dígitos, probablemente es DNI
          if (/^\d{8}$/.test(userDoc)) {
            docType = 'DNI';
          } 
          // Si es alfanumérico de 9 caracteres, probablemente es carnet
          else if (/^[A-Z0-9]{9}$/i.test(userDoc)) {
            docType = 'CARNET';
          }
        }
        
        this.eventReservation.update(reservation => ({
          ...reservation,
          documentType: docType,
          customerDocument: userDoc,
          customerName: user.nombre + (user.apellido ? ' ' + user.apellido : ''),
          customerEmail: user.email,
          customerPhone: user.telefono || ''
        }));
      }
    }, { allowSignalWrites: true });

    // Generar fechas disponibles para eventos usando la misma lógica que booking/mesa
    const availableDates = this.generateAvailableEventDates();
    this.availableDates.set(availableDates);
  }

  nextStep() {
    // Maximum step is always 7 (payment/confirmation step)
    const maxStep = 7;
    
    if (this.step() < maxStep) {
      // Special logic for step 3 -> 4
      if (this.step() === 3 && !this.eventReservation().includeMenu) {
        // Skip menu step, go directly to services (step 5)
        this.step.set(5);
      } else {
        this.step.update(s => s + 1);
      }
    }
  }

  prevStep() {
    if (this.step() > 1) {
      // Special logic for step 5 -> 3 when menu is not included
      if (this.step() === 5 && !this.eventReservation().includeMenu) {
        // Go back to distribution step (step 3)
        this.step.set(3);
      } else {
        this.step.update(s => s - 1);
      }
    }
  }

  // Step 1 methods
  selectDocumentType(type: 'DNI' | 'CARNET') {
    this.eventReservation.update(res => ({
      ...res,
      documentType: type,
      customerDocument: '' // Limpiar el documento al cambiar tipo
    }));
    this.documentError.set('');
  }

  validateDocument(value: string): boolean {
    const docType = this.eventReservation().documentType;
    
    if (!docType) {
      this.documentError.set('⚠️ Primero selecciona el tipo de documento');
      return false;
    }

    if (!value || value.trim() === '') {
      this.documentError.set('⚠️ El documento es obligatorio');
      return false;
    }

    if (docType === 'DNI') {
      // DNI peruano: exactamente 8 dígitos
      const dniRegex = /^\d{8}$/;
      if (!dniRegex.test(value)) {
        this.documentError.set('⚠️ El DNI debe tener exactamente 8 dígitos');
        return false;
      }
    } else if (docType === 'CARNET') {
      // Carnet de extranjería: exactamente 9 caracteres alfanuméricos
      const carnetRegex = /^[A-Z0-9]{9}$/i;
      if (!carnetRegex.test(value)) {
        this.documentError.set('⚠️ El carnet debe tener exactamente 9 caracteres alfanuméricos');
        return false;
      }
    }

    this.documentError.set('');
    return true;
  }

  onDocumentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const docType = this.eventReservation().documentType;
    
    if (!docType) {
      this.documentError.set('⚠️ Primero selecciona el tipo de documento');
      input.value = '';
      this.eventReservation.update(res => ({
        ...res,
        customerDocument: ''
      }));
      return;
    }

    // Formatear según el tipo de documento
    let formattedValue = '';
    
    if (docType === 'DNI') {
      // Solo permitir números y limitar a 8 dígitos
      formattedValue = value.replace(/\D/g, '').slice(0, 8);
    } else if (docType === 'CARNET') {
      // Permitir letras y números, convertir a mayúsculas, limitar a 9 caracteres
      formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
    }

    // Si el valor formateado es diferente al ingresado, actualizar el input directamente
    if (formattedValue !== value) {
      input.value = formattedValue;
    }

    // Actualizar el valor formateado
    this.eventReservation.update(res => ({
      ...res,
      customerDocument: formattedValue
    }));

    // Validar solo si tiene contenido
    if (formattedValue) {
      this.validateDocument(formattedValue);
    } else {
      this.documentError.set('');
    }
  }

  onDocumentBlur() {
    const value = this.eventReservation().customerDocument;
    if (value) {
      this.validateDocument(value);
    }
  }

  updateCustomerField(field: 'customerDocument' | 'customerName' | 'customerEmail' | 'customerPhone', value: string) {
    this.eventReservation.update(res => ({
      ...res,
      [field]: value
    }));
  }

  getEventTypeIcon(eventTypeName: string): string {
    const name = eventTypeName.toLowerCase();
    
    if (name.includes('boda') || name.includes('matrimonio')) return '💒';
    if (name.includes('cumpleaños') || name.includes('cumpleanos')) return '🎂';
    if (name.includes('corporativo') || name.includes('empresa') || name.includes('negocio')) return '💼';
    if (name.includes('graduación') || name.includes('graduacion')) return '🎓';
    if (name.includes('baby shower') || name.includes('babyshower')) return '👶';
    if (name.includes('aniversario')) return '💑';
    if (name.includes('quinceañero') || name.includes('quinceanero') || name.includes('15')) return '👑';
    if (name.includes('conferencia') || name.includes('seminario')) return '📊';
    if (name.includes('fiesta') || name.includes('celebración') || name.includes('celebracion')) return '🎉';
    if (name.includes('reunión') || name.includes('reunion')) return '🤝';
    if (name.includes('navidad')) return '🎄';
    if (name.includes('año nuevo')) return '🎆';
    
    return '🎊'; // Icono por defecto
  }

  selectEventType(eventType: EventType) {
    this.eventReservation.update(res => ({
      ...res,
      eventType
    }));
  }

  selectPaymentMethod(method: 'online' | 'presencial') {
    this.eventReservation.update(res => ({
      ...res,
      paymentMethod: method
    }));
  }

  // Step 2 methods
  selectDate(date: string) {
    this.eventReservation.update(res => ({
      ...res,
      selectedDate: date
    }));
  }

  selectShift(shift: EventShift) {
    this.eventReservation.update(res => ({
      ...res,
      selectedShift: shift
    }));
  }

  onGuestCountInput(value: string) {
    const count = Number(value);
    this.guestCountInput.set(count);
    
    // Validación en tiempo real sin actualizar el estado aún
    if (isNaN(count) || value === '') {
      this.guestCountError.set('');
      return;
    }
    
    if (count < GUEST_LIMITS.MIN) {
      this.guestCountError.set(`⚠️ El mínimo es de ${GUEST_LIMITS.MIN} invitados`);
    } else if (count > GUEST_LIMITS.MAX) {
      this.guestCountError.set(`⚠️ El límite máximo es de ${GUEST_LIMITS.MAX} invitados`);
    } else {
      this.guestCountError.set('');
      this.eventReservation.update(res => ({
        ...res,
        numberOfGuests: count
      }));
    }
  }

  onGuestCountBlur() {
    let count = this.guestCountInput();
    
    // Validar y corregir al salir del campo
    if (isNaN(count) || count < GUEST_LIMITS.MIN) {
      count = GUEST_LIMITS.MIN;
      this.guestCountError.set('');
    } else if (count > GUEST_LIMITS.MAX) {
      count = GUEST_LIMITS.MAX;
      this.guestCountError.set('');
    }
    
    this.guestCountInput.set(count);
    this.eventReservation.update(res => ({
      ...res,
      numberOfGuests: count
    }));
  }

  updateGuestCount(count: number) {
    // Validar que sea un número válido
    if (isNaN(count) || count < GUEST_LIMITS.MIN) {
      count = GUEST_LIMITS.MIN;
    }
    
    if (count > GUEST_LIMITS.MAX) {
      count = GUEST_LIMITS.MAX;
    }
    
    this.guestCountInput.set(count);
    this.guestCountError.set('');
    this.eventReservation.update(res => ({
      ...res,
      numberOfGuests: count
    }));
  }

  increaseGuests() {
    const current = this.eventReservation().numberOfGuests;
    if (current < GUEST_LIMITS.MAX) {
      this.updateGuestCount(current + 1);
    }
  }

  decreaseGuests() {
    const current = this.eventReservation().numberOfGuests;
    if (current > GUEST_LIMITS.MIN) {
      this.updateGuestCount(current - 1);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    };
    return date.toLocaleDateString('es-ES', options);
  }

  // Calendar methods - homologated with booking/mesa
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
    
    return this.eventReservation().selectedDate === dateStr;
  }

  selectCalendarDate(day: number | null) {
    if (!day || !this.isDateAvailable(day)) return;
    
    const year = this.currentCalendarYear();
    const month = this.currentCalendarMonth();
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    this.eventReservation.update(res => ({
      ...res,
      selectedDate: dateStr
    }));
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

  // Helper method for template
  currentUser() {
    return this.authService.currentUser();
  }

  getStepLabels(): string[] {
    const baseSteps = ['Datos', 'Fecha', 'Distribución'];
    if (this.eventReservation().includeMenu) {
      return [...baseSteps, 'Menú', 'Servicios', 'Resumen', 'Pago'];
    } else {
      return [...baseSteps, 'Servicios', 'Resumen', 'Pago'];
    }
  }

  /**
   * Maps the current step number to the corresponding label index
   */
  getStepLabelIndex(currentStep: number): number {
    if (this.eventReservation().includeMenu) {
      // With menu: steps 1,2,3,4,5,6,7 map directly to indices 0,1,2,3,4,5,6
      return currentStep - 1;
    } else {
      // Without menu: steps 1,2,3,5,6,7 map to indices 0,1,2,3,4,5
      if (currentStep <= 3) {
        return currentStep - 1; // Steps 1,2,3 -> indices 0,1,2
      } else {
        return currentStep - 2; // Steps 5,6,7 -> indices 3,4,5
      }
    }
  }

  /**
   * Checks if a step label should be highlighted based on current progress
   */
  isStepCompleted(labelIndex: number): boolean {
    const currentLabelIndex = this.getStepLabelIndex(this.step());
    return currentLabelIndex >= labelIndex;
  }

  // Validation methods
  canProceedFromStep1(): boolean {
    const res = this.eventReservation();
    const hasValidDocument = res.documentType && res.customerDocument && this.documentError() === '';
    return !!(hasValidDocument && res.customerName && res.customerEmail && res.customerPhone && res.eventType && res.paymentMethod);
  }

  canProceedFromStep2(): boolean {
    const res = this.eventReservation();
    return !!(res.selectedDate && res.selectedShift && res.numberOfGuests >= GUEST_LIMITS.MIN);
  }

  // Step 3 methods
  selectTableDistribution(distribution: TableDistribution) {
    this.eventReservation.update(res => ({
      ...res,
      tableDistribution: distribution
    }));
  }

  selectLinenColor(color: LinenColor) {
    this.eventReservation.update(res => ({
      ...res,
      linenColor: color
    }));
  }

  toggleMenu(include: boolean) {
    this.eventReservation.update(res => ({
      ...res,
      includeMenu: include,
      menuItems: include ? res.menuItems : []
    }));
  }

  toggleMenuIncluded() {
    const currentValue = this.eventReservation().includeMenu;
    this.toggleMenu(!currentValue);
  }

  getMenuItemQuantity(item: MenuItem): number {
    const found = this.eventReservation().menuItems.find(mi => mi.item.id === item.id);
    return found ? found.quantity : 0;
  }

  // Use same method names as booking/mesa for consistency
  addMenuItemToBooking(item: MenuItem) {
    this.eventReservation.update(res => {
      const existingIndex = res.menuItems.findIndex(mi => mi.item.id === item.id);
      
      if (existingIndex >= 0) {
        const updated = [...res.menuItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return { ...res, menuItems: updated };
      } else {
        return {
          ...res,
          menuItems: [...res.menuItems, { item, quantity: 1 }]
        };
      }
    });
  }

  removeMenuItemFromBooking(itemId: number) {
    this.eventReservation.update(res => {
      const existingIndex = res.menuItems.findIndex(mi => mi.item.id === itemId);
      
      if (existingIndex >= 0) {
        const currentQuantity = res.menuItems[existingIndex].quantity;
        
        if (currentQuantity <= 1) {
          // Remove item if quantity becomes 0
          return {
            ...res,
            menuItems: res.menuItems.filter(mi => mi.item.id !== itemId)
          };
        } else {
          // Decrease quantity
          const updated = [...res.menuItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: currentQuantity - 1
          };
          return { ...res, menuItems: updated };
        }
      }
      
      return res;
    });
  }

  // Add compatibility method for booking/mesa pattern
  getItemQuantity(itemId: number): number {
    return this.eventReservation().menuItems.find(i => i.item.id === itemId)?.quantity ?? 0;
  }

  canProceedFromStep3(): boolean {
    const res = this.eventReservation();
    // Only require table distribution and linen color selection
    return !!(res.tableDistribution && res.linenColor);
  }

  canProceedFromStep4(): boolean {
    const res = this.eventReservation();
    // If menu is included, must have at least one menu item selected
    if (res.includeMenu) {
      return res.menuItems.length > 0;
    }
    // If menu not included, can always proceed
    return true;
  }

  // Step 4 methods
  getServicesByCategory(category: 'entertainment' | 'service' | 'catering'): AdditionalService[] {
    return this.additionalServicesService.getServicesByCategory(category);
  }

  isServiceSelected(service: AdditionalService): boolean {
    return this.eventReservation().additionalServices.some(s => s.id === service.id);
  }

  toggleAdditionalService(service: AdditionalService) {
    this.eventReservation.update(res => {
      const isCurrentlySelected = res.additionalServices.some(s => s.id === service.id);
      
      if (isCurrentlySelected) {
        // Remove service
        return {
          ...res,
          additionalServices: res.additionalServices.filter(s => s.id !== service.id)
        };
      } else {
        // Add service
        return {
          ...res,
          additionalServices: [...res.additionalServices, service]
        };
      }
    });
  }

  getAdditionalServicesTotal(): number {
    return this.eventReservation().additionalServices.reduce((total, service) => total + service.price, 0);
  }

  // Step 5 methods
  updateSpecialRequests(requests: string) {
    this.eventReservation.update(res => ({
      ...res,
      specialRequests: requests
    }));
  }

  toggleTerms(accepted: boolean) {
    this.eventReservation.update(res => ({
      ...res,
      termsAccepted: accepted
    }));
  }

  getMenuTotal(): number {
    return this.eventReservation().menuItems.reduce((total, menuItem) => 
      total + (menuItem.item.price * menuItem.quantity), 0
    );
  }

  calculateSubtotal(): number {
    const res = this.eventReservation();
    let subtotal = 0;

    // Note: Event type no longer has a base price from database
    
    // Shift price
    subtotal += res.selectedShift?.price || 0;

    // Extra guests (after threshold)
    if (res.numberOfGuests > PRICING_CONFIG.EXTRA_GUEST_THRESHOLD) {
      subtotal += (res.numberOfGuests - PRICING_CONFIG.EXTRA_GUEST_THRESHOLD) * PRICING_CONFIG.EXTRA_GUEST_PRICE;
    }

    // Table distribution - No price (visual selection only)
    // subtotal += 0;

    // Linen color - Free value-added service
    // subtotal += 0;

    // Menu items
    subtotal += this.getMenuTotal();

    // Additional services
    subtotal += this.getAdditionalServicesTotal();

    return subtotal;
  }

  calculateTaxes(): number {
    return Math.round(this.calculateSubtotal() * PRICING_CONFIG.TAX_RATE);
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTaxes();
  }

  canProceedFromStep5(): boolean {
    return this.eventReservation().termsAccepted;
  }

  canProceedFromStep6(): boolean {
    return this.eventReservation().termsAccepted;
  }

  // Step 6 methods
  getDepositAmount(): number {
    return Math.round(this.calculateTotal() * 0.5);
  }

  getFullPaymentAmount(): number {
    return Math.round(this.calculateTotal() * 0.95);
  }

  getRemainingAmount(): number {
    return this.calculateTotal() - this.getDepositAmount();
  }

  generateAvailableEventDates(): string[] {
    const dates: string[] = [];
    const today = new Date();
    
    // Generate next N days, all dates available for events
    for (let i = 0; i < DATE_CONFIG.DAYS_AHEAD; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i + DATE_CONFIG.START_OFFSET);
      
      // All dates are available for events
      const dateStr = date.getFullYear() + '-' + 
                     String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(date.getDate()).padStart(2, '0');
      dates.push(dateStr);
    }
    
    return dates;
  }

  processPayment() {
    // Simulate payment processing
    const reservation = this.eventReservation();
    const total = this.calculateTotal();
    
    // Update totals in reservation
    this.eventReservation.update(res => ({
      ...res,
      subtotal: this.calculateSubtotal(),
      taxes: this.calculateTaxes(),
      total: total
    }));

    // Simulate payment processing delay
    setTimeout(() => {
      alert(`🎉 ¡Pago procesado exitosamente!\n\nMonto: S/ ${this.getDepositAmount()}\nReserva confirmada para: ${this.formatDate(reservation.selectedDate)}\n\nTe enviaremos un email de confirmación.`);
      
      // Marcar reserva como completada para permitir navegación
      this.eventReservationCompleted.set(true);
      
      // Redirect to confirmation or home
      this.router.navigate(['/']);
    }, 1500);
  }

  confirmPresentialReservation() {
    // Update totals in reservation
    this.eventReservation.update(res => ({
      ...res,
      subtotal: this.calculateSubtotal(),
      taxes: this.calculateTaxes(),
      total: this.calculateTotal()
    }));

    // Simulate reservation confirmation
    setTimeout(() => {
      alert(`📝 ¡Reserva confirmada!\n\nTienes 48 horas para realizar el pago del depósito.\nTotal a pagar en local: S/ ${this.getDepositAmount()}\n\nTe enviaremos un email con todos los detalles.`);
      
      // Marcar reserva como completada para permitir navegación
      this.eventReservationCompleted.set(true);
      
      // Redirect to home
      this.router.navigate(['/']);
    }, 1000);
  }

  /**
   * Guard de navegación - previene que el usuario salga accidentalmente del proceso de reserva de evento
   * Implementa CanComponentDeactivate
   */
  canDeactivate(): boolean | Promise<boolean> {
    // Si la reserva fue completada, permitir navegación sin confirmación
    if (this.eventReservationCompleted()) {
      return true;
    }

    // Si el usuario está en el paso 1 y no ha seleccionado tipo de evento, permitir salir
    const reservation = this.eventReservation();
    if (this.step() === 1 && !reservation.eventType && !reservation.customerName) {
      return true;
    }

    // En cualquier otro caso, mostrar modal de confirmación
    return new Promise<boolean>((resolve) => {
      this.pendingNavigation = () => resolve(true);
      this.isExitConfirmModalOpen.set(true);
    });
  }
  
  /**
   * Confirma la salida y permite la navegación
   */
  confirmExit() {
    this.isExitConfirmModalOpen.set(false);
    if (this.pendingNavigation) {
      this.pendingNavigation();
      this.pendingNavigation = null;
    }
  }
  
  /**
   * Cancela la salida y permanece en la página
   */
  cancelExit() {
    this.isExitConfirmModalOpen.set(false);
    this.pendingNavigation = null;
  }
}
