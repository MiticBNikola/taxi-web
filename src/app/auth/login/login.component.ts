import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ForgotPasswordComponent } from '../../_shared/components/forgot-password/forgot-password.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers';
import { login } from '../auth.actions';

@Component({
             selector:    'app-login',
             templateUrl: './login.component.html',
             styleUrls:   ['./login.component.css']
           })
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  submitted = false;
  csrfToken = false;

  constructor(public authService: AuthService,
              private router: Router,
              private formBuilder: FormBuilder,
              private store: Store<AppState>,
              private toastrService: ToastrService,
              private modalService: NgbModal) {
  }

  /**
   * Start component.
   *
   * @return void
   */
  ngOnInit(): void {

    this.getCSRFToken();
    this.buildLoginForm();
    this.authService.user()
      .subscribe(res => console.log(res));
  }

  /**
   * Call auth service get csrf cookie method,
   *
   * @private
   *
   * @return void
   */
  private getCSRFToken(): void {

    this.authService.getCSRFCookie()
      .subscribe(
        () => {
          this.csrfToken = true;
        },
        error => {
          console.log(error);
          this.toastrService.error('Greška prilikom pribavljanja podataka. Osvežite stranicu.');
        }
      );
  }

  /**
   * Build login form.
   *
   * @return void
   */
  buildLoginForm(): void {

    this.loginForm = this.formBuilder.group({
                                              email:    [
                                                '',
                                                [
                                                  Validators.required,
                                                  Validators.email
                                                ]
                                              ],
                                              password: [
                                                '',
                                                [
                                                  Validators.required,
                                                  Validators.minLength(8)
                                                ]
                                              ]
                                            });
  }

  /**
   * If login form is valid, dispatch login action.
   *
   * @return void
   */
  login(): void {

    if (this.loginForm.invalid) {
      this.submitted = true;
      return;
    }
    // this.store.dispatch(login({
    //                             user: {
    //                               email:    this.loginForm.controls.email.value,
    //                               password: this.loginForm.controls.password.value
    //                             }
    //                           }));
  }

  /**
   * Open forgot password modal.
   *
   * @return void
   */
  openForgotPasswordDialog(): void {

    const modalRef                           = this.modalService.open(ForgotPasswordComponent);
    modalRef.componentInstance.insertedEmail = this.loginForm.controls.email.value;
  }
}
