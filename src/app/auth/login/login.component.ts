import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';
import {finalize, tap} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {noop} from 'rxjs';
import {login} from '../auth.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public isLoading = true;

  constructor(public authService: AuthService,
              private router: Router,
              private fb: FormBuilder,
              private store: Store<AppState>) {
  }

  ngOnInit(): void {
    this.getCSRFToken();
    this.defineForm();
    this.isLoading = false;

    this.authService.user().subscribe(res => console.log(res));
  }

  private getCSRFToken() {
    this.authService.getCSRFCookie()
      .subscribe(
        response => {
        },
        error => console.log(error)
      );
  }

  private defineForm(): void {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]]
    });
  }

  public login(form): void {
    this.isLoading = true;
    this.authService.login(form.value)
      .pipe(
        finalize(() => this.isLoading = false),
        tap( user => {
          this.store.dispatch(login({ user }));
          this.router.navigate(['/dashboard']);
        })
        )
      .subscribe(
        noop,
        error => {
          console.log(error);
        }
      );
  }
}
