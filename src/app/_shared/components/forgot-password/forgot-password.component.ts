import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';

@Component({
             selector:    'app-forgot-password',
             templateUrl: './forgot-password.component.html',
             styleUrls:   ['./forgot-password.component.css']
           })
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  @Input() insertedEmail: string;
  email: FormControl;
  isLoading                     = 0;

  constructor(private modalRef: NgbActiveModal,
              private authService: AuthService,
              private toastrService: ToastrService) {
  }

  /**
   * Start component.
   *
   * @return void
   */
  ngOnInit(): void {

    this.buildEmailForm();
  }

  /**
   * Build email form.
   *
   * @return void
   */
  buildEmailForm(): void {

    this.email = new FormControl(this.insertedEmail ? this.insertedEmail : '', [
      Validators.required,
      Validators.email
    ]);
  }

  /**
   * Close this modal.
   *
   * @return void
   */
  hideForgotPasswordModal(): void {

    this.modalRef.close();
  }

  /**
   * Call authentication service forgotPassword method.
   *
   * @return void
   */
  send(): void {

    this.isLoading++;
    this.subscriptions.push(
      this.authService.forgotPassword(this.email.value)
        .pipe(finalize(() => this.isLoading--))
        .subscribe(
          () => {
            this.toastrService.success('Poruka za zaboravljenu lozinku je poslata na Vašu e-adresu.');
            this.modalRef.close();
          },
          error => {
            if (error.status === 422) {
              if (error.error.errors.email[0] === 'Please wait before retrying.') {
                this.toastrService.error('Već ste poslali zahtev, proverite e-adresu!');
                this.modalRef.close();
              }
              if (error.error.errors.email[0] === 'We can\'t find a user with that email address.') {
                this.toastrService.error('Ne postoji korisnik sa unetom e-adresom!');
              }
            } else {
              console.log(error);
              this.toastrService.error('Došlo je do greške, osvežite stranicu i pokušajte ponovo!');
              this.modalRef.close();
            }
          })
    );
  }

  /**
   * Unsubscribe all subscriptions.
   *
   * @return void
   */
  ngOnDestroy(): void {

    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

}
