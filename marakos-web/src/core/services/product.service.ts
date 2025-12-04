import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrlManagement;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/product/public`);
  }

  getProductsByFilters(name?: string, categoryId?: number, active?: boolean): Observable<Product[]> {
    let params = new HttpParams();
    if (name) {
      params = params.append('name', name);
    }
    if (categoryId) {
      params = params.append('categoryId', categoryId.toString());
    }
    if (active !== undefined) {
      params = params.append('active', active.toString());
    }
    return this.http.get<Product[]>(`${this.apiUrl}/product/findAll`, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/product/${id}`);
  }

  createProduct(product: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/product`, product);
  }

  updateProduct(id: number, product: any): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/product/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/product/${id}`);
  }
}
