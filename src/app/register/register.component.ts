import { NgClass } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ToastService } from '../_shared/services/toast.service';
import { AuthService } from '../_shared/store/auth/auth.service';
import { AuthStore } from '../_shared/store/auth/auth.store';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private authStore = inject(AuthStore);
  private formBuilder = inject(FormBuilder);
  private toastService = inject(ToastService);

  protected isLoading: Signal<boolean> = computed(() => {
    return this.authStore.isLoading();
  });

  protected submitted = false;
  protected registerForm: FormGroup = this.formBuilder.group(
    {
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
      type: ['customer'],
    },
    { validators: this.passwordsMatch }
  );

  /**
   * Check if password and password confirmation are the same.
   *
   *  @param registrationFrom Register form data
   *
   *  @return ValidationErrors | null
   */
  private passwordsMatch(registrationFrom: FormGroup): ValidationErrors | null {
    const password = registrationFrom.get('password')?.value;
    const passwordConfirmation = registrationFrom.get('password_confirmation')?.value;

    return password === passwordConfirmation ? null : { passwordsNotMatched: true };
  }

  protected submit(): void {
    if (this.registerForm.invalid) {
      this.submitted = true;
      this.toastService.error('Pravilno popunite sva obavezna polja');
      return;
    }

    this.register(this.registerForm.value);
  }

  private register(formData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    type: string;
  }) {
    this.authStore.setLoading(true);
    this.authService
      .register(formData)
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
