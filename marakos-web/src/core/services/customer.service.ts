import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrlCustomer;

  getCustomer(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/${id}`);
  }

  updateCustomer(id: string, data: any): Observable<any> {
    console.log('updateCustomer', data);
    return this.http.patch(`${this.apiUrl}/customer/${id}`, data);
  }
}
