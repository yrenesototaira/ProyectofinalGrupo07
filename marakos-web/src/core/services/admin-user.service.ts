import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserListResponse, AdminUser } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);
  private usersSignal = signal<AdminUser[]>([]);

  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<UserListResponse[]>(`${environment.apiUrlAdmin}/users`).pipe(
      map(users => users.map(user => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role
      })))
    );
  }

  loadUsers(): void {
    this.getAllUsers().subscribe({
      next: (users) => {
        this.usersSignal.set(users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.usersSignal.set([]);
      }
    });
  }

  getUsers() {
    return this.usersSignal.asReadonly();
  }

  deleteUser(id: string): Observable<any> {
    // Por ahora mantenemos la lógica local hasta implementar delete en backend
    this.usersSignal.update(users => users.filter(u => u.id !== id));
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }
}