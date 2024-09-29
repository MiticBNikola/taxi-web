import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthStore } from '../store/auth/auth.store';

export function xsrfInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authStore = inject(AuthStore);
  const token = authStore.token && authStore.token();
  const session = authStore.session && authStore.session();

  return next(req.clone({ withCredentials: true, setHeaders: { 'X-XSRF-TOKEN': `${token}`, Authorization: `Bearer ${session}` } }));
}

export function getCookie(name: string) {
  const cookies: Array<string> = document.cookie.split('; ');
  const cookiesLength: number = cookies.length;
  const cookieName = `${name}=`;
  let cookie: string;

  for (let i = 0; i < cookiesLength; i += 1) {
    cookie = cookies[i].replace(/^\+s/g, '');
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }

  return '';
}
