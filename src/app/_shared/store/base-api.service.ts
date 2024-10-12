import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

import { AuthStore } from './auth/auth.store';

import { environment } from '../../../environments/environment';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class BaseApiService {
  protected apiURL: string = environment.API_URL;
  protected apiDomain: string = environment.API_DOMAIN;
  protected router = inject(Router);
  private http = inject(HttpClient);
  protected authStore = inject(AuthStore);
  protected toastService = inject(ToastService);

  protected get(url: string, options?: object): Observable<any> {
    return this.http.get(url, options).pipe(catchError((err) => this.handleError(err)));
  }
  protected post(url: string, body: any, options?: any): Observable<any> {
    return this.http.post(url, body, options).pipe(catchError((err) => this.handleError(err)));
  }
  protected put(url: string, body: any, options?: any): Observable<any> {
    return this.http.put(url, body, options).pipe(catchError((err) => this.handleError(err)));
  }
  protected delete(url: string, options?: any): Observable<any> {
    return this.http.delete(url, options).pipe(catchError((err) => this.handleError(err)));
  }

  /**
   * Handle all api errors.
   *
   * @param err Error from backend
   *
   * @return Observable<never>
   */
  public handleError(err: any): Observable<never> {
    if (err.error.status === 401 || err.error.status === 403) {
      this.handleAuthError();
    }
    return throwError(() => err);
  }

  /**
   * Handle session error.
   *
   * @return void
   */
  public handleAuthError(): void {
    if (['/user', '/settings'].includes(this.router.url)) {
      this.router.navigateByUrl('/login');
      this.authStore.clearAuthUser();
      this.toastService.show('Vaša sesija je istekla!');
    }
  }
}
