/**
 * Configuración de parámetros para eventos
 * Este archivo centraliza los valores configurables para la planificación de eventos
 */

export interface TableDistributionConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
}

export interface EventShiftConfig {
  id: string;
  name: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface LinenColorConfig {
  id: string;
  name: string;
  hexColor: string;
  price: number;
  imageUrl: string;
}

/**
 * Configuración de distribuciones de mesa
 * Los IDs (1, 2, 3, 4) serán almacenados en el campo tipo_distribucion_mesa de la tabla Reserva
 */
export const TABLE_DISTRIBUTIONS: TableDistributionConfig[] = [
  { 
    id: '1', 
    name: 'Auditorio', 
    description: 'Sillas alineadas en filas orientadas hacia el frente', 
    icon: '🎭',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&auto=format'
  },
  { 
    id: '2', 
    name: 'Cóctel', 
    description: 'Mesas altas y espacios para socializar de pie', 
    icon: '🍸',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop&auto=format'
  },
  { 
    id: '3', 
    name: 'Banquete', 
    description: 'Mesas redondas o rectangulares con sillas alrededor', 
    icon: '🍽️',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop&auto=format'
  },
  { 
    id: '4', 
    name: 'Escuela', 
    description: 'Mesas y sillas en filas, estilo salón de clases', 
    icon: '🏫',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop&auto=format'
  }
];

/**
 * Configuración de colores de manteleria
 * Los IDs (1, 2, 3, 4, 5, 6) serán almacenados en el campo correspondiente de la tabla Reserva
 * Nota: La mantelería es un valor agregado gratuito del restaurante
 */
export const LINEN_COLORS: LinenColorConfig[] = [
  { 
    id: '1', 
    name: 'Blanco Clásico', 
    hexColor: '#FFFFFF', 
    price: 0,
    imageUrl: 'https://cdn.pixabay.com/photo/2015/07/24/15/35/restaurant-858429_640.jpg'
  },
  { 
    id: '2', 
    name: 'Champagne', 
    hexColor: '#F7E7CE', 
    price: 0,
    imageUrl: 'https://img.freepik.com/fotos-premium/hermosas-composiciones-florales-restaurante-ceremonia-boda_73989-22658.jpg?w=300'
  },
  { 
    id: '3', 
    name: 'Dorado', 
    hexColor: '#FFD700', 
    price: 0,
    imageUrl: 'https://www.shutterstock.com/image-photo/cutlery-napkins-plates-flowers-on-260nw-2457423083.jpg'
  },
  { 
    id: '4', 
    name: 'Negro Elegante', 
    hexColor: '#000000', 
    price: 0,
    imageUrl: 'https://www.shutterstock.com/image-photo/white-polyester-napkin-on-dining-260nw-2648343413.jpg'
  },
  { 
    id: '5', 
    name: 'Azul Noche', 
    hexColor: '#191970', 
    price: 0,
    imageUrl: 'https://www.shutterstock.com/image-photo/set-furniture-cafe-vase-flowers-260nw-2175364297.jpg'
  },
  { 
    id: '6', 
    name: 'Vino', 
    hexColor: '#722F37', 
    price: 0,
    imageUrl: 'https://www.shutterstock.com/image-photo/white-red-flower-arrangements-restaurant-260nw-1442103776.jpg'
  }
];

/**
 * Configuración de turnos de evento
 * Los IDs (1, 2, 3) serán almacenados en el campo id_tipo_evento de la tabla Reserva
 */
export const EVENT_SHIFTS: EventShiftConfig[] = [
  { 
    id: '1', 
    name: 'Mañana', 
    timeRange: '08:00 - 12:00', 
    startTime: '08:00', 
    endTime: '12:00', 
    price: 250 
  },
  { 
    id: '2', 
    name: 'Tarde', 
    timeRange: '13:00 - 18:00', 
    startTime: '13:00', 
    endTime: '18:00', 
    price: 350 
  },
  { 
    id: '3', 
    name: 'Noche', 
    timeRange: '20:00 - 00:00', 
    startTime: '20:00', 
    endTime: '00:00', 
    price: 450 
  }
];

/**
 * Configuración de límites de invitados
 */
export const GUEST_LIMITS = {
  MIN: 10,
  MAX: 100
};

/**
 * Configuración de fechas disponibles
 */
export const DATE_CONFIG = {
  DAYS_AHEAD: 90, // Días hacia adelante disponibles para reservar
  START_OFFSET: 1 // Comenzar desde mañana (1 día después de hoy)
};

/**
 * Configuración de precios
 */
export const PRICING_CONFIG = {
  EXTRA_GUEST_THRESHOLD: 50, // Después de cuántos invitados se cobra extra
  EXTRA_GUEST_PRICE: 15, // Precio por invitado adicional
  TAX_RATE: 0.18 // Tasa de impuestos (18%)
};
