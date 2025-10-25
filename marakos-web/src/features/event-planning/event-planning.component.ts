import { ChangeDetectionStrategy, Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MenuItem } from '../../core/models/restaurant.model';

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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto bg-slate-800 rounded-lg shadow-2xl shadow-black/30 overflow-hidden">
      <!-- Progress Bar -->
      <div class="p-6 border-b border-slate-700">
        <div class="flex items-center justify-between">
          @for(stepInfo of ['Datos', 'Fecha', 'Distribución', 'Servicios', 'Resumen', 'Pago']; track stepInfo; let i = $index) {
            <div class="flex items-center" [class.opacity-50]="step() < i + 1">
              <div class="flex items-center justify-center w-10 h-10 rounded-full" 
                   [class]="step() >= i + 1 ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'">
                <span class="font-bold">{{ i + 1 }}</span>
              </div>
              <span class="ml-3 font-medium hidden md:block" 
                    [class]="step() >= i + 1 ? 'text-amber-500' : 'text-slate-400'">
                {{ stepInfo }}
              </span>
            </div>
            @if (i < 5) {
              <div class="flex-auto border-t-2 mx-2 md:mx-4" 
                   [class]="step() > i + 1 ? 'border-amber-500' : 'border-slate-700'"></div>
            }
          }
        </div>
      </div>

      <div class="p-8">
        @switch (step()) {
          <!-- Step 1: Customer Details, Event Type, Payment Method -->
          @case (1) {
            <div class="animate-fade-in">
              <h2 class="text-3xl font-bold text-slate-100 mb-6 text-center">
                🎉 Reservar Evento Marakos Grill
              </h2>
              <p class="text-slate-300 text-center mb-8">Planifica tu evento perfecto con nosotros</p>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Customer Details -->
                <div class="space-y-6">
                  <h3 class="text-xl font-semibold text-amber-500 mb-4">📋 Datos del Titular</h3>
                  
                  <div>
                    <label for="customerName" class="block text-sm font-medium text-slate-300 mb-2">
                      Nombre y Apellido *
                    </label>
                    <input 
                      type="text" 
                      id="customerName" 
                      required
                      [value]="eventReservation().customerName"
                      (input)="updateCustomerField('customerName', $any($event.target).value)"
                      class="w-full bg-slate-700 border-slate-600 text-slate-100 rounded-md p-3 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Ingresa tu nombre completo">
                  </div>

                  <div>
                    <label for="customerEmail" class="block text-sm font-medium text-slate-300 mb-2">
                      Correo Electrónico *
                    </label>
                    <input 
                      type="email" 
                      id="customerEmail" 
                      required
                      [value]="eventReservation().customerEmail"
                      (input)="updateCustomerField('customerEmail', $any($event.target).value)"
                      class="w-full bg-slate-700 border-slate-600 text-slate-100 rounded-md p-3 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="tu@email.com">
                  </div>

                  <div>
                    <label for="customerPhone" class="block text-sm font-medium text-slate-300 mb-2">
                      Teléfono *
                    </label>
                    <input 
                      type="tel" 
                      id="customerPhone" 
                      required
                      [value]="eventReservation().customerPhone"
                      (input)="updateCustomerField('customerPhone', $any($event.target).value)"
                      class="w-full bg-slate-700 border-slate-600 text-slate-100 rounded-md p-3 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="+51 999 999 999">
                  </div>

                  <!-- Payment Method -->
                  <div>
                    <h4 class="text-lg font-semibold text-amber-500 mb-3">💳 Método de Pago</h4>
                    <div class="grid grid-cols-2 gap-4">
                      <button 
                        (click)="selectPaymentMethod('online')"
                        class="p-4 rounded-lg border-2 transition-all duration-300"
                        [class.bg-amber-500]="eventReservation().paymentMethod === 'online'"
                        [class.border-amber-500]="eventReservation().paymentMethod === 'online'"
                        [class.text-slate-900]="eventReservation().paymentMethod === 'online'"
                        [class.border-slate-600]="eventReservation().paymentMethod !== 'online'"
                        [class.text-slate-300]="eventReservation().paymentMethod !== 'online'">
                        <div class="text-center">
                          <div class="text-2xl mb-2">💳</div>
                          <div class="font-semibold">Online</div>
                          <div class="text-xs opacity-75">Pago con tarjeta</div>
                        </div>
                      </button>
                      
                      <button 
                        (click)="selectPaymentMethod('presencial')"
                        class="p-4 rounded-lg border-2 transition-all duration-300"
                        [class.bg-amber-500]="eventReservation().paymentMethod === 'presencial'"
                        [class.border-amber-500]="eventReservation().paymentMethod === 'presencial'"
                        [class.text-slate-900]="eventReservation().paymentMethod === 'presencial'"
                        [class.border-slate-600]="eventReservation().paymentMethod !== 'presencial'"
                        [class.text-slate-300]="eventReservation().paymentMethod !== 'presencial'">
                        <div class="text-center">
                          <div class="text-2xl mb-2">🏪</div>
                          <div class="font-semibold">Presencial</div>
                          <div class="text-xs opacity-75">Pago en local</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Event Type Selection -->
                <div>
                  <h3 class="text-xl font-semibold text-amber-500 mb-4">🎊 Tipo de Evento</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    @for(eventType of eventTypes(); track eventType.id) {
                      <button 
                        (click)="selectEventType(eventType)"
                        class="p-4 rounded-lg border-2 transition-all duration-300 text-left"
                        [class.bg-amber-500]="eventReservation().eventType?.id === eventType.id"
                        [class.border-amber-500]="eventReservation().eventType?.id === eventType.id"
                        [class.text-slate-900]="eventReservation().eventType?.id === eventType.id"
                        [class.border-slate-600]="eventReservation().eventType?.id !== eventType.id"
                        [class.text-slate-300]="eventReservation().eventType?.id !== eventType.id"
                        [class.hover:border-amber-400]="eventReservation().eventType?.id !== eventType.id">
                        <div class="flex items-center">
                          <span class="text-2xl mr-3">{{ eventType.icon }}</span>
                          <div>
                            <div class="font-semibold">{{ eventType.name }}</div>
                            <div class="text-xs opacity-75">{{ eventType.description }}</div>
                            <div class="text-sm font-bold mt-1">S/ {{ eventType.basePrice }}</div>
                          </div>
                        </div>
                      </button>
                    }
                  </div>
                </div>
              </div>

              <div class="mt-8 text-center">
                <button 
                  (click)="nextStep()" 
                  [disabled]="!canProceedFromStep1()"
                  class="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-full hover:bg-amber-400 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400">
                  Continuar 🠮
                </button>
              </div>
            </div>
          }

          <!-- Step 2: Date, Time, and Guest Count -->
          @case (2) {
            <div class="animate-fade-in">
              <h2 class="text-3xl font-bold text-slate-100 mb-6 text-center">
                📅 Fecha y Horario del Evento
              </h2>
              <p class="text-slate-300 text-center mb-8">Selecciona cuándo quieres celebrar tu evento</p>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Date Selection -->
                <div>
                  <h3 class="text-xl font-semibold text-amber-500 mb-4">📅 Fecha del Evento</h3>
                  <div class="bg-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      @for(date of availableDates().slice(0, 30); track date) {
                        <button 
                          (click)="selectDate(date)"
                          class="p-3 rounded-lg border-2 transition-all duration-300 text-sm"
                          [class.bg-amber-500]="eventReservation().selectedDate === date"
                          [class.border-amber-500]="eventReservation().selectedDate === date"
                          [class.text-slate-900]="eventReservation().selectedDate === date"
                          [class.border-slate-600]="eventReservation().selectedDate !== date"
                          [class.text-slate-300]="eventReservation().selectedDate !== date"
                          [class.hover:border-amber-400]="eventReservation().selectedDate !== date">
                          {{ formatDate(date) }}
                        </button>
                      }
                    </div>
                  </div>
                </div>

                <!-- Time Shift and Guest Count -->
                <div class="space-y-6">
                  <!-- Time Shift Selection -->
                  <div>
                    <h3 class="text-xl font-semibold text-amber-500 mb-4">⏰ Horario</h3>
                    <div class="space-y-3">
                      @for(shift of eventShifts(); track shift.id) {
                        <button 
                          (click)="selectShift(shift)"
                          class="w-full p-4 rounded-lg border-2 transition-all duration-300 text-left"
                          [class.bg-amber-500]="eventReservation().selectedShift?.id === shift.id"
                          [class.border-amber-500]="eventReservation().selectedShift?.id === shift.id"
                          [class.text-slate-900]="eventReservation().selectedShift?.id === shift.id"
                          [class.border-slate-600]="eventReservation().selectedShift?.id !== shift.id"
                          [class.text-slate-300]="eventReservation().selectedShift?.id !== shift.id"
                          [class.hover:border-amber-400]="eventReservation().selectedShift?.id !== shift.id">
                          <div class="flex justify-between items-center">
                            <div>
                              <div class="font-semibold">{{ shift.name }}</div>
                              <div class="text-sm opacity-75">{{ shift.timeRange }}</div>
                            </div>
                            @if (shift.price > 0) {
                              <div class="font-bold">+S/ {{ shift.price }}</div>
                            }
                          </div>
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Guest Count -->
                  <div>
                    <h3 class="text-xl font-semibold text-amber-500 mb-4">👥 Número de Invitados</h3>
                    <div class="bg-slate-700 rounded-lg p-4">
                      <label for="guestCount" class="block text-sm font-medium text-slate-300 mb-2">
                        Invitados (mínimo 10, máximo 150)
                      </label>
                      <div class="flex items-center gap-4">
                        <button 
                          (click)="decreaseGuests()"
                          [disabled]="eventReservation().numberOfGuests <= 10"
                          class="bg-slate-600 text-slate-100 w-10 h-10 rounded-full hover:bg-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          −
                        </button>
                        
                        <input 
                          type="number" 
                          id="guestCount"
                          min="10" 
                          max="150"
                          [value]="eventReservation().numberOfGuests"
                          (input)="updateGuestCount(+$any($event.target).value)"
                          class="flex-1 bg-slate-600 border-slate-500 text-slate-100 text-center rounded-md p-3 focus:ring-amber-500 focus:border-amber-500">
                        
                        <button 
                          (click)="increaseGuests()"
                          [disabled]="eventReservation().numberOfGuests >= 150"
                          class="bg-slate-600 text-slate-100 w-10 h-10 rounded-full hover:bg-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          +
                        </button>
                      </div>
                      
                      <div class="mt-2 text-xs text-slate-400 text-center">
                        Costo por persona adicional: S/ 15 (después de 50 invitados)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8 flex justify-center gap-4">
                <button 
                  (click)="prevStep()"
                  class="bg-slate-600 text-slate-100 font-bold py-3 px-8 rounded-full hover:bg-slate-500 transition-all">
                  ← Atrás
                </button>
                
                <button 
                  (click)="nextStep()" 
                  [disabled]="!canProceedFromStep2()"
                  class="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-full hover:bg-amber-400 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400">
                  Continuar 🠮
                </button>
              </div>
            </div>
          }

          <!-- Step 3: Table Distribution, Linen Color, Menu Selection -->
          @case (3) {
            <div class="animate-fade-in">
              <h2 class="text-3xl font-bold text-slate-100 mb-6 text-center">
                🍽️ Distribución y Menú
              </h2>
              <p class="text-slate-300 text-center mb-8">Personaliza la distribución de mesas y selecciona el menú</p>

              <div class="space-y-8">
                <!-- Table Distribution -->
                <div>
                  <h3 class="text-xl font-semibold text-amber-500 mb-4">🪑 Distribución de Mesas</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    @for(distribution of tableDistributions(); track distribution.id) {
                      <button 
                        (click)="selectTableDistribution(distribution)"
                        class="p-4 rounded-lg border-2 transition-all duration-300 text-left"
                        [class.bg-amber-500]="eventReservation().tableDistribution?.id === distribution.id"
                        [class.border-amber-500]="eventReservation().tableDistribution?.id === distribution.id"
                        [class.text-slate-900]="eventReservation().tableDistribution?.id === distribution.id"
                        [class.border-slate-600]="eventReservation().tableDistribution?.id !== distribution.id"
                        [class.text-slate-300]="eventReservation().tableDistribution?.id !== distribution.id"
                        [class.hover:border-amber-400]="eventReservation().tableDistribution?.id !== distribution.id">
                        <div class="text-center">
                          <div class="font-semibold">{{ distribution.name }}</div>
                          <div class="text-sm opacity-75 mt-1">{{ distribution.description }}</div>
                          <div class="text-xs opacity-60 mt-1">Máx. {{ distribution.maxCapacity }} por mesa</div>
                          @if (distribution.price > 0) {
                            <div class="font-bold text-sm mt-2">+S/ {{ distribution.price }}</div>
                          }
                        </div>
                      </button>
                    }
                  </div>
                </div>

                <!-- Linen Color -->
                <div>
                  <h3 class="text-xl font-semibold text-amber-500 mb-4">🎨 Color de Mantelería</h3>
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    @for(color of linenColors(); track color.id) {
                      <button 
                        (click)="selectLinenColor(color)"
                        class="p-4 rounded-lg border-2 transition-all duration-300"
                        [class.border-amber-500]="eventReservation().linenColor?.id === color.id"
                        [class.border-slate-600]="eventReservation().linenColor?.id !== color.id"
                        [class.hover:border-amber-400]="eventReservation().linenColor?.id !== color.id">
                        <div class="text-center">
                          <div class="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-slate-400" 
                               [style.backgroundColor]="color.hexColor"></div>
                          <div class="text-sm font-medium text-slate-200">{{ color.name }}</div>
                          @if (color.price > 0) {
                            <div class="text-xs font-bold text-amber-400 mt-1">+S/ {{ color.price }}</div>
                          }
                        </div>
                      </button>
                    }
                  </div>
                </div>

                <!-- Menu Selection -->
                <div>
                  <h3 class="text-xl font-semibold text-amber-500 mb-4">🍴 Menú del Evento</h3>
                  
                  <div class="bg-slate-700 rounded-lg p-4 mb-4">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        [checked]="eventReservation().includeMenu"
                        (change)="toggleMenu($any($event.target).checked)"
                        class="w-5 h-5 text-amber-500 bg-slate-600 border-slate-500 rounded focus:ring-amber-500">
                      <span class="text-slate-200 font-medium">Incluir menú completo en el evento</span>
                    </label>
                    <p class="text-slate-400 text-sm mt-2">Selecciona platos para ofrecer a tus invitados</p>
                  </div>

                  @if (eventReservation().includeMenu) {
                    <div class="space-y-4">
                      @for(item of menuItems(); track item.id) {
                        <div class="bg-slate-700 rounded-lg p-4">
                          <div class="flex justify-between items-start">
                            <div class="flex-1">
                              <h4 class="font-semibold text-slate-200">{{ item.name }}</h4>
                              <p class="text-slate-400 text-sm">{{ item.description }}</p>
                              <div class="flex items-center gap-4 mt-2">
                                <span class="text-amber-400 font-bold">S/ {{ item.price }}</span>
                                <span class="text-slate-500 text-xs bg-slate-600 px-2 py-1 rounded">{{ item.category }}</span>
                              </div>
                            </div>
                            
                            <div class="flex items-center gap-3 ml-4">
                              <button 
                                (click)="decreaseMenuItem(item)"
                                [disabled]="getMenuItemQuantity(item) <= 0"
                                class="bg-slate-600 text-slate-100 w-8 h-8 rounded-full hover:bg-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                                −
                              </button>
                              
                              <span class="w-8 text-center font-bold text-slate-200">
                                {{ getMenuItemQuantity(item) }}
                              </span>
                              
                              <button 
                                (click)="increaseMenuItem(item)"
                                class="bg-slate-600 text-slate-100 w-8 h-8 rounded-full hover:bg-slate-500 transition-all text-sm">
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <div class="mt-8 flex justify-center gap-4">
                <button 
                  (click)="prevStep()"
                  class="bg-slate-600 text-slate-100 font-bold py-3 px-8 rounded-full hover:bg-slate-500 transition-all">
                  ← Atrás
                </button>
                
                <button 
                  (click)="nextStep()" 
                  [disabled]="!canProceedFromStep3()"
                  class="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-full hover:bg-amber-400 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400">
                  Continuar 🠮
                </button>
              </div>
            </div>
          }

          <!-- Step 4: Additional Services -->
          @case (4) {
            <div class="animate-fade-in">
              <h2 class="text-3xl font-bold text-slate-100 mb-6 text-center">
                ✨ Servicios Adicionales
              </h2>
              <p class="text-slate-300 text-center mb-8">Mejora tu evento con servicios premium opcionales</p>

              <div class="space-y-8">
                <!-- Entertainment Services -->
                <div>
                  <h3 class="text-xl font-semibold text-amber-500 mb-4 flex items-center gap-2">
                    🎉 Entretenimiento
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for(service of getServicesByCategory('entertainment'); track service.id) {
                      <div class="bg-slate-700 rounded-lg p-4">
                        <div class="flex items-start justify-between">
                          <div class="flex items-start gap-3">
                            <span class="text-2xl">{{ service.icon }}</span>
                            <div class="flex-1">
                              <h4 class="font-semibold text-slate-200">{{ service.name }}</h4>
                              <p class="text-slate-400 text-sm mt-1">{{ service.description }}</p>
                              <div class="text-amber-400 font-bold mt-2">S/ {{ service.price }}</div>
                            </div>
                          </div>
                          <button 
                            (click)="toggleAdditionalService(service)"
                            class="ml-4 p-2 rounded-lg border-2 transition-all duration-300"
                            [class.bg-amber-500]="isServiceSelected(service)"
                            [class.border-amber-500]="isServiceSelected(service)"
                            [class.text-slate-900]="isServiceSelected(service)"
                            [class.border-slate-600]="!isServiceSelected(service)"
                            [class.text-slate-300]="!isServiceSelected(service)"
                            [class.hover:border-amber-400]="!isServiceSelected(service)">
                            @if (isServiceSelected(service)) {
                              ✓
                            } @else {
                              +
                            }
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Service Services -->
                <div>
                  <h3 class="text-xl font-semibold text-amber-500 mb-4 flex items-center gap-2">
                    🛎️ Servicios Profesionales
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for(service of getServicesByCategory('service'); track service.id) {
                      <div class="bg-slate-700 rounded-lg p-4">
                        <div class="flex items-start justify-between">
                          <div class="flex items-start gap-3">
                            <span class="text-2xl">{{ service.icon }}</span>
                            <div class="flex-1">
                              <h4 class="font-semibold text-slate-200">{{ service.name }}</h4>
                              <p class="text-slate-400 text-sm mt-1">{{ service.description }}</p>
                              <div class="text-amber-400 font-bold mt-2">S/ {{ service.price }}</div>
                            </div>
                          </div>
                          <button 
                            (click)="toggleAdditionalService(service)"
                            class="ml-4 p-2 rounded-lg border-2 transition-all duration-300"
                            [class.bg-amber-500]="isServiceSelected(service)"
                            [class.border-amber-500]="isServiceSelected(service)"
                            [class.text-slate-900]="isServiceSelected(service)"
                            [class.border-slate-600]="!isServiceSelected(service)"
                            [class.text-slate-300]="!isServiceSelected(service)"
                            [class.hover:border-amber-400]="!isServiceSelected(service)">
                            @if (isServiceSelected(service)) {
                              ✓
                            } @else {
                              +
                            }
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Catering Services -->
                <div>
                  <h3 class="text-xl font-semibold text-amber-500 mb-4 flex items-center gap-2">
                    🍽️ Servicios Gastronómicos
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for(service of getServicesByCategory('catering'); track service.id) {
                      <div class="bg-slate-700 rounded-lg p-4">
                        <div class="flex items-start justify-between">
                          <div class="flex items-start gap-3">
                            <span class="text-2xl">{{ service.icon }}</span>
                            <div class="flex-1">
                              <h4 class="font-semibold text-slate-200">{{ service.name }}</h4>
                              <p class="text-slate-400 text-sm mt-1">{{ service.description }}</p>
                              <div class="text-amber-400 font-bold mt-2">S/ {{ service.price }}</div>
                            </div>
                          </div>
                          <button 
                            (click)="toggleAdditionalService(service)"
                            class="ml-4 p-2 rounded-lg border-2 transition-all duration-300"
                            [class.bg-amber-500]="isServiceSelected(service)"
                            [class.border-amber-500]="isServiceSelected(service)"
                            [class.text-slate-900]="isServiceSelected(service)"
                            [class.border-slate-600]="!isServiceSelected(service)"
                            [class.text-slate-300]="!isServiceSelected(service)"
                            [class.hover:border-amber-400]="!isServiceSelected(service)">
                            @if (isServiceSelected(service)) {
                              ✓
                            } @else {
                              +
                            }
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Selected Services Summary -->
                @if (eventReservation().additionalServices.length > 0) {
                  <div class="bg-slate-700 rounded-lg p-4">
                    <h4 class="font-semibold text-amber-500 mb-3">📝 Servicios Seleccionados:</h4>
                    <div class="space-y-2">
                      @for(service of eventReservation().additionalServices; track service.id) {
                        <div class="flex justify-between items-center text-sm">
                          <span class="text-slate-200">{{ service.icon }} {{ service.name }}</span>
                          <span class="text-amber-400 font-bold">S/ {{ service.price }}</span>
                        </div>
                      }
                    </div>
                    <div class="border-t border-slate-600 mt-3 pt-3">
                      <div class="flex justify-between items-center font-bold">
                        <span class="text-slate-200">Total Servicios:</span>
                        <span class="text-amber-400">S/ {{ getAdditionalServicesTotal() }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <div class="mt-8 flex justify-center gap-4">
                <button 
                  (click)="prevStep()"
                  class="bg-slate-600 text-slate-100 font-bold py-3 px-8 rounded-full hover:bg-slate-500 transition-all">
                  ← Atrás
                </button>
                
                <button 
                  (click)="nextStep()" 
                  class="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-full hover:bg-amber-400 transition-all">
                  Continuar 🠮
                </button>
              </div>
            </div>
          }

          <!-- Step 5: Summary and Special Requirements -->
          @case (5) {
            <div class="animate-fade-in">
              <h2 class="text-3xl font-bold text-slate-100 mb-6 text-center">
                📋 Resumen del Evento
              </h2>
              <p class="text-slate-300 text-center mb-8">Revisa todos los detalles antes de proceder al pago</p>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Event Summary -->
                <div class="space-y-6">
                  <!-- Customer Info -->
                  <div class="bg-slate-700 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
                      👤 Información del Cliente
                    </h3>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-400">Nombre:</span>
                        <span class="text-slate-200">{{ eventReservation().customerName }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Email:</span>
                        <span class="text-slate-200">{{ eventReservation().customerEmail }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Teléfono:</span>
                        <span class="text-slate-200">{{ eventReservation().customerPhone }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Event Details -->
                  <div class="bg-slate-700 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
                      🎊 Detalles del Evento
                    </h3>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-400">Tipo:</span>
                        <span class="text-slate-200">{{ eventReservation().eventType?.icon }} {{ eventReservation().eventType?.name }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Fecha:</span>
                        <span class="text-slate-200">{{ formatDate(eventReservation().selectedDate) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Horario:</span>
                        <span class="text-slate-200">{{ eventReservation().selectedShift?.name }} ({{ eventReservation().selectedShift?.timeRange }})</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Invitados:</span>
                        <span class="text-slate-200">{{ eventReservation().numberOfGuests }} personas</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Mesas:</span>
                        <span class="text-slate-200">{{ eventReservation().tableDistribution?.name }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Mantelería:</span>
                        <span class="text-slate-200 flex items-center gap-2">
                          <div class="w-4 h-4 rounded-full border border-slate-400" [style.backgroundColor]="eventReservation().linenColor?.hexColor"></div>
                          {{ eventReservation().linenColor?.name }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Menu Items -->
                  @if (eventReservation().includeMenu && eventReservation().menuItems.length > 0) {
                    <div class="bg-slate-700 rounded-lg p-6">
                      <h3 class="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
                        🍽️ Menú Seleccionado
                      </h3>
                      <div class="space-y-3">
                        @for(menuItem of eventReservation().menuItems; track menuItem.item.id) {
                          <div class="flex justify-between items-center text-sm">
                            <div>
                              <span class="text-slate-200">{{ menuItem.item.name }}</span>
                              <span class="text-slate-400"> x{{ menuItem.quantity }}</span>
                            </div>
                            <span class="text-amber-400 font-bold">S/ {{ menuItem.item.price * menuItem.quantity }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Additional Services -->
                  @if (eventReservation().additionalServices.length > 0) {
                    <div class="bg-slate-700 rounded-lg p-6">
                      <h3 class="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
                        ✨ Servicios Adicionales
                      </h3>
                      <div class="space-y-2">
                        @for(service of eventReservation().additionalServices; track service.id) {
                          <div class="flex justify-between items-center text-sm">
                            <span class="text-slate-200">{{ service.icon }} {{ service.name }}</span>
                            <span class="text-amber-400 font-bold">S/ {{ service.price }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Special Requirements -->
                  <div class="bg-slate-700 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
                      📝 Requerimientos Especiales
                    </h3>
                    <textarea 
                      [value]="eventReservation().specialRequests"
                      (input)="updateSpecialRequests($any($event.target).value)"
                      placeholder="Describe cualquier requerimiento especial, alergias, preferencias de decoración, etc."
                      rows="4"
                      class="w-full bg-slate-600 border-slate-500 text-slate-100 rounded-md p-3 focus:ring-amber-500 focus:border-amber-500 text-sm">
                    </textarea>
                  </div>
                </div>

                <!-- Price Breakdown -->
                <div class="space-y-6">
                  <div class="bg-slate-700 rounded-lg p-6 sticky top-4">
                    <h3 class="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
                      💰 Desglose de Precios
                    </h3>
                    
                    <div class="space-y-3 text-sm">
                      <!-- Base Event Price -->
                      <div class="flex justify-between">
                        <span class="text-slate-400">Evento Base ({{ eventReservation().eventType?.name }}):</span>
                        <span class="text-slate-200">S/ {{ eventReservation().eventType?.basePrice || 0 }}</span>
                      </div>

                      <!-- Shift Price -->
                      @if (eventReservation().selectedShift?.price && eventReservation().selectedShift.price > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-400">Horario ({{ eventReservation().selectedShift.name }}):</span>
                          <span class="text-slate-200">S/ {{ eventReservation().selectedShift.price }}</span>
                        </div>
                      }

                      <!-- Guest Count -->
                      @if (eventReservation().numberOfGuests > 50) {
                        <div class="flex justify-between">
                          <span class="text-slate-400">Invitados extra ({{ eventReservation().numberOfGuests - 50 }} x S/ 15):</span>
                          <span class="text-slate-200">S/ {{ (eventReservation().numberOfGuests - 50) * 15 }}</span>
                        </div>
                      }

                      <!-- Table Distribution -->
                      @if (eventReservation().tableDistribution?.price && eventReservation().tableDistribution.price > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-400">Distribución ({{ eventReservation().tableDistribution.name }}):</span>
                          <span class="text-slate-200">S/ {{ eventReservation().tableDistribution.price }}</span>
                        </div>
                      }

                      <!-- Linen Color -->
                      @if (eventReservation().linenColor?.price && eventReservation().linenColor.price > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-400">Mantelería ({{ eventReservation().linenColor.name }}):</span>
                          <span class="text-slate-200">S/ {{ eventReservation().linenColor.price }}</span>
                        </div>
                      }

                      <!-- Menu Items -->
                      @if (getMenuTotal() > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-400">Menú:</span>
                          <span class="text-slate-200">S/ {{ getMenuTotal() }}</span>
                        </div>
                      }

                      <!-- Additional Services -->
                      @if (getAdditionalServicesTotal() > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-400">Servicios Adicionales:</span>
                          <span class="text-slate-200">S/ {{ getAdditionalServicesTotal() }}</span>
                        </div>
                      }

                      <div class="border-t border-slate-600 pt-3">
                        <div class="flex justify-between text-base font-semibold">
                          <span class="text-slate-300">Subtotal:</span>
                          <span class="text-slate-200">S/ {{ calculateSubtotal() }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">IGV (18%):</span>
                          <span class="text-slate-200">S/ {{ calculateTaxes() }}</span>
                        </div>
                      </div>

                      <div class="border-t border-slate-600 pt-3">
                        <div class="flex justify-between text-xl font-bold">
                          <span class="text-amber-500">Total:</span>
                          <span class="text-amber-500">S/ {{ calculateTotal() }}</span>
                        </div>
                      </div>

                      <div class="mt-4 p-3 bg-slate-600 rounded-lg">
                        <p class="text-slate-300 text-xs">
                          💳 Método de pago: {{ eventReservation().paymentMethod === 'online' ? 'Pago en línea' : 'Pago presencial' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Terms and Conditions -->
                  <div class="bg-slate-700 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-amber-500 mb-4">📜 Términos y Condiciones</h3>
                    <div class="space-y-3 text-sm text-slate-300">
                      <div class="flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          id="terms"
                          [checked]="eventReservation().termsAccepted"
                          (change)="toggleTerms($any($event.target).checked)"
                          class="w-5 h-5 text-amber-500 bg-slate-600 border-slate-500 rounded focus:ring-amber-500 mt-0.5">
                        <label for="terms" class="cursor-pointer leading-relaxed">
                          Acepto los términos y condiciones del servicio. Entiendo que se requiere un depósito del 50% para confirmar la reserva y el saldo restante se debe pagar el día del evento.
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8 flex justify-center gap-4">
                <button 
                  (click)="prevStep()"
                  class="bg-slate-600 text-slate-100 font-bold py-3 px-8 rounded-full hover:bg-slate-500 transition-all">
                  ← Atrás
                </button>
                
                <button 
                  (click)="nextStep()" 
                  [disabled]="!canProceedFromStep5()"
                  class="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-full hover:bg-amber-400 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400">
                  Proceder al Pago 💳
                </button>
              </div>
            </div>
          }

          <!-- Step 6: Payment Process -->
          @case (6) {
            <div class="animate-fade-in">
              <h2 class="text-3xl font-bold text-slate-100 mb-6 text-center">
                💳 Proceso de Pago
              </h2>
              <p class="text-slate-300 text-center mb-8">Finaliza tu reserva de evento</p>

              <div class="max-w-4xl mx-auto">
                @if (eventReservation().paymentMethod === 'online') {
                  <!-- Online Payment -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Payment Form -->
                    <div class="bg-slate-700 rounded-lg p-6">
                      <h3 class="text-xl font-semibold text-amber-500 mb-6 flex items-center gap-2">
                        💳 Pago con Tarjeta
                      </h3>

                      <div class="space-y-4">
                        <div>
                          <label class="block text-sm font-medium text-slate-300 mb-2">
                            Número de Tarjeta *
                          </label>
                          <input 
                            type="text" 
                            placeholder="1234 5678 9012 3456"
                            maxlength="19"
                            class="w-full bg-slate-600 border-slate-500 text-slate-100 rounded-md p-3 focus:ring-amber-500 focus:border-amber-500">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">
                              Fecha de Vencimiento *
                            </label>
                            <input 
                              type="text" 
                              placeholder="MM/YY"
                              maxlength="5"
                              class="w-full bg-slate-600 border-slate-500 text-slate-100 rounded-md p-3 focus:ring-amber-500 focus:border-amber-500">
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">
                              CVV *
                            </label>
                            <input 
                              type="text" 
                              placeholder="123"
                              maxlength="4"
                              class="w-full bg-slate-600 border-slate-500 text-slate-100 rounded-md p-3 focus:ring-amber-500 focus:border-amber-500">
                          </div>
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-slate-300 mb-2">
                            Nombre del Titular *
                          </label>
                          <input 
                            type="text" 
                            [value]="eventReservation().customerName"
                            class="w-full bg-slate-600 border-slate-500 text-slate-100 rounded-md p-3 focus:ring-amber-500 focus:border-amber-500">
                        </div>

                        <!-- Payment Type Selection -->
                        <div class="border-t border-slate-600 pt-4">
                          <h4 class="text-lg font-semibold text-slate-300 mb-3">💰 Tipo de Pago</h4>
                          <div class="space-y-3">
                            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-600 hover:border-amber-500 transition-all">
                              <input 
                                type="radio" 
                                name="paymentType" 
                                value="deposit"
                                checked
                                class="text-amber-500 bg-slate-600 border-slate-500 focus:ring-amber-500">
                              <div class="flex-1">
                                <div class="font-semibold text-slate-200">Depósito del 50%</div>
                                <div class="text-sm text-slate-400">Paga S/ {{ getDepositAmount() }} ahora, el resto el día del evento</div>
                              </div>
                              <div class="text-amber-400 font-bold">S/ {{ getDepositAmount() }}</div>
                            </label>
                            
                            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-600 hover:border-amber-500 transition-all">
                              <input 
                                type="radio" 
                                name="paymentType" 
                                value="full"
                                class="text-amber-500 bg-slate-600 border-slate-500 focus:ring-amber-500">
                              <div class="flex-1">
                                <div class="font-semibold text-slate-200">Pago Completo</div>
                                <div class="text-sm text-slate-400">Paga el total completo ahora (5% descuento)</div>
                              </div>
                              <div class="text-amber-400 font-bold">S/ {{ getFullPaymentAmount() }}</div>
                            </label>
                          </div>
                        </div>

                        <!-- Security Notice -->
                        <div class="bg-slate-800 rounded-lg p-4 border border-slate-600">
                          <div class="flex items-center gap-2 text-green-400 mb-2">
                            🔒 <span class="font-semibold">Pago Seguro</span>
                          </div>
                          <p class="text-slate-400 text-sm">
                            Tu información está protegida con encriptación SSL de 256 bits. 
                            Procesamos pagos a través de Culqi, plataforma segura certificada.
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Payment Summary -->
                    <div class="bg-slate-700 rounded-lg p-6 h-fit sticky top-4">
                      <h3 class="text-xl font-semibold text-amber-500 mb-6">📋 Resumen de Pago</h3>
                      
                      <div class="space-y-3 text-sm mb-6">
                        <div class="flex justify-between">
                          <span class="text-slate-400">Evento:</span>
                          <span class="text-slate-200">{{ eventReservation().eventType?.name }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">Fecha:</span>
                          <span class="text-slate-200">{{ formatDate(eventReservation().selectedDate) }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-400">Invitados:</span>
                          <span class="text-slate-200">{{ eventReservation().numberOfGuests }}</span>
                        </div>
                      </div>

                      <div class="border-t border-slate-600 pt-4 mb-6">
                        <div class="flex justify-between text-base font-semibold mb-2">
                          <span class="text-slate-300">Total del Evento:</span>
                          <span class="text-slate-200">S/ {{ calculateTotal() }}</span>
                        </div>
                        <div class="flex justify-between text-lg font-bold">
                          <span class="text-amber-500">Total a Pagar Hoy:</span>
                          <span class="text-amber-500">S/ {{ getDepositAmount() }}</span>
                        </div>
                      </div>

                      <button 
                        (click)="processPayment()"
                        class="w-full bg-amber-500 text-slate-900 font-bold py-4 px-6 rounded-lg hover:bg-amber-400 transition-all text-lg">
                        🔒 Procesar Pago Seguro
                      </button>

                      <p class="text-slate-400 text-xs text-center mt-3">
                        Al hacer clic, aceptas nuestros términos de servicio y política de privacidad
                      </p>
                    </div>
                  </div>
                } @else {
                  <!-- Presential Payment -->
                  <div class="max-w-2xl mx-auto">
                    <div class="bg-slate-700 rounded-lg p-8 text-center">
                      <div class="text-6xl mb-6">🏪</div>
                      <h3 class="text-2xl font-semibold text-amber-500 mb-4">Pago Presencial</h3>
                      <p class="text-slate-300 mb-6">
                        Has seleccionado pago presencial. Tu reserva se confirmará cuando realices el pago en nuestro local.
                      </p>

                      <div class="bg-slate-800 rounded-lg p-6 mb-6">
                        <h4 class="text-lg font-semibold text-slate-200 mb-4">📍 Información del Local</h4>
                        <div class="space-y-2 text-sm text-slate-300">
                          <p><strong>Dirección:</strong> Av. Javier Prado Este 1234, San Isidro, Lima</p>
                          <p><strong>Horarios:</strong> Lun-Dom 10:00 AM - 10:00 PM</p>
                          <p><strong>Teléfono:</strong> (01) 234-5678</p>
                          <p><strong>Email:</strong> reservas@marakosgrill.com</p>
                        </div>
                      </div>

                      <div class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                        <p class="text-amber-400 font-semibold mb-2">⚠️ Importante</p>
                        <p class="text-slate-300 text-sm">
                          Debes realizar el pago del depósito (50%) dentro de las próximas 48 horas para confirmar tu reserva. 
                          Te enviaremos un email con todos los detalles.
                        </p>
                      </div>

                      <div class="text-left bg-slate-800 rounded-lg p-4 mb-6">
                        <h4 class="text-amber-500 font-semibold mb-3">💰 Resumen de Pago</h4>
                        <div class="space-y-2 text-sm">
                          <div class="flex justify-between">
                            <span class="text-slate-400">Total del Evento:</span>
                            <span class="text-slate-200">S/ {{ calculateTotal() }}</span>
                          </div>
                          <div class="flex justify-between font-semibold">
                            <span class="text-amber-400">Depósito a Pagar (50%):</span>
                            <span class="text-amber-400">S/ {{ getDepositAmount() }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-slate-400">Saldo Restante (día del evento):</span>
                            <span class="text-slate-200">S/ {{ getRemainingAmount() }}</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        (click)="confirmPresentialReservation()"
                        class="w-full bg-amber-500 text-slate-900 font-bold py-4 px-6 rounded-lg hover:bg-amber-400 transition-all text-lg mb-4">
                        📝 Confirmar Reserva Presencial
                      </button>
                    </div>
                  </div>
                }
              </div>

              <div class="mt-8 flex justify-center">
                <button 
                  (click)="prevStep()"
                  class="bg-slate-600 text-slate-100 font-bold py-3 px-8 rounded-full hover:bg-slate-500 transition-all">
                  ← Volver al Resumen
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventPlanningComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  step = signal(1);

  // Mock data simplificado
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

  availableDates = signal<string[]>([]);

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

  menuItems = signal<MenuItem[]>([
    { id: 1, name: 'Anticuchos Premium', description: 'Corazón de res con ají amarillo', price: 25, category: 'Appetizer' },
    { id: 2, name: 'Lomo Saltado', description: 'Clásico peruano con papas fritas', price: 32, category: 'Main Course' },
    { id: 3, name: 'Ají de Gallina', description: 'Cremoso y tradicional', price: 28, category: 'Main Course' },
    { id: 4, name: 'Suspiro Limeño', description: 'Postre tradicional peruano', price: 15, category: 'Dessert' },
    { id: 5, name: 'Chicha Morada', description: 'Bebida tradicional', price: 8, category: 'Beverage' }
  ]);

  additionalServices = signal<AdditionalService[]>([
    // Entertainment Services
    { id: 'dj', name: 'DJ Profesional', description: 'Música y animación para toda la noche', price: 300, icon: '🎧', category: 'entertainment' },
    { id: 'mariachi', name: 'Mariachi', description: 'Grupo tradicional mexicano', price: 450, icon: '🎺', category: 'entertainment' },
    { id: 'karaoke', name: 'Karaoke', description: 'Diversión garantizada para todos', price: 150, icon: '🎤', category: 'entertainment' },
    { id: 'fotografia', name: 'Fotografía Profesional', description: 'Captura todos los momentos especiales', price: 400, icon: '📸', category: 'entertainment' },
    
    // Service Services
    { id: 'mesero-extra', name: 'Mesero Adicional', description: 'Servicio personalizado extra', price: 80, icon: '👨‍💼', category: 'service' },
    { id: 'valet-parking', name: 'Valet Parking', description: 'Servicio de estacionamiento', price: 120, icon: '🚗', category: 'service' },
    { id: 'seguridad', name: 'Seguridad Privada', description: 'Vigilancia profesional del evento', price: 200, icon: '👮‍♂️', category: 'service' },
    
    // Catering Services
    { id: 'barra-libre', name: 'Barra Libre Premium', description: 'Bebidas alcohólicas ilimitadas 4hrs', price: 500, icon: '🍹', category: 'catering' },
    { id: 'chef-vivo', name: 'Chef en Vivo', description: 'Preparación de platos en vivo', price: 350, icon: '👨‍🍳', category: 'catering' },
    { id: 'torta-evento', name: 'Torta Personalizada', description: 'Torta diseñada para tu evento', price: 180, icon: '🎂', category: 'catering' }
  ]);

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
    // Efecto simplificado para pre-llenar datos del usuario
    effect(() => {
      const user = this.authService.currentUser();
      if (user && !this.eventReservation().customerName) {
        this.eventReservation.update(reservation => ({
          ...reservation,
          customerName: user.name,
          customerEmail: user.email
        }));
      }
    }, { allowSignalWrites: true });

    // Generar fechas disponibles (próximos 60 días, excluyendo pasadas)
    this.generateAvailableDates();
  }

  private generateAvailableDates() {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    this.availableDates.set(dates);
  }

  nextStep() {
    if (this.step() < 6) {
      this.step.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.step() > 1) {
      this.step.update(s => s - 1);
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

  getMenuItemQuantity(item: MenuItem): number {
    const found = this.eventReservation().menuItems.find(mi => mi.item.id === item.id);
    return found ? found.quantity : 0;
  }

  increaseMenuItem(item: MenuItem) {
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

  decreaseMenuItem(item: MenuItem) {
    this.eventReservation.update(res => {
      const existingIndex = res.menuItems.findIndex(mi => mi.item.id === item.id);
      
      if (existingIndex >= 0) {
        const currentQuantity = res.menuItems[existingIndex].quantity;
        
        if (currentQuantity <= 1) {
          // Remove item if quantity becomes 0
          return {
            ...res,
            menuItems: res.menuItems.filter(mi => mi.item.id !== item.id)
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

  canProceedFromStep3(): boolean {
    const res = this.eventReservation();
    const hasBasicSelection = !!(res.tableDistribution && res.linenColor);
    
    if (!res.includeMenu) {
      return hasBasicSelection;
    }
    
    // If menu is included, must have at least one menu item
    return hasBasicSelection && res.menuItems.length > 0;
  }

  // Step 4 methods
  getServicesByCategory(category: 'entertainment' | 'service' | 'catering'): AdditionalService[] {
    return this.additionalServices().filter(service => service.category === category);
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