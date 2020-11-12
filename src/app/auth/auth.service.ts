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
  public login(user: User): Observable<User> {
    return this.http.post<User>(environment.API_URL + '/login', user).pipe(
      // tap(response => this.globalEvents.setAuthUser(response.data)),
      // catchError(response => this.handleError(response)),
    );
  }
}
