import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/config';

interface LoginResponse {
  token: string;
  expiresIn?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${API_BASE_URL}/auth`;
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('jwt');
    } catch {
      return null;
    }
  }

  async login(username: string, password: string): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.apiUrl}/login`, { 
          username, 
          password 
        }).pipe(
          catchError(this.handleError)
        )
      );
      
      if (!res?.token) {
        throw new Error('Invalid response from server');
      }

      this.setToken(res.token);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  private setToken(token: string): void {
    try {
      localStorage.setItem('jwt', token);
      this.tokenSubject.next(token);
    } catch (err) {
      console.error('Failed to store token', err);
      throw new Error('Failed to save authentication token');
    }
  }

  logout(): void {
    try {
      localStorage.removeItem('jwt');
    } catch (err) {
      console.error('Failed to remove token', err);
    }
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred during login';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request';
      } else if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else {
        errorMessage = error.error?.message || `Server error: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}