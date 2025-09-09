import { DatePipe, registerLocaleData } from '@angular/common';
import localEnGb from '@angular/common/locales/en-GB';
import { Component, computed, inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { finalize, noop } from 'rxjs';

import { ConfirmationComponent } from '../_shared/modals/confirmation/confirmation.component';
import { Customer } from '../_shared/models/Customer';
import { Driver } from '../_shared/models/Driver';
import { Manager } from '../_shared/models/Manager';
import { Ride } from '../_shared/models/Ride';
import { ToastService } from '../_shared/services/toast.service';
import { AuthStore } from '../_shared/store/auth/auth.store';
import { RideService } from '../_shared/store/ride.service';
import { CustomerService } from '../_shared/store/user/customer.service';
import { DriverService } from '../_shared/store/user/driver.service';
import { ManagerService } from '../_shared/store/user/manager.service';

registerLocaleData(localEnGb, 'en-GB');

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [RouterLink, FaIconComponent, NgbPagination, FormsModule, DatePipe],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'en-GB' }],
})
export class UserDetailComponent implements OnInit {
  private customerService = inject(CustomerService);
  private driverService = inject(DriverService);
  private managerService = inject(ManagerService);
  private rideService = inject(RideService);
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);

  protected isCustomer = computed(() => {
    return this.authStore.type() === 'customer';
  });
  protected isDriver = computed(() => {
    return this.authStore.type() === 'driver';
  });
  protected isManager = computed(() => {
    return this.authStore.type() === 'manager';
  });

  protected readonly faTrash = faTrash;
  protected readonly faEdit = faEdit;
  protected readonly faSpinner = faSpinner;

  protected isLoading: boolean = false;
  protected isLoadingRides: boolean = false;
  protected isLoadingDelete: boolean = false;
  protected user: Customer | Driver | null = null;
  protected userDriver: Driver | null = null;
  protected customer: Customer | null = null;
  protected driver: Driver | null = null;
  protected type?: string;

  protected page = 1;
  protected pageSize = 10;
  protected collectionSize = 0;
  protected rides: Ride[] = [];

  ngOnInit() {
    const user = this.authStore.user();
    this.type = this.authStore.type();
    if (!user || !this.type) {
      this.authStore.clearAuthUser();
      this.router.navigate(['/login']);
      return;
    }
    if (this.type === 'customer') {
      this.getCustomerData(user.id);
    }
    if (this.type === 'driver') {
      this.getDriverData(user.id);
    }
    if (this.type === 'manager') {
      this.getManagerData(user.id);
      return;
    }
    this.getRides(this.type, user.id);
  }

  getCustomerData(userId: number) {
    this.isLoading = true;
    this.customerService
      .show(userId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.user = res as Customer;
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
          this.router.navigate(['/']);
        },
      });
  }

  getDriverData(userId: number) {
    this.isLoading = true;
    this.driverService
      .show(userId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.user = res as Driver;
          this.userDriver = res as Driver;
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
          this.router.navigate(['/']);
        },
      });
  }

  getManagerData(userId: number) {
    this.isLoading = true;
    this.managerService
      .show(userId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.user = res as Manager;
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
          this.router.navigate(['/']);
        },
      });
  }

  getRides(type: string, userId: number) {
    this.isLoadingRides = true;
    this.rideService
      .index(this.page, this.pageSize, '', false, true, { key: `${type}_id`, value: userId })
      .pipe(finalize(() => (this.isLoadingRides = false)))
      .subscribe({
        next: (res) => {
          this.collectionSize = res.total;
          this.rides = res.data;
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
          this.router.navigate(['/']);
        },
      });
  }

  refreshRides() {
    this.getRides(this.type!, this.user!.id);
  }

  onDeleteClick() {
    const modalRef = this.modalService.open(ConfirmationComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop',
      windowClass: 'd-flex justify-content-center align-items-center aaa',
      size: 'lg',
    });
    modalRef.componentInstance.title = 'Upozorenje';
    modalRef.componentInstance.sentence = 'Da li ste sigurni da želite da izbrišete svoj nalog?';
    modalRef.componentInstance.confirmation = 'Da';
    modalRef.result
      .then(() => {
        this.deleteUser();
      })
      .catch(() => noop());
  }

  deleteUser() {
    this.isLoadingDelete = true;
    this.customerService
      .destroy(this.user!.id)
      .pipe(finalize(() => (this.isLoadingDelete = false)))
      .subscribe({
        next: () => {
          this.authStore.clearAuthUser();
          this.toastService.success('Uspešno ste obrisali svoj nalog!');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
        },
      });
  }
}
