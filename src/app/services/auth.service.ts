import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:44361/api/auth';
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('jwt'));
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  async login(username: string, password: string): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.post<{ token: string }>(`${this.apiUrl}/login`, { username, password }));
      const token = res?.token ?? null;
      if (token) {
        localStorage.setItem('jwt', token);
        this.tokenSubject.next(token);
      } else {
        throw new Error('No token returned');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  logout(): void {
    localStorage.removeItem('jwt');
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }
}
