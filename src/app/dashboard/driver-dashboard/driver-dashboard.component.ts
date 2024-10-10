import { NgClass } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { GoogleMapsModule, MapDirectionsRenderer } from '@angular/google-maps';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFlag, faSignsPost, faSpinner, faTaxi, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize, noop } from 'rxjs';

import { AddCustomAddressComponent } from '../../_shared/modals/add-custom-address/add-custom-address.component';
import { ConfirmationComponent } from '../../_shared/modals/confirmation/confirmation.component';
import { Ride } from '../../_shared/models/Ride';
import { ToastService } from '../../_shared/services/toast.service';
import { AuthStore } from '../../_shared/store/auth/auth.store';
import { RideService } from '../../_shared/store/ride.service';
import { AddressComponent } from '../address/address.component';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [NgClass, GoogleMapsModule, AddressComponent, MapDirectionsRenderer, FaIconComponent],
  templateUrl: './driver-dashboard.component.html',
  styleUrl: './driver-dashboard.component.scss',
})
export class DriverDashboardComponent implements OnInit {
  protected readonly faTaxi = faTaxi;
  protected readonly faFlag = faFlag;
  protected readonly faSignsPost = faSignsPost;
  protected readonly faTimes = faTimes;
  protected readonly faSpinner = faSpinner;

  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);
  private rideService = inject(RideService);
  private authStore = inject(AuthStore);

  cityCenter = input.required<{ lat: number; lng: number }>();
  protected options: any = {
    mapId: 'e547d2444e8aaf6f',
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    gestureHandling: 'cooperative',
    zoom: 15,
    maxZoom: 30,
    minZoom: 12,
    clickableIcons: false,
    streetViewControl: false,
  };
  protected addresses: string[] = [];
  icons = input<HTMLElement[]>([]);
  protected myLocation: { lat: number; lng: number } | null = null;
  protected startLocation: { lat: number; lng: number } | null = null;
  protected middleLocations: { lat: number; lng: number }[] = [];
  protected endLocation: { lat: number; lng: number } | null = null;

  private geocoder = new google.maps.Geocoder();
  private directionsService: google.maps.DirectionsService = new google.maps.DirectionsService();
  protected directionsResult: google.maps.DirectionsResult | null = null;

  protected isLoading = false;
  protected isLoadingCancel = false;
  protected enableStops: boolean = false;
  protected ride: Ride | null = null;

  ngOnInit() {
    this.locateMe();
  }

  locateMe() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.myLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      this.startLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      this.setAddress(position.coords.latitude, position.coords.longitude, 'first');

      this.options = {
        ...this.options,
        center: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      };

      if (this.endLocation) {
        this.createRoute();
      }
    });
  }

  openAddCustomAddressDialog(position: string) {
    const modalRef = this.modalService.open(AddCustomAddressComponent, {
      backdrop: 'static',
      backdropClass: 'z-index-2 modal-backdrop',
      windowClass: 'z-index-2',
      size: 'md',
    });
    modalRef.componentInstance.center = this.cityCenter();
    modalRef.result
      .then((response) => {
        if (response) {
          this.locateAddress(position, response);
        }
      })
      .catch(() => noop());
  }

  locateAddress(position: string, address: string): void {
    const defaultBounds = {
      north: this.cityCenter().lat + 0.1,
      south: this.cityCenter().lat - 0.1,
      east: this.cityCenter().lng + 0.1,
      west: this.cityCenter().lng - 0.1,
    };
    this.geocoder
      .geocode({ address, bounds: defaultBounds })
      .then((result) => {
        this.setMarkers(result.results[0].geometry.location.lat(), result.results[0].geometry.location.lng(), position);
        this.setAddress(result.results[0].geometry.location.lat(), result.results[0].geometry.location.lng(), position);
        if (this.endLocation) {
          this.createRoute();
        }
      })
      .catch((error) => {
        console.error(error);
        this.toastService.error('Nismo pronašli željeno mesto na Google Mapi');
      });
  }

  setMarkers(latitude: number, longitude: number, position: string): void {
    switch (position) {
      case 'first':
        this.startLocation = {
          lat: latitude,
          lng: longitude,
        };
        break;
      case 'middle':
        this.middleLocations.push({
          lat: latitude,
          lng: longitude,
        });
        break;
      case 'last':
        this.endLocation = {
          lat: latitude,
          lng: longitude,
        };
        break;
    }
  }

  setAddress(lat: number, lng: number, position: string): void {
    let address = '';
    this.geocoder
      .geocode({ location: { lat, lng } })
      .then((result) => {
        address = result.results[0].formatted_address;
      })
      .catch((error) => {
        console.error(error);
        address = 'Nepoznata adresa.';
      })
      .finally(() => {
        switch (position) {
          case 'first':
            this.addresses[0] = address;
            break;
          case 'middle':
            this.addresses.splice(this.addresses.length - 1, 0, address);
            break;
          case 'last':
            this.addresses.push(address);
            break;
        }
      });
  }

  createRoute(): void {
    if (!this.startLocation || !this.endLocation) {
      this.toastService.error('Morate uneti pošetnu i završnu lokaciju!');
      return;
    }

    const start = new google.maps.LatLng(this.startLocation.lat, this.startLocation.lng);
    const end = new google.maps.LatLng(this.endLocation.lat, this.endLocation.lng);
    const stops: google.maps.DirectionsWaypoint[] = [];
    for (let i = 0; i < this.middleLocations.length; i++) {
      stops.push({
        location: new google.maps.LatLng(this.middleLocations[i].lat, this.middleLocations[i].lng),
        stopover: true,
      });
    }

    this.directionsService
      .route({
        origin: start,
        destination: end,
        waypoints: stops,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((result) => {
        this.directionsResult = result;
      })
      .catch((error) => {
        this.directionsResult = null;
        this.toastService.error('Kreiranje putanje nije bilo moguće. Pokušajte ponovo kasnije!');
        console.error(error);
      });
  }

  clearRoute() {
    this.startLocation = null;
    this.middleLocations = [];
    this.endLocation = null;
    this.addresses = [];
    this.directionsResult = null;
    this.locateMe();
  }

  updatePoint(location: { lat: number; lng: number }, index: number, isFirst: boolean, isLast: boolean): void {
    let address = '';
    this.geocoder
      .geocode({ location })
      .then((result) => {
        address = result.results[0].formatted_address;
      })
      .catch((error) => {
        console.error(error);
        address = 'Nepoznata adresa.';
      })
      .finally(() => {
        if (isFirst) {
          this.startLocation = location;
          if (!this.endLocation) {
            this.options = {
              ...this.options,
              center: location,
            };
          }
        } else if (isLast) {
          this.endLocation = location;
        } else {
          // addresses includes start location, so it needs to be minus one
          this.middleLocations[index - 1] = location;
        }
        this.addresses[index] = address;
        if (this.endLocation) {
          this.createRoute();
        }
      });
  }

  removePoint(index: number, isLast: boolean): void {
    if (isLast) {
      if (this.middleLocations.length) {
        this.endLocation = this.middleLocations[this.middleLocations.length - 1];
        this.middleLocations.splice(this.middleLocations.length - 1, 1);
      } else {
        this.endLocation = null;
      }
    } else {
      // addresses includes start location, so it needs to be minus one
      this.middleLocations.splice(index - 1, 1);
    }

    this.addresses.splice(index, 1);

    if (this.endLocation) {
      this.createRoute();
      return;
    }
    this.clearRoute();
  }

  orderVehicle() {
    if (!this.endLocation) {
      this.toastService.error('Dodajte završnu lokaciju!');
      return;
    }

    const modalRef = this.modalService.open(ConfirmationComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop',
      size: 'md',
    });

    let totalDistance = 0;
    let totalDuration = 0;
    this.directionsResult?.routes?.[0]?.legs?.forEach((leg) => {
      totalDistance += leg.distance?.value || 0; // distance in meters
      totalDuration += leg.duration?.value || 0; // duration in seconds
    });
    const totalDistanceInKm = totalDistance / 1000;
    const totalDurationInMinutes = Math.floor(totalDuration / 60);

    modalRef.componentInstance.title = 'Potvrda';
    modalRef.componentInstance.sentence = `Vaša vožnja od ${totalDistanceInKm} km bi trajala ${totalDurationInMinutes} min, da li ste sigurni da želite da je poručite?`;
    modalRef.componentInstance.confirmation = 'Da';
    modalRef.result
      .then(() => {
        this.requestVehicle();
      })
      .catch(() => noop());
  }

  requestVehicle() {
    this.isLoading = true;
    this.rideService
      .makeRequest(this.addresses[0], this.addresses[this.addresses.length - 1], this.authStore.user()?.id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.ride = res;
          this.toastService.success('Vožnja je kreirana. Sačekajte potvrdu vozača!');
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
        },
      });
  }

  cancelRide() {
    if (!this.ride) {
      this.toastService.error('Nemate akticnu vožnju!');
      return;
    }
    const rideId = this.ride.id;

    const modalRef = this.modalService.open(ConfirmationComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop',
      size: 'md',
    });

    modalRef.componentInstance.title = 'Potvrda';
    modalRef.componentInstance.sentence = `Da li ste sigurni da želite da otkažete vožnju?`;
    modalRef.componentInstance.confirmation = 'Da';
    modalRef.result
      .then(() => {
        this.dispatchCancelRide(rideId);
      })
      .catch(() => noop());
  }

  dispatchCancelRide(rideId: number) {
    this.isLoadingCancel = true;
    this.rideService
      .cancel(rideId)
      .pipe(finalize(() => (this.isLoadingCancel = false)))
      .subscribe({
        next: () => {
          this.ride = null;
          this.clearRoute();
          this.toastService.success('Vožnja je otkazana.');
        },
        error: (err) => {
          console.error(err);
          if (err.status === 422) {
            this.toastService.error(err.error.message);
          } else {
            this.toastService.error('Nešto je iskrslo. Pokušajte ponovo!');
          }
        },
      });
  }
}
