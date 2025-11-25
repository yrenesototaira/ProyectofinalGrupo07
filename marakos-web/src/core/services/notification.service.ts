import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@/src/environments/environment';

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface WhatsAppNotificationRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reservationCode: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  tableInfo?: string;
  specialRequests?: string;
  paymentType: string;
  paymentStatus?: string;
  totalAmount?: number;
  reservationStatus?: string;
  // Nuevos campos para email mejorado
  reservationType?: string; // "MESA" o "EVENTO"
  reservationId?: number; // ID de la reserva para QR
  hasPreOrder?: boolean; // Indica si tiene pre-orden de comida
  orderItems?: OrderItem[]; // Detalle de la pre-orden
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrlNotification;

  /**
   * Envía notificación de confirmación de reserva por WhatsApp
   */
  sendReservationConfirmation(data: WhatsAppNotificationRequest): Observable<NotificationResponse> {
    const url = `${this.apiUrl}/notification/reservation/confirmed`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('📱 NOTIFICATION SERVICE: Enviando notificación de confirmación a:', url);
    console.log('📱 NOTIFICATION SERVICE: Datos:', data);

    return this.http.post<NotificationResponse>(url, data, { headers })
      .pipe(
        catchError((error) => {
          console.error('❌ NOTIFICATION SERVICE: Error enviando notificación:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Envía notificación de cancelación de reserva por WhatsApp
   */
  sendReservationCancellation(data: Partial<WhatsAppNotificationRequest>): Observable<NotificationResponse> {
    const url = `${this.apiUrl}/notification/reservation/cancelled`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('📱 NOTIFICATION SERVICE: Enviando notificación de cancelación a:', url);
    console.log('📱 NOTIFICATION SERVICE: Datos:', data);

    return this.http.post<NotificationResponse>(url, data, { headers })
      .pipe(
        catchError((error) => {
          console.error('❌ NOTIFICATION SERVICE: Error enviando cancelación:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Formatea el número de teléfono para WhatsApp (añade +51 si no lo tiene)
   */
  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remover espacios, guiones y paréntesis
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Añadir +51 (Perú) si no comienza con +
    if (!cleanPhone.startsWith('+')) {
      return '+51' + cleanPhone;
    }
    
    return cleanPhone;
  }

  /**
   * Verifica si el servicio de notificaciones está disponible
   */
  checkNotificationServiceHealth(): Observable<any> {
    const url = `${this.apiUrl}/notification/health`;
    
    console.log('🔍 NOTIFICATION SERVICE: Verificando estado del servicio');
    
    return this.http.get(url)
      .pipe(
        catchError((error) => {
          console.error('❌ NOTIFICATION SERVICE: Servicio no disponible:', error);
          return throwError(() => error);
        })
      );
  }
}