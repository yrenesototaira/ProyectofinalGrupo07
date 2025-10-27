import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserType, Role, CreateUserRequest, CreateUserResponse, UserListResponse, PagedUserResponse, UserDetailResponse } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrlAdmin;

  getUserTypes(): Observable<UserType[]> {
    return this.http.get<UserType[]>(`${this.apiUrl}/user-types`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  createUser(request: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${this.apiUrl}/users`, request);
  }

  getAllUsers(): Observable<UserListResponse[]> {
    return this.http.get<UserListResponse[]>(`${this.apiUrl}/users`);
  }

  getUsersPaginated(page: number = 0, size: number = 8, search?: string): Observable<PagedUserResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PagedUserResponse>(`${this.apiUrl}/users/paginated`, { params });
  }

  getUserById(id: number): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(`${this.apiUrl}/users/${id}`);
  }

  getUserDetailById(id: number): Observable<UserDetailResponse> {
    return this.http.get<UserDetailResponse>(`${this.apiUrl}/users/${id}/detail`);
  }

  updateUser(id: number, request: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.put<CreateUserResponse>(`${this.apiUrl}/users/${id}`, request);
  }

  deleteUser(id: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/users/${id}`);
  }
}