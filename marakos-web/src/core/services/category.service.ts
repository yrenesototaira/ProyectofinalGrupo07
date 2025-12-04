import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrlManagement;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/category/findAll`);
  }
}
