import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@/src/environments/environment';

export interface PaymentRequest {
  reservationId: number;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  cardNumber: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
}

export interface PaymentResponse {
  transactionId?: number;
  reservationId: number;
  paymentDate: string;
  paymentMethod: string;
  amount: number;
  status: 'COMPLETED' | 'FAILED' | 'ERROR';
  culqiChargeId?: string;
  currency?: string;
  customerEmail?: string;
  description?: string;
  processedAt?: string;
  referenceCode?: string;
  errorMessage?: string;
  cardLastFour?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrlCulqi;

  /**
   * Process payment using Culqi gateway
   */
  processPaymentWithCulqi(paymentData: PaymentRequest): Observable<PaymentResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<PaymentResponse>(`${this.apiUrl}/culqi`, paymentData, { headers })
      .pipe(
        map(response => {
          return response;
        }),
        catchError(error => {
          console.error('Payment processing failed:', error);
          
          // Handle different error scenarios
          if (error.status === 402) {
            return throwError(() => ({
              ...error,
              userMessage: 'Pago rechazado. Verifique los datos de su tarjeta.'
            }));
          } else if (error.status === 500) {
            return throwError(() => ({
              ...error,
              userMessage: 'Error interno del servidor. Intente nuevamente.'
            }));
          } else {
            return throwError(() => ({
              ...error,
              userMessage: 'Error procesando el pago. Verifique su conexión e intente nuevamente.'
            }));
          }
        })
      );
  }

  /**
   * Validate card number using Luhn algorithm
   */
  validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and non-digits
    const cleaned = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Check if it's a valid length
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Format card number with spaces
   */
  formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const groups = cleaned.match(/(\d{1,4})/g);
    if (groups) {
      return groups.join(' ');
    }
    return cleaned;
  }

  /**
   * Get card type from number
   */
  getCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (/^4/.test(cleaned)) {
      return 'Visa';
    } else if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
      return 'Mastercard';
    } else if (/^3[47]/.test(cleaned)) {
      return 'American Express';
    } else if (/^6/.test(cleaned)) {
      return 'Discover';
    }
    
    return 'Unknown';
  }

  /**
   * Validate CVV
   */
  validateCVV(cvv: string, cardType: string = 'Unknown'): boolean {
    const cleaned = cvv.replace(/[^0-9]/gi, '');
    
    if (cardType === 'American Express') {
      return cleaned.length === 4;
    } else {
      return cleaned.length === 3;
    }
  }

  /**
   * Validate expiration date
   */
  validateExpirationDate(month: string, year: string): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);
    
    // Adjust year if it's 2-digit
    const fullYear = expYear < 100 ? 2000 + expYear : expYear;
    
    if (expMonth < 1 || expMonth > 12) {
      return false;
    }
    
    if (fullYear < currentYear) {
      return false;
    }
    
    if (fullYear === currentYear && expMonth < currentMonth) {
      return false;
    }
    
    return true;
  }
}