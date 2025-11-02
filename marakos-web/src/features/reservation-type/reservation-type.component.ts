import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-type',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-type.component.html',
  styleUrls: ['./reservation-type.component.css']
})
export class ReservationTypeComponent implements OnInit, OnDestroy {
  
  currentSlide = 0;
  autoSlideInterval?: ReturnType<typeof setInterval>;

  constructor(private cdr: ChangeDetectorRef, private router: Router) {}
  
  // Proveedores de decoración (publicidad pagada)
  decorationProviders = [
    {
      id: 1,
      name: 'Eventos Mágicos Chiclayo',
      tagline: 'Transformamos tus sueños en realidad',
      description: 'Especialistas en decoración de bodas, quinceañeros y eventos corporativos. Más de 15 años creando momentos únicos.',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      services: ['Bodas', 'Quinceañeros', 'Eventos Corporativos', 'Baby Showers'],
      phone: '+51 974 123 456',
      email: 'contacto@eventosmagicos.pe',
      website: 'www.eventosmagicos.pe',
      rating: 4.9,
      isSponsored: true
    },
    {
      id: 2,
      name: 'Decoraciones Elegance',
      tagline: 'Elegancia en cada detalle',
      description: 'Creamos ambientes sofisticados para tus eventos más importantes. Servicio premium y atención personalizada.',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      services: ['Eventos Premium', 'Decoración Floral', 'Centros de Mesa', 'Iluminación'],
      phone: '+51 987 654 321',
      email: 'info@elegance.pe',
      website: 'www.elegance.pe',
      rating: 4.8,
      isSponsored: true
    },
    {
      id: 3,
      name: 'Fiesta Total Deco',
      tagline: 'Tu celebración, nuestra pasión',
      description: 'Especialistas en decoración temática y eventos infantiles. Hacemos que cada celebración sea inolvidable.',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      services: ['Eventos Infantiles', 'Decoración Temática', 'Globos', 'Animación'],
      phone: '+51 965 123 789',
      email: 'eventos@fiestatotal.pe',
      website: 'www.fiestatotal.pe',
      rating: 4.7,
      isSponsored: true
    },
    {
      id: 4,
      name: 'Ambientes & Diseño',
      tagline: 'Diseño único para ocasiones especiales',
      description: 'Creamos ambientes únicos con un toque moderno y sofisticado. Especialistas en eventos empresariales.',
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      services: ['Eventos Empresariales', 'Conferencias', 'Lanzamientos', 'Networking'],
      phone: '+51 912 345 678',
      email: 'contacto@ambientesydiseno.pe',
      website: 'www.ambientesydiseno.pe',
      rating: 4.9,
      isSponsored: true
    }
  ];

  reservationTypes = [
    {
      id: 'mesa',
      title: 'Reserva tu Mesa',
      subtitle: 'Para una experiencia gastronómica íntima',
      description: 'Reserva una mesa para disfrutar de nuestra exquisita carta en un ambiente acogedor. Perfecto para cenas románticas, reuniones familiares o encuentros con amigos.',
      icon: '🍽️',
      route: '/booking/mesa',
      features: [
        'Selección de mesa preferida',
        'Horarios flexibles',
        'Menú completo disponible',
        'Ambiente íntimo y acogedor'
      ],
      buttonText: 'Reservar Mesa',
      color: 'amber'
    },
    {
      id: 'evento',
      title: 'Planifica tu Evento',
      subtitle: 'Para celebraciones especiales y eventos corporativos',
      description: 'Organiza eventos especiales, celebraciones de cumpleaños, reuniones corporativas o cualquier ocasión importante. Ofrecemos servicios personalizados para hacer tu evento memorable.',
      icon: '🎉',
      route: '/booking/evento',
      features: [
        'Espacios privados disponibles',
        'Menús personalizados',
        'Decoración especializada',
        'Servicio de eventos completo'
      ],
      buttonText: 'Planificar Evento',
      color: 'emerald'
    }
  ];

  // Métodos para el carrusel
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.decorationProviders.length;
    this.cdr.markForCheck();
    this.pauseAndRestart();
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.decorationProviders.length - 1 : this.currentSlide - 1;
    this.cdr.markForCheck();
    this.pauseAndRestart();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.cdr.markForCheck();
    this.pauseAndRestart();
  }

  // Pausa temporal cuando el usuario navega manualmente
  private pauseAndRestart() {
    this.stopAutoSlide();
    setTimeout(() => {
      this.startAutoSlide();
    }, 8000); // Reinicia después de 8 segundos
  }

  // Auto-avanzar el carrusel
  ngOnInit() {
    this.simpleAutoSlide();
  }

  // Auto-slide cada 5 segundos
  simpleAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.decorationProviders.length;
      this.cdr.markForCheck();
    }, 5000);
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    if (!this.autoSlideInterval) {
      this.simpleAutoSlide();
    }
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = undefined;
    }
  }

  // Transform CSS para el carrusel
  get transformValue() {
    return `translateX(-${this.currentSlide * 100}%)`;
  }

  // Método para contactar proveedor (genera comisión)
  contactProvider(provider: any, method: 'phone' | 'email' | 'website') {
    // Aquí se podría registrar la conversión para analytics y comisiones
    console.log(`Contacto generado: ${provider.name} - ${method}`);
    
    switch(method) {
      case 'phone':
        window.open(`tel:${provider.phone}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:${provider.email}?subject=Consulta desde Marakos Grill - Decoración para Evento`, '_blank');
        break;
      case 'website':
        window.open(`https://${provider.website}`, '_blank');
        break;
    }
  }

  // Método para navegar a las páginas de reserva
  navigateToBooking(route: string) {
    // Feedback visual opcional
    const routeType = route.includes('mesa') ? 'mesa' : 'evento';
    
    this.router.navigate([route]).catch(error => {
      console.error('Error al navegar:', error);
    });
  }

}