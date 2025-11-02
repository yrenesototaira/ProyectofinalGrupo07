import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = 'marakos_token';
  private readonly USER_KEY = 'marakos_user';

  currentUser = signal<any | null>(this.getUser());

  private users = signal<User[]>([
    { id: '1', name: 'Usuario de Prueba', email: 'test@marakos.pe', role: 'Cliente', phone: '987654321' },
    { id: '2', name: 'Admin', email: 'admin@marakos.pe', role: 'Administrador', phone: '912345678' },
    { id: '3', name: 'Ana García', email: 'ana.garcia@example.com', role: 'Cliente', phone: '999888777' }
  ]);

  constructor() {
    // This could be useful if the user data is changed in another tab
    window.addEventListener('storage', (event) => {
        if (event.key === this.USER_KEY) {
            this.currentUser.set(this.getLoggedInUser());
        }
    });
  }

  private getLoggedInUser(): User | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
      return null;
    }
  }
  

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response));
        this.currentUser.set(response);
        if (response.tipoUsuario === 'Empleado') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }
   
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, userData).pipe(
      tap(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): any | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.tipoUsuario === 'Empleado';
  }

  changePassword(data: { userId: string, newPassword: string }): Observable<any> {
    console.log('changePassword', data);
    return this.http.post(`${environment.apiUrl}/auth/update-password`, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrlAuth}/auth/forgot-password`, { email });
  }

  resetPassword(data: { email: string, verificationCode: string, newPassword: string }): Observable<any> {
    return this.http.post(`${environment.apiUrlAuth}/auth/reset-password`, data);
  }


  
  // Admin methods
  getAllUsers() {
    return this.users.asReadonly();
  }

  getUserById(id: string): User | undefined {
    return this.users().find(u => u.id === id);
  }

  createUser(user: Omit<User, 'id'>): User {
    const newUser: User = { ...user, id: `${Date.now()}` };
    this.users.update(users => [...users, newUser]);
    return newUser;
  }

  updateUser(updatedUser: User): boolean {
    let found = false;
    this.users.update(users => users.map(u => {
      if (u.id === updatedUser.id) {
        found = true;
        return updatedUser;
      }
      return u;
    }));
    return found;
  }

  deleteUser(id: string): boolean {
    const initialLength = this.users().length;
    this.users.update(users => users.filter(u => u.id !== id));
    return this.users().length < initialLength;
  }
}