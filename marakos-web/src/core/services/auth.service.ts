import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private readonly USER_STORAGE_KEY = 'marakos_user';
  
  private users = signal<User[]>([
    { id: '1', name: 'Usuario de Prueba', email: 'test@marakos.pe', role: 'Cliente', phone: '987654321' },
    { id: '2', name: 'Admin', email: 'admin@marakos.pe', role: 'Administrador', phone: '912345678' },
    { id: '3', name: 'Ana García', email: 'ana.garcia@example.com', role: 'Cliente', phone: '999888777' }
  ]);
  
  currentUser = signal<User | null>(this.getLoggedInUser());

  constructor() {
    // This could be useful if the user data is changed in another tab
    window.addEventListener('storage', (event) => {
        if (event.key === this.USER_STORAGE_KEY) {
            this.currentUser.set(this.getLoggedInUser());
        }
    });
  }

  private getLoggedInUser(): User | null {
    try {
      const userJson = localStorage.getItem(this.USER_STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
      return null;
    }
  }

  login(email: string, password: string): boolean {
    // Mocking password check
    const user = this.users().find(u => u.email === email);
    if (user) { // In a real app, you'd check password here
      this.currentUser.set(user);
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      if (user.role === 'Administrador') {
          this.router.navigate(['/admin']);
      } else {
          this.router.navigate(['/dashboard']);
      }
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.router.navigate(['']);
  }

  register(name: string, email: string, password: string): boolean {
    if (this.users().some(u => u.email === email)) {
      return false; // User already exists
    }
    const newUser: User = {
      id: `${Date.now()}`,
      name,
      email,
      role: 'Cliente'
    };
    this.users.update(users => [...users, newUser]);
    // Automatically log in the new user
    this.currentUser.set(newUser);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(newUser));
    this.router.navigate(['/dashboard']);
    return true;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'Administrador';
  }

  updateUserProfile(data: Partial<User>): boolean {
    const current = this.currentUser();
    if (!current) return false;
    
    const updatedUser = { ...current, ...data };
    this.currentUser.set(updatedUser);
    this.users.update(users => users.map(u => u.id === current.id ? updatedUser : u));
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(updatedUser));
    return true;
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