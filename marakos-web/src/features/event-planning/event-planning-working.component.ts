import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export interface EventPlanningReservation {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: EventType | null;
  paymentMethod: 'online' | 'presencial' | null;
  selectedDate: string;
  selectedShift: EventShift | null;
  numberOfGuests: number;
  tableDistribution: TableDistribution | null;
  linenColor: LinenColor | null;
  includeMenu: boolean;
  additionalServices: AdditionalService[];
  specialRequests: string;
  termsAccepted: boolean;
  subtotal: number;
  taxes: number;
  total: number;
}

@Component({
  selector: 'app-event-planning',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-planning.component.html',
  styleUrl: './event-planning.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventPlanningComponent {
  step = signal(1);
  
  // Mock data
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
    { id: 'banquet', name: 'Banquete', description: 'Mesas rectangulares en filas', maxCapacity: 100, price: 50 },
    { id: 'half-moon', name: 'Media Luna', description: 'Disposición en semicírculo', maxCapacity: 80, price: 60 },
    { id: 'auditorium', name: 'Auditorio', description: 'Filas mirando al frente', maxCapacity: 100, price: 40 },
    { id: 'horseshoe', name: 'Herradura', description: 'Forma de herradura', maxCapacity: 60, price: 70 },
    { id: 'classroom', name: 'Escuela', description: 'Mesas individuales', maxCapacity: 50, price: 45 },
    { id: 'imperial', name: 'Imperial', description: 'Mesa principal central', maxCapacity: 40, price: 80 },
    { id: 'russian', name: 'Ruso', description: 'Mesas redondas distribuidas', maxCapacity: 90, price: 65 }
  ]);

  linenColors = signal<LinenColor[]>([
    { id: 'green', name: 'Verde', hexColor: '#22c55e', price: 25 },
    { id: 'fuchsia', name: 'Fucsia', hexColor: '#e879f9', price: 25 },
    { id: 'champagne', name: 'Champagne', hexColor: '#fbbf24', price: 30 },
    { id: 'navy', name: 'Azul Noche', hexColor: '#1e40af', price: 30 }
  ]);

  additionalServices = signal<AdditionalService[]>([
    { id: 'dj', name: 'DJ', description: 'Servicio de DJ profesional', price: 300, icon: '🎧' },
    { id: 'waiters', name: 'Mozos', description: 'Servicio de mozos adicionales', price: 150, icon: '🤵' },
    { id: 'bartender', name: 'Bartender', description: 'Servicio de bartender profesional', price: 200, icon: '🍸' },
    { id: 'photographer', name: 'Fotógrafo', description: 'Servicio de fotografía profesional', price: 250, icon: '📸' },
    { id: 'decorator', name: 'Decorador', description: 'Servicio de decoración del evento', price: 180, icon: '🎨' },
    { id: 'security', name: 'Seguridad', description: 'Servicio de seguridad para el evento', price: 120, icon: '🛡️' }
  ]);

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
    additionalServices: [],
    specialRequests: '',
    termsAccepted: false,
    subtotal: 0,
    taxes: 0,
    total: 0
  });

  constructor(private router: Router) {
    this.generateAvailableDates();
    this.calculateTotals();
  }

  private generateAvailableDates() {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 1) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    this.availableDates.set(dates);
  }

  private calculateTotals() {
    const reservation = this.eventReservation();
    let subtotal = 0;

    if (reservation.eventType) subtotal += reservation.eventType.basePrice;
    if (reservation.selectedShift) subtotal += reservation.selectedShift.price;
    if (reservation.tableDistribution) subtotal += reservation.tableDistribution.price;
    if (reservation.linenColor) subtotal += reservation.linenColor.price;
    subtotal += reservation.additionalServices.reduce((total, service) => total + service.price, 0);

    const taxes = subtotal * 0.18;
    const total = subtotal + taxes;

    this.eventReservation.update(res => ({ ...res, subtotal, taxes, total }));
  }

  nextStep() {
    this.step.update(s => s + 1);
  }

  prevStep() {
    this.step.update(s => s - 1);
  }

  // Step 1 methods
  updateCustomerField(field: keyof Pick<EventPlanningReservation, 'customerName' | 'customerEmail' | 'customerPhone'>, value: string) {
    this.eventReservation.update(res => ({ ...res, [field]: value }));
  }

  selectEventType(eventType: EventType) {
    this.eventReservation.update(res => ({ ...res, eventType }));
    this.calculateTotals();
  }

  selectPaymentMethod(method: 'online' | 'presencial') {
    this.eventReservation.update(res => ({ ...res, paymentMethod: method }));
  }

  // Step 2 methods
  selectDate(date: string) {
    this.selectedDate.set(date);
    this.eventReservation.update(res => ({ ...res, selectedDate: date }));
  }

  selectShift(shift: EventShift) {
    this.eventReservation.update(res => ({ ...res, selectedShift: shift }));
    this.calculateTotals();
  }

  updateGuestCount(count: number) {
    this.eventReservation.update(res => ({ ...res, numberOfGuests: Math.max(1, Math.min(100, count)) }));
  }

  // Step 3 methods
  selectTableDistribution(distribution: TableDistribution) {
    this.eventReservation.update(res => ({ ...res, tableDistribution: distribution }));
    this.calculateTotals();
  }

  selectLinenColor(color: LinenColor) {
    this.eventReservation.update(res => ({ ...res, linenColor: color }));
    this.calculateTotals();
  }

  toggleMenuIncluded() {
    this.eventReservation.update(res => ({
      ...res,
      includeMenu: !res.includeMenu
    }));
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
    this.calculateTotals();
  }

  isServiceSelected(serviceId: string): boolean {
    return this.eventReservation().additionalServices.some(s => s.id === serviceId);
  }

  // Step 5 methods
  updateSpecialRequests(event: Event) {
    const requests = (event.target as HTMLTextAreaElement).value;
    this.eventReservation.update(res => ({ ...res, specialRequests: requests }));
  }

  updateTermsAccepted(event: Event) {
    const accepted = (event.target as HTMLInputElement).checked;
    this.eventReservation.update(res => ({ ...res, termsAccepted: accepted }));
  }

  // Step 6 methods
  processEventPayment() {
    console.log('Processing payment...', this.eventReservation());
    this.finalizeEventReservation();
  }

  finalizeEventReservation() {
    const reservationId = 'EVT-' + Date.now();
    console.log('Event reservation finalized:', this.eventReservation());
    console.log('Sending WhatsApp notification...');
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

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

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