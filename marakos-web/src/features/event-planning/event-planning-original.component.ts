import { ChangeDetectionStrategy, Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MenuItem } from '../../core/models/restaurant.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { RestaurantDataService } from '../../core/services/restaurant-data.service';

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
  imageUrl: string;
}

export interface LinenColor {
  id: string;
  name: string;
  hexColor: string;
  price: number;
}

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'entertainment' | 'service' | 'catering';
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
  styleUrl: './event-planning.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventPlanningComponent {
  private router = inject(Router);
  private restaurantDataService = inject(RestaurantDataService);
  private authService = inject(AuthService);

  step = signal(1);
  
  // Mock data - To be replaced with real services
  eventTypes = signal<EventType[]>([
    { id: 'cumpleanos', name: 'Cumpleaños', description: 'Celebración especial', basePrice: 150, icon: '🎂' },
    { id: 'networking', name: 'Evento de Networking', description: 'Reunión profesional', basePrice: 200, icon: '🤝' },
    { id: 'baby-shower', name: 'Baby Shower', description: 'Celebración de bebé', basePrice: 120, icon: '👶' },
    { id: 'boda', name: 'Boda', description: 'Ceremonia matrimonial', basePrice: 500, icon: '💒' },
    { id: 'aniversario', name: 'Aniversario', description: 'Celebración de aniversario', basePrice: 180, icon: '💕' },
    { id: 'comunion', name: 'Comunión/Bautizo', description: 'Ceremonia religiosa', basePrice: 160, icon: '🕊️' }
  ]);

  eventShifts = signal<EventShift[]>([
    { id: 'morning', name: 'Mañana', timeRange: '9:00 AM - 12:00 PM', startTime: '09:00', endTime: '12:00', price: 100 },
    { id: 'afternoon', name: 'Tarde', timeRange: '2:00 PM - 6:00 PM', startTime: '14:00', endTime: '18:00', price: 150 },
    { id: 'evening', name: 'Noche', timeRange: '8:00 PM - 12:00 AM', startTime: '20:00', endTime: '00:00', price: 200 },
    { id: 'all-day', name: 'Todo el día', timeRange: '9:00 AM - 12:00 AM', startTime: '09:00', endTime: '00:00', price: 400 }
  ]);

  tableDistributions = signal<TableDistribution[]>([
    { id: 'banquet', name: 'Banquete', description: 'Mesas rectangulares en filas', maxCapacity: 100, price: 50, imageUrl: '/assets/tables/banquet.jpg' },
    { id: 'half-moon', name: 'Media Luna', description: 'Disposición en semicírculo', maxCapacity: 80, price: 60, imageUrl: '/assets/tables/half-moon.jpg' },
    { id: 'auditorium', name: 'Auditorio', description: 'Filas mirando al frente', maxCapacity: 100, price: 40, imageUrl: '/assets/tables/auditorium.jpg' },
    { id: 'horseshoe', name: 'Herradura', description: 'Forma de herradura', maxCapacity: 60, price: 70, imageUrl: '/assets/tables/horseshoe.jpg' },
    { id: 'classroom', name: 'Escuela', description: 'Mesas individuales', maxCapacity: 50, price: 45, imageUrl: '/assets/tables/classroom.jpg' },
    { id: 'imperial', name: 'Imperial', description: 'Mesa principal central', maxCapacity: 40, price: 80, imageUrl: '/assets/tables/imperial.jpg' },
    { id: 'russian', name: 'Ruso', description: 'Mesas redondas distribuidas', maxCapacity: 90, price: 65, imageUrl: '/assets/tables/russian.jpg' }
  ]);

  linenColors = signal<LinenColor[]>([
    { id: 'green', name: 'Verde', hexColor: '#22c55e', price: 25 },
    { id: 'fuchsia', name: 'Fucsia', hexColor: '#e879f9', price: 25 },
    { id: 'champagne', name: 'Champagne', hexColor: '#fbbf24', price: 30 },
    { id: 'navy', name: 'Azul Noche', hexColor: '#1e40af', price: 30 }
  ]);

  additionalServices = signal<AdditionalService[]>([
    { id: 'dj', name: 'DJ', description: 'Servicio de DJ profesional', price: 300, icon: '🎧', category: 'entertainment' },
    { id: 'waiters', name: 'Mozos', description: 'Servicio de mozos adicionales', price: 150, icon: '🤵', category: 'service' },
    { id: 'bartender', name: 'Bartender', description: 'Servicio de bartender profesional', price: 200, icon: '🍸', category: 'catering' },
    { id: 'photographer', name: 'Fotógrafo', description: 'Servicio de fotografía profesional', price: 250, icon: '📸', category: 'entertainment' },
    { id: 'decorator', name: 'Decorador', description: 'Servicio de decoración del evento', price: 180, icon: '🎨', category: 'entertainment' },
    { id: 'security', name: 'Seguridad', description: 'Servicio de seguridad para el evento', price: 120, icon: '🛡️', category: 'service' }
  ]);

  menu = this.restaurantDataService.getMenu();
  currentUser = this.authService.currentUser;

  // Calendar
  currentCalendarMonth = signal(new Date().getMonth());
  currentCalendarYear = signal(new Date().getFullYear());
  selectedDate = signal('');
  availableDates = signal<string[]>([]);

  // Modal states
  isTermsModalOpen = signal(false);
  isMenuModalOpen = signal(false);

  // Event planning reservation state
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
    // Pre-fill user data if logged in
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.eventReservation.update(reservation => ({
          ...reservation,
          customerName: user.name,
          customerEmail: user.email
        }));
      }
    });

    // Calculate totals whenever reservation changes
    effect(() => {
      this.calculateTotals();
    });

    // Generate available dates
    this.generateAvailableDates();
  }

  private generateAvailableDates() {
    // Generate next 60 days as available (mock data)
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip Mondays (restaurant closed)
      if (date.getDay() !== 1) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    this.availableDates.set(dates);
  }

  private calculateTotals() {
    const reservation = this.eventReservation();
    let subtotal = 0;

    // Base event type price
    if (reservation.eventType) {
      subtotal += reservation.eventType.basePrice;
    }

    // Shift price
    if (reservation.selectedShift) {
      subtotal += reservation.selectedShift.price;
    }

    // Table distribution price
    if (reservation.tableDistribution) {
      subtotal += reservation.tableDistribution.price;
    }

    // Linen color price
    if (reservation.linenColor) {
      subtotal += reservation.linenColor.price;
    }

    // Menu items
    subtotal += reservation.menuItems.reduce((total, orderItem) => 
      total + (orderItem.item.price * orderItem.quantity), 0
    );

    // Additional services
    subtotal += reservation.additionalServices.reduce((total, service) => 
      total + service.price, 0
    );

    const taxes = subtotal * 0.18; // 18% tax
    const total = subtotal + taxes;

    this.eventReservation.update(res => ({
      ...res,
      subtotal,
      taxes,
      total
    }));
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

  // Step 1 methods
  updateCustomerField(field: keyof Pick<EventPlanningReservation, 'customerName' | 'customerEmail' | 'customerPhone'>, value: string) {
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
    this.selectedDate.set(date);
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
    this.eventReservation.update(res => ({
      ...res,
      numberOfGuests: count
    }));
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

  toggleMenuIncluded() {
    this.eventReservation.update(res => ({
      ...res,
      includeMenu: !res.includeMenu,
      menuItems: res.includeMenu ? [] : res.menuItems // Clear menu if being disabled
    }));
  }

  addMenuItemToEvent(item: MenuItem) {
    const currentItems = this.eventReservation().menuItems;
    const existingItem = currentItems.find(i => i.item.id === item.id);
    
    if (existingItem) {
      this.eventReservation.update(res => ({
        ...res,
        menuItems: res.menuItems.map(i => 
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }));
    } else {
      this.eventReservation.update(res => ({
        ...res,
        menuItems: [...res.menuItems, { item, quantity: 1 }]
      }));
    }
  }

  removeMenuItemFromEvent(itemId: number) {
    this.eventReservation.update(res => ({
      ...res,
      menuItems: res.menuItems.map(i => 
        i.item.id === itemId ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
      ).filter(i => i.quantity > 0)
    }));
  }

  getMenuItemQuantity(itemId: number): number {
    return this.eventReservation().menuItems.find(i => i.item.id === itemId)?.quantity ?? 0;
  }

  // Step 4 methods
  toggleAdditionalService(service: AdditionalService) {
    const currentServices = this.eventReservation().additionalServices;
    const isSelected = currentServices.some(s => s.id === service.id);
    
    if (isSelected) {
      this.eventReservation.update(res => ({
        ...res,
        additionalServices: res.additionalServices.filter(s => s.id !== service.id)
      }));
    } else {
      this.eventReservation.update(res => ({
        ...res,
        additionalServices: [...res.additionalServices, service]
      }));
    }
  }

  isServiceSelected(serviceId: string): boolean {
    return this.eventReservation().additionalServices.some(s => s.id === serviceId);
  }

  // Step 5 methods
  updateSpecialRequests(event: Event) {
    const requests = (event.target as HTMLTextAreaElement).value;
    this.eventReservation.update(res => ({
      ...res,
      specialRequests: requests
    }));
  }

  updateTermsAccepted(event: Event) {
    const accepted = (event.target as HTMLInputElement).checked;
    this.eventReservation.update(res => ({
      ...res,
      termsAccepted: accepted
    }));
  }

  // Step 6 methods
  processEventPayment() {
    const reservation = this.eventReservation();
    
    if (reservation.paymentMethod === 'online') {
      // Simulate Culqi integration
      console.log('Processing payment with Culqi...', reservation);
      this.finalizeEventReservation();
    } else {
      // Process presencial payment
      this.finalizeEventReservation();
    }
  }

  finalizeEventReservation() {
    // Generate reservation ID and navigate to confirmation
    const reservationId = 'EVT-' + Date.now();
    console.log('Event reservation finalized:', this.eventReservation());
    
    // Simulate WhatsApp notification
    console.log('Sending WhatsApp notification...');
    
    // Navigate to confirmation page
    this.router.navigate(['/confirmation', reservationId]);
  }

  // Calendar methods
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
    
    this.selectDate(dateStr);
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

  // Validation methods
  canProceedFromStep1(): boolean {
    const res = this.eventReservation();
    return !!(res.customerName && res.customerEmail && res.customerPhone && res.eventType && res.paymentMethod);
  }

  canProceedFromStep2(): boolean {
    const res = this.eventReservation();
    return !!(res.selectedDate && res.selectedShift && res.numberOfGuests >= 1);
  }

  canProceedFromStep3(): boolean {
    const res = this.eventReservation();
    return !!(res.tableDistribution && res.linenColor);
  }

  canProceedFromStep5(): boolean {
    const res = this.eventReservation();
    return res.termsAccepted;
  }
}