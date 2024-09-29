import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseApiService {
  baseUrl = `${this.apiURL}/auth`;

  getCsrfCookie(): Observable<any> {
    return this.get(`${this.apiDomain}/sanctum/csrf-cookie`, {});
  }

  authCheck(type?: string): Observable<any> {
    let params = new HttpParams();
    params = type ? params.set('type', type) : params;
    return this.get(`${this.baseUrl}/check`, { params });
  }

  getUser(): Promise<void> {
    return new Promise((resolve) => {
      this.authCheck(this.authStore.type()).subscribe({
        next: (res) => {
          this.authStore.setAuthUser(res.user, res.type);
          resolve();
        },
        error: (err) => {
          console.error(err);
          resolve();
        },
      });
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.post(`${this.apiURL}/login`, { email, password });
  }

  logout(): Observable<any> {
    return this.post(`${this.apiURL}/logout`, { type: this.authStore.type() });
  }

  register(data: any): Observable<any> {
    return this.post(`${this.apiURL}/register`, data);
  }
}
