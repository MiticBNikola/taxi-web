import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faAdd, faClose, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';

import { PhoneNumberControlInputDirective } from '../_shared/directives/phone-number-input.directive';
import { Customer } from '../_shared/models/Customer';
import { PhoneNumber } from '../_shared/models/PhoneNumber';
import { ToastService } from '../_shared/services/toast.service';
import { AuthStore } from '../_shared/store/auth/auth.store';
import { CustomerService } from '../_shared/store/user/customer.service';

@Component({
  selector: 'app-user-editor',
  standalone: true,
  imports: [FaIconComponent, ReactiveFormsModule, NgClass, RouterLink, PhoneNumberControlInputDirective],
  templateUrl: './user-editor.component.html',
  styleUrl: './user-editor.component.scss',
})
export class UserEditorComponent implements OnInit {
  protected readonly faSpinner = faSpinner;
  protected readonly faClose = faClose;
  protected readonly faAdd = faAdd;

  private authStore = inject(AuthStore);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);

  protected isLoading = false;
  protected isLoadingUpdate: boolean = false;

  protected submitted = false;
  protected form: FormGroup | null = null;

  ngOnInit() {
    const user = this.authStore.user() as Customer;
    if (!user) {
      this.authStore.clearAuthUser();
      this.router.navigate(['/login']);
    }
    this.getCustomerData(user.id);
  }

  getCustomerData(userId: number) {
    this.isLoading = true;
    this.customerService
      .show(userId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.buildForm(res as Customer);
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Neštko je iskrslo. Pokušajte ponovo kasnije!');
          this.router.navigate(['/']);
        },
      });
  }

  buildForm(user: Customer) {
    this.form = this.formBuilder.group({
      first_name: [user.first_name, [Validators.required]],
      last_name: [user.last_name, [Validators.required]],
      email: [user.email, [Validators.required, Validators.email]],
      numbers: this.formBuilder.array(this.buildArrayOfNumbers(user.numbers)),
    });
  }

  buildArrayOfNumbers(numbers: PhoneNumber[]) {
    return numbers.map((number) => this.newNumber(number));
  }

  newNumber(number: PhoneNumber) {
    return this.formBuilder.group({
      id: [number?.id],
      number: [number.number, [Validators.required]],
    });
  }

  addNumber() {
    this.numbers.push(this.newNumber({ number: '' }));
  }

  removeNumber(index: number) {
    this.numbers.removeAt(index);
  }

  get numbers(): FormArray<FormGroup> {
    return this.form?.get('numbers') as FormArray;
  }

  onSubmit() {
    this.submitted = true;
    if (this.form?.invalid) {
      this.toastService.error('Molimo Vas popunite sva obavezna polja na ispravan način!');
      return;
    }

    this.updateCustomer(this.prepareData());
  }

  prepareData() {
    const formValue = this.form?.getRawValue();
    return {
      ...formValue,
      numbers: formValue.numbers.map((number: PhoneNumber) => {
        return {
          ...(number.id && { id: number.id }),
          number: number.number,
        };
      }),
    };
  }

  updateCustomer(formData: FormData) {
    this.isLoadingUpdate = true;
    this.customerService
      .update(this.authStore.user()!.id, formData)
      .pipe(finalize(() => (this.isLoadingUpdate = false)))
      .subscribe({
        next: () => {
          this.toastService.success('Profil je uspešno ažuriran!');
          this.router.navigate(['/user']);
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Neštko je iskrslo. Pokušajte ponovo kasnije!');
        },
      });
  }
}
