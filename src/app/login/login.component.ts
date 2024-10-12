import { NgClass, NgIf } from '@angular/common';
import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';

import { getCookie } from '../_shared/inetrceptors/xsrfInterceptor';
import { ToastService } from '../_shared/services/toast.service';
import { AuthService } from '../_shared/store/auth/auth.service';
import { AuthStore } from '../_shared/store/auth/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink, NgIf, FaIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  protected readonly faSpinner = faSpinner;
  private authHttpService = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private authStore = inject(AuthStore);
  private toastService = inject(ToastService);

  protected submitted = false;
  protected loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected isLoading: Signal<boolean> = computed(() => {
    return this.authStore.isLoading();
  });

  /**
   * Start component.
   *
   * @return void
   */
  ngOnInit(): void {
    this.getCsrfCookie();
  }

  /**
   * Call auth service get csrf cookie method,
   *
   * @private
   *
   * @return void
   */
  private getCsrfCookie(): void {
    this.authHttpService.getCsrfCookie().subscribe({
      next: () => {
        this.authStore.setToken(getCookie('XSRF-TOKEN'));
      },
      error: (error) => {
        console.log(error);
        this.toastService.error('Greška prilikom pribavljanja tokena. Nije moguće prijaviti se.');
      },
    });
  }

  /**
   * If login form is valid, dispatch login action.
   *
   * @return void
   */
  submit(): void {
    if (this.loginForm?.invalid) {
      this.submitted = true;
      this.toastService.error('Pravilno popunite sva obavezna polja!');
      return;
    }

    this.login(this.loginForm.value);
  }

  private login(formData: { email: string; password: string }) {
    this.authStore.setLoading(true);
    this.authHttpService
      .login(formData.email, formData.password)
      .pipe(finalize(() => this.authStore.setLoading(false)))
      .subscribe({
        next: (res) => {
          this.authStore.setSession(res.token);
          this.authStore.setAuthUser(res.user, res.type);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error(err);
          this.toastService.error(err.error.message);
        },
      });
  }
}
