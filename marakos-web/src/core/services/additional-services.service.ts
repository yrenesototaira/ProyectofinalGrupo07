import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { AdditionalService } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class AdditionalServicesService {
  private readonly apiUrl = 'http://localhost:8083/api/service'; // management-service port
  private additionalServices = signal<AdditionalService[]>([]);

  // Mock data as fallback (will be replaced by API data when available)
  private readonly mockServices: AdditionalService[] = [
    // Entertainment Services
    { 
      id: 1, 
      name: 'DJ Profesional', 
      description: 'Música y animación para toda la noche', 
      unit: 'evento',
      price: 300, 
      status: 'DISPONIBLE',
      active: true,
      icon: '🎧', 
      category: 'entertainment',
      tipo_servicio: 'entretenimiento'
    },
    { 
      id: 2, 
      name: 'Mariachi', 
      description: 'Grupo tradicional mexicano', 
      unit: 'evento',
      price: 450, 
      status: 'DISPONIBLE',
      active: true,
      icon: '🎺', 
      category: 'entertainment',
      tipo_servicio: 'entretenimiento'
    },
    { 
      id: 3, 
      name: 'Karaoke', 
      description: 'Diversión garantizada para todos', 
      unit: 'evento',
      price: 150, 
      status: 'DISPONIBLE',
      active: true,
      icon: '🎤', 
      category: 'entertainment',
      tipo_servicio: 'entretenimiento'
    },
    { 
      id: 4, 
      name: 'Fotografía Profesional', 
      description: 'Captura todos los momentos especiales', 
      unit: 'evento',
      price: 400, 
      status: 'DISPONIBLE',
      active: true,
      icon: '📸', 
      category: 'entertainment',
      tipo_servicio: 'entretenimiento'
    },
    
    // Service Services
    { 
      id: 5, 
      name: 'Mesero Adicional', 
      description: 'Servicio personalizado extra', 
      unit: 'persona',
      price: 80, 
      status: 'DISPONIBLE',
      active: true,
      icon: '👨‍💼', 
      category: 'service',
      tipo_servicio: 'personal'
    },
    { 
      id: 6, 
      name: 'Valet Parking', 
      description: 'Servicio de estacionamiento', 
      unit: 'evento',
      price: 120, 
      status: 'DISPONIBLE',
      active: true,
      icon: '🚗', 
      category: 'service',
      tipo_servicio: 'logistica'
    },
    { 
      id: 7, 
      name: 'Seguridad Privada', 
      description: 'Vigilancia profesional del evento', 
      unit: 'persona',
      price: 200, 
      status: 'DISPONIBLE',
      active: true,
      icon: '👮‍♂️', 
      category: 'service',
      tipo_servicio: 'seguridad'
    },
    
    // Catering Services
    { 
      id: 8, 
      name: 'Barra Libre Premium', 
      description: 'Bebidas alcohólicas ilimitadas 4hrs', 
      unit: 'evento',
      price: 500, 
      status: 'DISPONIBLE',
      active: true,
      icon: '🍹', 
      category: 'catering',
      tipo_servicio: 'bebidas'
    },
    { 
      id: 9, 
      name: 'Chef en Vivo', 
      description: 'Preparación de platos en vivo', 
      unit: 'evento',
      price: 350, 
      status: 'DISPONIBLE',
      active: true,
      icon: '👨‍🍳', 
      category: 'catering',
      tipo_servicio: 'gastronomia'
    },
    { 
      id: 10, 
      name: 'Torta Personalizada', 
      description: 'Torta diseñada para tu evento', 
      unit: 'evento',
      price: 180, 
      status: 'DISPONIBLE',
      active: true,
      icon: '🎂', 
      category: 'catering',
      tipo_servicio: 'reposteria'
    }
  ];

  constructor(private http: HttpClient) {
    this.loadServices();
  }

  /**
   * Loads services from the API, falls back to mock data if API is not available
   */
  loadServices(): void {
    this.getServicesFromAPI().subscribe({
      next: (services) => {
        if (services.length > 0) {
          // Map API response to our format and add missing properties
          const mappedServices = services.map(service => this.mapApiServiceToModel(service));
          this.additionalServices.set(mappedServices);
          console.log('Services loaded from API:', mappedServices);
        } else {
          // Fallback to mock data
          this.additionalServices.set(this.mockServices);
          console.log('Using mock services data');
        }
      },
      error: (error) => {
        console.warn('API not available, using mock data:', error);
        this.additionalServices.set(this.mockServices);
      }
    });
  }

  /**
   * Gets services from the backend API
   */
  private getServicesFromAPI(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/findAll?active=true`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching services from API:', error);
          return of([]); // Return empty array on error
        })
      );
  }

  /**
   * Maps API service response to our AdditionalService model
   */
  private mapApiServiceToModel(apiService: any): AdditionalService {
    // Get tipo_servicio from API response (handle different possible field names)
    const tipoServicio = apiService.tipo_servicio || apiService.tipoServicio || apiService.type;
    
    return {
      id: apiService.id,
      name: apiService.name,
      description: apiService.description || '',
      unit: apiService.unit || 'evento',
      price: apiService.price || 0,
      status: apiService.status || 'DISPONIBLE',
      active: apiService.active !== false,
      tipo_servicio: tipoServicio,
      category: this.mapDatabaseTypeToCategory(tipoServicio),
      icon: apiService.icon || this.getIconForService(apiService.name) // Use API icon or fallback
    };
  }

  /**
   * Maps database tipo_servicio field to our category enum
   */
  private mapDatabaseTypeToCategory(tipoServicio: string): 'entertainment' | 'service' | 'catering' {
    if (!tipoServicio) return 'service'; // Default fallback
    
    const tipo = tipoServicio.toLowerCase();
    
    // Map database categories to frontend categories
    if (tipo.includes('entretenimiento') || tipo.includes('entertainment') || 
        tipo.includes('animacion') || tipo.includes('musica')) {
      return 'entertainment';
    }
    
    if (tipo.includes('catering') || tipo.includes('comida') || tipo.includes('bebida') || 
        tipo.includes('gastronomia') || tipo.includes('alimentacion')) {
      return 'catering';
    }
    
    return 'service'; // Default to service category for personnel, security, etc.
  }

  /**
   * Maps service name to category for UI grouping (fallback method)
   */
  private mapServiceToCategory(serviceName: string): 'entertainment' | 'service' | 'catering' {
    const name = serviceName.toLowerCase();
    
    if (name.includes('dj') || name.includes('mariachi') || name.includes('karaoke') || 
        name.includes('fotografía') || name.includes('animador') || name.includes('música')) {
      return 'entertainment';
    }
    
    if (name.includes('barra') || name.includes('chef') || name.includes('torta') || 
        name.includes('dulces') || name.includes('bebida')) {
      return 'catering';
    }
    
    return 'service'; // Default to service category
  }

  /**
   * Gets appropriate icon for service based on name
   */
  private getIconForService(serviceName: string): string {
    const name = serviceName.toLowerCase();
    
    if (name.includes('dj')) return '🎧';
    if (name.includes('mariachi')) return '🎺';
    if (name.includes('karaoke')) return '🎤';
    if (name.includes('fotografía')) return '📸';
    if (name.includes('mozo') || name.includes('mesero')) return '👨‍💼';
    if (name.includes('seguridad')) return '👮‍♂️';
    if (name.includes('barra')) return '🍹';
    if (name.includes('chef')) return '👨‍🍳';
    if (name.includes('torta')) return '🎂';
    if (name.includes('bartender')) return '🍸';
    if (name.includes('decoración')) return '🎨';
    if (name.includes('animador')) return '🎪';
    if (name.includes('proyector')) return '📽️';
    if (name.includes('dulces')) return '🍭';
    if (name.includes('limpieza')) return '🧹';
    
    return '⚙️'; // Default icon
  }

  /**
   * Gets all available services
   */
  getServices() {
    return this.additionalServices.asReadonly();
  }

  /**
   * Gets services filtered by category
   */
  getServicesByCategory(category: 'entertainment' | 'service' | 'catering'): AdditionalService[] {
    return this.additionalServices().filter(service => service.category === category);
  }

  /**
   * Refreshes services from API
   */
  refreshServices(): void {
    this.loadServices();
  }
}