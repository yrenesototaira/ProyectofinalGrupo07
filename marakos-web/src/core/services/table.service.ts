import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Table } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrlManagement;
  
  // Estado local de las mesas
  private tablesSubject = new BehaviorSubject<Table[]>([]);
  public tables$ = this.tablesSubject.asObservable();
  
  // Signal para las mesas
  private tablesSignal = signal<Table[]>([]);
  
  constructor() {
    this.loadTables();
  }

  /**
   * Carga todas las mesas desde la base de datos
   */
  loadTables(): Observable<Table[]> {
    return this.http.get<any[]>(`${this.apiUrl}/table/findAll?active=true`).pipe(
      map(response => this.mapDatabaseTablesToModel(response)),
      tap(tables => {
        this.tablesSubject.next(tables);
        this.tablesSignal.set(tables);
      }),
      catchError(error => {
        console.warn('Error loading tables from database, using mock data:', error);
        // En caso de error, usar datos mock para desarrollo
        const mockTables = this.getMockTables();
        this.tablesSubject.next(mockTables);
        this.tablesSignal.set(mockTables);
        return [mockTables];
      })
    );
  }

  /**
   * Obtiene las mesas como signal
   */
  getTablesSignal() {
    return this.tablesSignal.asReadonly();
  }

  /**
   * Obtiene las mesas disponibles para una fecha, hora y número de personas
   */
  getAvailableTables(date: string, time: string, guests: number): Observable<Table[]> {
    // Por ahora, vamos a usar todas las mesas activas y filtrar localmente
    // porque no tenemos un endpoint específico para disponibilidad aún
    return this.http.get<any[]>(`${this.apiUrl}/table/findAll?active=true`).pipe(
      map(response => {
        const tables = this.mapDatabaseTablesToModel(response);
        // Filtrar por capacidad (simulando disponibilidad)
        return tables.filter(table => table.capacity >= guests);
      }),
      catchError(error => {
        console.warn('Error getting available tables from database, filtering local tables:', error);
        // Fallback: filtrar mesas locales
        const allTables = this.tablesSignal();
        const availableTables = allTables.filter(table => 
          table.isAvailable && table.capacity >= guests
        );
        return [availableTables];
      })
    );
  }

  /**
   * Obtiene una mesa específica por ID
   */
  getTableById(id: number): Observable<Table | null> {
    return this.http.get<any>(`${this.apiUrl}/table/${id}`).pipe(
      map(response => this.mapDatabaseTableToModel(response)),
      catchError(error => {
        console.error('Error getting table by ID:', error);
        const table = this.tablesSignal().find(t => t.id === id) || null;
        return [table];
      })
    );
  }

  /**
   * Reserva una mesa
   */
  reserveTable(tableId: number, reservationData: any): Observable<any> {
    // Por ahora, esto podría ser manejado por el reservation service
    return this.http.post(`${this.apiUrl}/table/${tableId}/reserve`, reservationData);
  }

  /**
   * Libera una mesa
   */
  releaseTable(tableId: number): Observable<any> {
    // Actualizar el estado de la mesa a disponible
    return this.http.patch(`${this.apiUrl}/table/${tableId}`, { status: 'DISPONIBLE' });
  }

  /**
   * Mapea los datos de la base de datos al modelo frontend
   */
  private mapDatabaseTablesToModel(dbTables: any[]): Table[] {
    return dbTables.map(dbTable => this.mapDatabaseTableToModel(dbTable));
  }

  /**
   * Mapea una mesa de la base de datos al modelo frontend
   */
  private mapDatabaseTableToModel(dbTable: any): Table {
    return {
      id: dbTable.id,
      code: dbTable.code,
      capacity: dbTable.capacity || 2,
      isAvailable: dbTable.active && (dbTable.status !== 'OCUPADA' && dbTable.status !== 'RESERVADA'),
      shape: this.mapShapeFromDatabase(dbTable.shape),
      location: dbTable.location || 'Interior',
      number: dbTable.id, // Usar ID como número de mesa
      description: `Mesa ${dbTable.code || dbTable.id}` + (dbTable.location ? ` - ${dbTable.location}` : '')
    };
  }

  /**
   * Mapea la forma de la mesa desde la base de datos
   */
  private mapShapeFromDatabase(shape: string): 'square' | 'round' {
    if (!shape) return 'square';
    
    const lowerShape = shape.toLowerCase().trim();
    
    // Patrones para formas redondas/circulares
    if (lowerShape.includes('redond') || lowerShape.includes('circular') || 
        lowerShape.includes('round') || lowerShape.includes('circle') || 
        lowerShape.includes('circ')) {
      return 'round';
    }
    
    return 'square';
  }

  /**
   * Infiere la forma de la mesa basada en la capacidad (fallback)
   */
  private inferShapeFromCapacity(capacity: number): 'square' | 'round' {
    // Mesas de 6+ personas suelen ser redondas para mejor distribución
    return capacity >= 6 ? 'round' : 'square';
  }

  /**
   * Datos mock para desarrollo/fallback
   */
  private getMockTables(): Table[] {
    return [
      { id: 1, code: 'T01', capacity: 2, isAvailable: true, shape: 'square', location: 'Ventana', number: 1, description: 'Mesa T01 - Ventana' },
      { id: 2, code: 'T02', capacity: 2, isAvailable: true, shape: 'square', location: 'Interior', number: 2, description: 'Mesa T02 - Interior' },
      { id: 3, code: 'T03', capacity: 4, isAvailable: false, shape: 'round', location: 'VIP', number: 3, description: 'Mesa T03 - VIP' },
      { id: 4, code: 'T04', capacity: 4, isAvailable: true, shape: 'square', location: 'Terraza', number: 4, description: 'Mesa T04 - Terraza' },
      { id: 5, code: 'T05', capacity: 6, isAvailable: true, shape: 'round', location: 'VIP', number: 5, description: 'Mesa T05 - VIP' },
      { id: 6, code: 'T06', capacity: 8, isAvailable: true, shape: 'round', location: 'Jardín', number: 6, description: 'Mesa T06 - Jardín' },
      { id: 7, code: 'T07', capacity: 2, isAvailable: true, shape: 'round', location: 'Terraza', number: 7, description: 'Mesa T07 - Terraza' },
      { id: 8, code: 'T08', capacity: 4, isAvailable: true, shape: 'square', location: 'Ventana', number: 8, description: 'Mesa T08 - Ventana' },
      { id: 9, code: 'T09', capacity: 2, isAvailable: true, shape: 'square', location: 'Interior', number: 9, description: 'Mesa T09 - Interior' },
      { id: 10, code: 'T10', capacity: 6, isAvailable: true, shape: 'round', location: 'Jardín', number: 10, description: 'Mesa T10 - Jardín' },
      { id: 11, code: 'T11', capacity: 4, isAvailable: false, shape: 'square', location: 'Terraza', number: 11, description: 'Mesa T11 - Terraza' },
      { id: 12, code: 'T12', capacity: 8, isAvailable: true, shape: 'round', location: 'VIP', number: 12, description: 'Mesa T12 - VIP' },
      { id: 13, code: 'T13', capacity: 2, isAvailable: true, shape: 'square', location: 'Interior', number: 13, description: 'Mesa T13 - Interior' },
      { id: 14, code: 'T14', capacity: 4, isAvailable: true, shape: 'square', location: 'Ventana', number: 14, description: 'Mesa T14 - Ventana' },
      { id: 15, code: 'T15', capacity: 6, isAvailable: true, shape: 'round', location: 'Jardín', number: 15, description: 'Mesa T15 - Jardín' },
    ];
  }

  /**
   * Refresca los datos de las mesas
   */
  refreshTables(): void {
    this.loadTables().subscribe();
  }
}