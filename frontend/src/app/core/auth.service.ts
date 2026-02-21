import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  email: string;
  displayName: string;
  isVerified: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.userServiceUrl;

  // Reactive session state
  currentUser = signal<User | null>(this.loadSession());

  constructor(private http: HttpClient) {}

  /** Step 1: Register / request a login token via email */
  register(email: string, displayName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/register`, { email, displayName });
  }

  /** Step 2: Verify the 6-digit token */
  verifyToken(email: string, token: string): Observable<{ user: User }> {
    return this.http.post<{ user: User }>(`${this.baseUrl}/users/verify-token`, { email, token }).pipe(
      tap((res) => this.saveSession(res.user))
    );
  }

  /** Save session to localStorage */
  saveSession(user: User): void {
    localStorage.setItem('cozy_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  /** Load session from localStorage */
  private loadSession(): User | null {
    try {
      const raw = localStorage.getItem('cozy_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Clear session (logout) */
  logout(): void {
    localStorage.removeItem('cozy_user');
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}
