import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers';
import { register } from '../auth.actions';

@Component({
             selector:    'app-register',
             templateUrl: './register.component.html',
             styleUrls:   ['./register.component.css']
           })
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  submitted = false;
  isLoading = true;

  constructor(private authService: AuthService,
              private formBuilder: FormBuilder,
              private store: Store<AppState>) {
  }

  /**
   * Start component.
   *
   * @return void
   */
  ngOnInit(): void {

    this.buildRegistrationForm();
  }

  /**
   * Build registration form.
   *
   * @return void
   */
  buildRegistrationForm(): void {

    this.registerForm = this.formBuilder.group({
                                                 name:                 [
                                                   '',
                                                   [Validators.required]
                                                 ],
                                                 email:                [
                                                   '',
                                                   [
                                                     Validators.required,
                                                     Validators.email
                                                   ]
                                                 ],
                                                 password:             [
                                                   '',
                                                   [
                                                     Validators.required,
                                                     Validators.minLength(8)
                                                   ]
                                                 ],
                                                 passwordConfirmation: [
                                                   '',
                                                   [Validators.required]
                                                 ]
                                               }, {validators: this.passwordsMatch});
  }

  /**
   * Check if password and password confirmation are the same.
   *
   *  @param registrationFrom Register form data
   *
   *  @return ValidationErrors | null
   */
  passwordsMatch(registrationFrom: FormGroup): ValidationErrors | null {

    const password             = registrationFrom.controls.password.value;
    const passwordConfirmation = registrationFrom.controls.passwordConfirmation.value;

    return password === passwordConfirmation ? null : {passwordsNotMatched: true};
  }

  /**
   * If register form is valid, dispatch register.
   *
   * @return void
   */
  public register(): void {

    if (this.registerForm.invalid) {
      this.submitted = true;
      return;
    }
    this.store.dispatch(register({
                                   user: {
                                     name:                 this.registerForm.controls.name.value,
                                     email:                this.registerForm.controls.email.value,
                                     password:             this.registerForm.controls.password.value,
                                     passwordConfirmation: this.registerForm.controls.passwordConfirmation.value,
                                   }
                                 }));
  }

}
