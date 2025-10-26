import { ChangeDetectionStrategy, Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RestaurantDataService } from '../../core/services/restaurant-data.service';
import { AdditionalServicesService } from '../../core/services/additional-services.service';
import { MenuItem, AdditionalService } from '../../core/models/restaurant.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';

export interface EventType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string;
}

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
  maxCapacity: number;
  price: number;
}

export interface LinenColor {
  id: string;
  name: string;
  hexColor: string;
  price: number;
}

export interface EventPlanningReservation {
  // Step 1
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

  
export class EventPlanningComponent {
  // Services
  private authService = inject(AuthService);
  private router = inject(Router);
  private restaurantDataService = inject(RestaurantDataService);
  private additionalServicesService = inject(AdditionalServicesService);

  // Component state
  step = signal(1);
  availableDates = signal<string[]>([]);
  currentCalendarMonth = signal(new Date().getMonth());
  currentCalendarYear = signal(new Date().getFullYear());
  isTermsModalOpen = signal(false);

  // Mock data for events - TODO: Replace with backend service calls
  eventTypes = signal<EventType[]>([
    { id: 'cumpleanos', name: 'Cumpleaños', description: 'Celebración especial', basePrice: 150, icon: '🎂' },
    { id: 'networking', name: 'Evento de Networking', description: 'Reunión profesional', basePrice: 200, icon: '🤝' },
    { id: 'baby-shower', name: 'Baby Shower', description: 'Celebración de bebé', basePrice: 120, icon: '👶' },
    { id: 'boda', name: 'Boda', description: 'Ceremonia matrimonial', basePrice: 500, icon: '💒' }
  ]);

  eventShifts = signal<EventShift[]>([
    { id: 'almuerzo', name: 'Almuerzo', timeRange: '12:00 - 16:00', startTime: '12:00', endTime: '16:00', price: 0 },
    { id: 'tarde', name: 'Tarde', timeRange: '16:00 - 20:00', startTime: '16:00', endTime: '20:00', price: 50 },
    { id: 'noche', name: 'Noche', timeRange: '20:00 - 00:00', startTime: '20:00', endTime: '00:00', price: 100 }
  ]);

  tableDistributions = signal<TableDistribution[]>([
    { id: 'redondas', name: 'Mesas Redondas', description: 'Perfectas para conversación', maxCapacity: 8, price: 0 },
    { id: 'rectangulares', name: 'Mesas Rectangulares', description: 'Ideales para eventos formales', maxCapacity: 10, price: 25 },
    { id: 'imperial', name: 'Mesa Imperial', description: 'Una gran mesa para todos', maxCapacity: 50, price: 100 },
    { id: 'cocktail', name: 'Estilo Cocktail', description: 'Mesas altas para socializar', maxCapacity: 6, price: 50 }
  ]);

  linenColors = signal<LinenColor[]>([
    { id: 'blanco', name: 'Blanco Clásico', hexColor: '#FFFFFF', price: 0 },
    { id: 'champagne', name: 'Champagne', hexColor: '#F7E7CE', price: 15 },
    { id: 'burdeos', name: 'Burdeos', hexColor: '#800020', price: 20 },
    { id: 'azul-marino', name: 'Azul Marino', hexColor: '#000080', price: 20 },
    { id: 'dorado', name: 'Dorado', hexColor: '#FFD700', price: 30 },
    { id: 'negro', name: 'Negro Elegante', hexColor: '#000000', price: 25 }
  ]);

  // Use the same menu as booking/mesa
  menu = this.restaurantDataService.getMenu();

  // Get services from the service instead of hardcoded data
  additionalServices = this.additionalServicesService.getServices();

  // Event planning reservation state simplificado
  eventReservation = signal<EventPlanningReservation>({
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
    // Efecto para pre-llenar datos del usuario
    effect(() => {
      const user = this.authService.currentUser();
      if (user && !this.eventReservation().customerName) {
        this.eventReservation.update(reservation => ({
          ...reservation,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phone || ''
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
  updateCustomerField(field: 'customerName' | 'customerEmail' | 'customerPhone', value: string) {
    this.eventReservation.update(res => ({
      ...res,
      [field]: value
    }));
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

  updateGuestCount(count: number) {
    if (count >= 10 && count <= 150) {
      this.eventReservation.update(res => ({
        ...res,
        numberOfGuests: count
      }));
    }
  }

  increaseGuests() {
    const current = this.eventReservation().numberOfGuests;
    if (current < 150) {
      this.updateGuestCount(current + 1);
    }
  }

  decreaseGuests() {
    const current = this.eventReservation().numberOfGuests;
    if (current > 10) {
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
    return !!(res.customerName && res.customerEmail && res.customerPhone && res.eventType && res.paymentMethod);
  }

  canProceedFromStep2(): boolean {
    const res = this.eventReservation();
    return !!(res.selectedDate && res.selectedShift && res.numberOfGuests >= 10);
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

    // Base event price
    subtotal += res.eventType?.basePrice || 0;

    // Shift price
    subtotal += res.selectedShift?.price || 0;

    // Extra guests (after 50)
    if (res.numberOfGuests > 50) {
      subtotal += (res.numberOfGuests - 50) * 15;
    }

    // Table distribution
    subtotal += res.tableDistribution?.price || 0;

    // Linen color
    subtotal += res.linenColor?.price || 0;

    // Menu items
    subtotal += this.getMenuTotal();

    // Additional services
    subtotal += this.getAdditionalServicesTotal();

    return subtotal;
  }

  calculateTaxes(): number {
    return Math.round(this.calculateSubtotal() * 0.18);
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
    
    // Generate next 60 days, with deterministic availability
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i + 1); // Start from tomorrow
      
      // Use same logic as booking/mesa - deterministic availability
      const isAvailable = (i + date.getDate()) % 3 !== 0; // Every 3rd date is unavailable
      
      if (isAvailable) {
        const dateStr = date.getFullYear() + '-' + 
                       String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(date.getDate()).padStart(2, '0');
        dates.push(dateStr);
      }
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
      
      // Redirect to home
      this.router.navigate(['/']);
    }, 1000);
  }
}
