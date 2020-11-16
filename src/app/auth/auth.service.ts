import { Injectable } from '@angular/core';
import {catchError, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {User} from '../_shared/models/User';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(public http: HttpClient) {
  }
  public login(user): Observable<User> {
    return this.http.post<User>(environment.API_URL + '/login', user);
  }
  public logout() {
    return this.http.post(environment.API_URL + '/logout', {});
  }
  public register(user): Observable<User> {
    return this.http.post<User>(environment.API_URL + '/register', user);
  }
  public getCSRFCookie() {
    return this.http.get(environment.API_DOMAIN + '/sanctum/csrf-cookie');
  }
  public user(): Observable<User> {
    return this.http.get<User>(environment.API_URL + '/user');
  }
}
