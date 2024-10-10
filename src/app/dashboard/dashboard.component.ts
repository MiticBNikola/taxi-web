import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { GoogleMapsModule, MapDirectionsRenderer } from '@angular/google-maps';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AddressComponent } from './address/address.component';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { DriverDashboardComponent } from './driver-dashboard/driver-dashboard.component';

import { AuthStore } from '../_shared/store/auth/auth.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgClass,
    GoogleMapsModule,
    AddressComponent,
    MapDirectionsRenderer,
    FaIconComponent,
    CustomerDashboardComponent,
    DriverDashboardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  protected authStore = inject(AuthStore);

  protected isDriver = computed(() => {
    return this.authStore.user() && this.authStore.type() === 'driver';
  });

  protected cityCenter: { lat: number; lng: number } = {
    lat: 43.320994,
    lng: 21.89573,
  };
  protected icons: HTMLElement[] = [];

  ngOnInit() {
    this.prepareIcons();
  }

  prepareIcons() {
    const parser = new DOMParser();
    const myLocation = `<svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 384 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`;
    const startLocation = `<svg xmlns="http://www.w3.org/2000/svg" width="24" fill="green" viewBox="0 0 320 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M16 144a144 144 0 1 1 288 0A144 144 0 1 1 16 144zM160 80c8.8 0 16-7.2 16-16s-7.2-16-16-16c-53 0-96 43-96 96c0 8.8 7.2 16 16 16s16-7.2 16-16c0-35.3 28.7-64 64-64zM128 480l0-162.9c10.4 1.9 21.1 2.9 32 2.9s21.6-1 32-2.9L192 480c0 17.7-14.3 32-32 32s-32-14.3-32-32z"/></svg>`;
    const endLocation = `<svg xmlns="http://www.w3.org/2000/svg" width="24" fill="red" viewBox="0 0 320 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M16 144a144 144 0 1 1 288 0A144 144 0 1 1 16 144zM160 80c8.8 0 16-7.2 16-16s-7.2-16-16-16c-53 0-96 43-96 96c0 8.8 7.2 16 16 16s16-7.2 16-16c0-35.3 28.7-64 64-64zM128 480l0-162.9c10.4 1.9 21.1 2.9 32 2.9s21.6-1 32-2.9L192 480c0 17.7-14.3 32-32 32s-32-14.3-32-32z"/></svg>`;
    this.icons = [
      parser.parseFromString(myLocation, 'image/svg+xml').documentElement,
      parser.parseFromString(startLocation, 'image/svg+xml').documentElement,
      parser.parseFromString(endLocation, 'image/svg+xml').documentElement,
    ];
  }
}