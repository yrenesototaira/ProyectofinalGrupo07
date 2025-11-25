import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface EventType {
  idTipoEvento: number;
  nombre: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventTypeService {
  private http = inject(HttpClient);
  private eventTypes = signal<EventType[]>([]);
  
  getEventTypes(): Observable<EventType[]> {
    return this.http.get<EventType[]>(`${environment.apiUrlManagement}/tipo-evento`).pipe(
      tap(types => this.eventTypes.set(types))
    );
  }
  
  getEventTypesSignal() {
    return this.eventTypes.asReadonly();
  }
}
