import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { Driver } from '../../_shared/models/Driver';
import { Ride } from '../../_shared/models/Ride';
import { ToastService } from '../../_shared/services/toast.service';
import { AuthStore } from '../../_shared/store/auth/auth.store';
import { RideService } from '../../_shared/store/ride.service';
import { DriverService } from '../../_shared/store/user/driver.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [DatePipe, FaIconComponent, FormsModule, NgbPagination, ReactiveFormsModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss',
})
export class ManagerDashboardComponent implements OnInit {
  private router = inject(Router);
  private authStore = inject(AuthStore);
  private rideService = inject(RideService);
  private driverService = inject(DriverService);
  private toastService = inject(ToastService);

  protected readonly faSpinner = faSpinner;

  protected isLoadingBestDrivers: boolean = false;
  protected isLoadingRides: boolean = false;
  protected isLoadingDrivers: boolean = false;

  protected search = new FormControl('');
  protected withRequested = false;
  protected withInProgress = false;
  protected page = 1;
  protected pageSize = 10;
  protected collectionSize = 0;
  protected rides: Ride[] = [];

  protected bestDrivers: { driver_id: number; times: number; driver: Driver }[] = [];

  protected searchDriver = new FormControl('');
  protected withActive = true;
  protected pageDriver = 1;
  protected pageSizeDriver = 10;
  protected collectionSizeDriver = 0;
  protected drivers: Driver[] = [];

  ngOnInit() {
    const user = this.authStore.user();
    const type = this.authStore.type();
    if (!user || !type) {
      this.authStore.clearAuthUser();
      this.router.navigate(['/login']);
      return;
    }
    this.getBestDrivers();
    this.getRides();
    this.getDrivers();
    this.search.valueChanges.pipe(debounceTime(600), distinctUntilChanged()).subscribe(() => {
      this.refreshRides();
    });
    this.searchDriver.valueChanges.pipe(debounceTime(600), distinctUntilChanged()).subscribe(() => {
      this.refreshDrivers();
    });
  }

  getBestDrivers() {
    this.isLoadingBestDrivers = true;
    this.rideService
      .bestDrivers()
      .pipe(finalize(() => (this.isLoadingBestDrivers = false)))
      .subscribe({
        next: (res: { driver_id: number; times: number; driver: Driver }[]) => {
          this.bestDrivers = res;
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
        },
      });
  }

  getRides() {
    this.isLoadingRides = true;
    this.rideService
      .index(this.page, this.pageSize, this.search.value ?? '', this.withRequested, this.withInProgress)
      .pipe(finalize(() => (this.isLoadingRides = false)))
      .subscribe({
        next: (res) => {
          this.collectionSize = res.total;
          this.rides = res.data;
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
        },
      });
  }

  refreshRides() {
    this.getRides();
  }

  getDrivers() {
    this.isLoadingDrivers = true;
    this.driverService
      .index(this.pageDriver, this.pageSizeDriver, this.searchDriver.value ?? '', this.withActive)
      .pipe(finalize(() => (this.isLoadingDrivers = false)))
      .subscribe({
        next: (res) => {
          this.collectionSizeDriver = res.total;
          this.drivers = res.data;
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
        },
      });
  }

  refreshDrivers() {
    this.getDrivers();
  }
}
