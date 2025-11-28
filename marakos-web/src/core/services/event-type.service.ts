import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface EventType {
  idTipoEvento: number;
  nombre: string;
  descripcion: string;
  registroActivo?: boolean;
  registro_activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventTypeService {
  private http = inject(HttpClient);
  private eventTypes = signal<EventType[]>([]);
  
  getEventTypes(): Observable<EventType[]> {
    return this.http.get<EventType[]>(`${environment.apiUrlManagement}/tipo-evento`).pipe(
      tap(types => {
        console.log('Tipos de evento recibidos:', types);
        // Filtrar solo los tipos de evento activos
        const activeTypes = types.filter(type => {
          // Verificar ambos formatos de campo (camelCase y snake_case)
          const isActive = type.registroActivo ?? type.registro_activo;
          // Si el campo no existe (undefined), incluir el tipo por defecto
          // Si existe, solo incluir si es true
          return isActive === undefined || isActive === true;
        });
        console.log('Tipos de evento activos:', activeTypes);
        this.eventTypes.set(activeTypes);
      })
    );
  }
  
  getEventTypesSignal() {
    return this.eventTypes.asReadonly();
  }
}
