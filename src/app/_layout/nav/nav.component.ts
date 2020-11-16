import {Component, OnInit} from '@angular/core';
import {AppState} from '../../reducers';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {isLoggedIn, isLoggedOut} from '../../auth/auth.selectors';
import {logout} from '../../auth/auth.actions';
import {AuthService} from '../../auth/auth.service';
import { Router} from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;

  constructor(private store: Store<AppState>,
              private authService: AuthService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.isLoggedIn$ = this.store
      .pipe(
        select(isLoggedIn)
      );
    this.isLoggedOut$ = this.store
      .pipe(
        select(isLoggedOut)
      );
  }

  logout(): void {
    this.authService.logout()
      .subscribe(res => {
        this.store.dispatch(logout());
        this.router.navigateByUrl('/');
      });
  }

}
