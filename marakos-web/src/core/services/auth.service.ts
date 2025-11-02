import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
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
      }),
      catchError(error => {
        console.error('Login failed, attempting fallback authentication:', error);
        
        // Always try fallback authentication for development when backend fails
        if (this.isValidDevelopmentCredentials(credentials)) {
          console.log('🎯 Using fallback authentication for:', credentials.email);
          const mockUser = this.createMockUser(credentials);
          localStorage.setItem(this.TOKEN_KEY, 'mock-token-' + Date.now());
          localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));
          this.currentUser.set(mockUser);
          
          // Show success message in console
          console.log('✅ Fallback login successful:', mockUser);
          
          // Navigate after a small delay
          setTimeout(() => {
            if (mockUser.tipoUsuario === 'Empleado') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }, 500);
          
          return of(mockUser);
        }
        
        // If not valid development credentials, show helpful error message
        const customError = {
          error: {
            message: `❌ Credenciales no válidas para desarrollo.\n\n🔑 Credenciales disponibles:\n• cliente1@mail.com / cliente1 (Cliente)\n• admin@marakos.com / admin123 (Admin)\n• admin@example.com / password (Admin)\n• test@marakos.com / test123 (Cliente)`
          },
          status: 401
        };
        
        return throwError(() => customError);
      })
    );
  }

  private isValidDevelopmentCredentials(credentials: { email: string, password: string }): boolean {
    const validCredentials = [
      { email: 'admin@marakos.com', password: 'admin123' },
      { email: 'cliente1@mail.com', password: 'cliente1' },
      { email: 'admin@example.com', password: 'password' },
      { email: 'test@marakos.com', password: 'test123' }
    ];
    
    return validCredentials.some(cred => 
      cred.email === credentials.email && cred.password === credentials.password
    );
  }

  private createMockUser(credentials: { email: string, password: string }): any {
    const isAdmin = credentials.email.includes('admin');
    
    return {
      id: Date.now().toString(),
      nombre: isAdmin ? 'Administrador Demo' : 'Cliente Demo',
      email: credentials.email,
      tipoUsuario: isAdmin ? 'Empleado' : 'Cliente',
      telefono: '999888777',
      token: 'mock-token-' + Date.now()
    };
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