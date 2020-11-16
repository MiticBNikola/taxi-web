import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {AuthService} from '../auth.service';
import {finalize, tap} from 'rxjs/operators';
import {noop} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../../reducers';
import {Router} from '@angular/router';
import {login} from '../auth.actions';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  public registerForm: FormGroup;
  public isLoading = true;

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private store: Store<AppState>,
              private router: Router,
              private toastrService: ToastrService) {
  }

  ngOnInit(): void {
    this.getCSRFToken();
    this.defineForm();
    this.isLoading = false;
  }

  getCSRFToken() {
    this.authService.getCSRFCookie()
      .subscribe(
        response => {
        },
        error => console.log(error)
      );
  }

  defineForm(): void {
    this.registerForm = this.fb.group({
      name: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      password_confirmation: [null, [Validators.required]]
    });
  }

  public register(form): void {
    if (form.invalid || this.checkPasswords(form)) {
      this.getFormValidationErrors(form);
      return;
    }
    this.isLoading = true;
    this.authService.register(form.value)
      .pipe(
        finalize(() => this.isLoading = false),
        tap(user => {
          this.store.dispatch(login({user}));
          this.router.navigate(['/dashboard']);
        }))
      .subscribe(
        noop,
        error => console.log(error)
      );
  }

  getFormValidationErrors(form): void {
    Object.keys(form.controls).forEach(key => {
      const controlErrors: ValidationErrors = form.get(key).errors;
      if (controlErrors != null) {
        this.toastrService.error('Polje: ' + key + ', greška: ' + Object.keys(controlErrors)[0]);
      }
    });
  }

  checkPasswords(form: FormGroup): boolean {
    const password = form.get('password').value;
    const confirmPassword = form.get('password_confirmation').value;
    if (password !== confirmPassword) {
      this.toastrService.error('Lozinka i ponovljena lozinka se ne poklapaju!');
      return true;
    }
    return false;
  }
}
