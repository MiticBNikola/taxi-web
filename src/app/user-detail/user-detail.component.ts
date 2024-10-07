import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { finalize, noop } from 'rxjs';

import { ConfirmationComponent } from '../_shared/modals/confirmation/confirmation.component';
import { Customer } from '../_shared/models/Customer';
import { Driver } from '../_shared/models/Driver';
import { AuthStore } from '../_shared/store/auth/auth.store';
import { RideService } from '../_shared/store/ride.service';
import { CustomerService } from '../_shared/store/user/customer.service';
import { DriverService } from '../_shared/store/user/driver.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [RouterLink, FaIconComponent, NgbPagination, FormsModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  customerService = inject(CustomerService);
  driverService = inject(DriverService);
  rideService = inject(RideService);
  authStore = inject(AuthStore);
  router = inject(Router);
  modalService = inject(NgbModal);

  protected readonly faTrash = faTrash;
  protected readonly faEdit = faEdit;
  protected readonly faSpinner = faSpinner;

  isLoading: boolean = false;
  isLoadingRides: boolean = false;
  isLoadingDelete: boolean = false;
  user: Customer | Driver | null = null;
  customer: Customer | null = null;
  driver: Driver | null = null;
  type?: string;

  page = 1;
  pageSize = 10;
  collectionSize = 0;
  rides: any[] = [];

  ngOnInit() {
    const user = this.authStore.user();
    this.type = this.authStore.type();
    if (!user || !this.type) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.type === 'customer') {
      this.getCustomerData(user.id);
    }
    if (this.type === 'driver') {
      this.getDriverData(user.id);
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
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  getRides(type: string, userId: number) {
    this.isLoadingRides = true;
    this.rideService
      .index(this.page, this.pageSize, { key: `${type}_id`, value: userId })
      .pipe(finalize(() => (this.isLoadingRides = false)))
      .subscribe({
        next: (res) => {
          this.collectionSize = res.total;
          this.rides = res.data;
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  refreshRides() {
    this.getRides(this.type!, this.user!.id);
  }

  onDeleteClick() {
    const modalRef = this.modalService.open(ConfirmationComponent, {
      backdrop: 'static',
      backdropClass: 'modal-danger',
      size: 'md',
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
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
