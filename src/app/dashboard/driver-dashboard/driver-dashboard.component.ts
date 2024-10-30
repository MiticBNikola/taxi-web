import { NgClass } from '@angular/common';
import { Component, effect, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { GoogleMapsModule, MapDirectionsRenderer } from '@angular/google-maps';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faSpinner, faTaxi } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize, noop } from 'rxjs';

import { AddCustomAddressComponent } from '../../_shared/modals/add-custom-address/add-custom-address.component';
import { Ride } from '../../_shared/models/Ride';
import { EchoService } from '../../_shared/services/echo.service';
import { ToastService } from '../../_shared/services/toast.service';
import { AuthStore } from '../../_shared/store/auth/auth.store';
import { RideService } from '../../_shared/store/ride.service';
import { DriverService } from '../../_shared/store/user/driver.service';
import { AddressComponent } from '../address/address.component';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [NgClass, GoogleMapsModule, AddressComponent, MapDirectionsRenderer, FaIconComponent],
  templateUrl: './driver-dashboard.component.html',
  styleUrl: './driver-dashboard.component.scss',
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
  protected readonly faTaxi = faTaxi;
  protected readonly faSpinner = faSpinner;

  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);
  private driverService = inject(DriverService);
  private rideService = inject(RideService);
  private authStore = inject(AuthStore);
  private echoService = inject(EchoService);

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
  icons = input<HTMLElement[]>([]);
  protected myLocation = signal<{ lat: number; lng: number } | null>(null);
  private timeoutsForDispatchingMyLocation = signal<any[]>([]);

  private geocoder = new google.maps.Geocoder();
  private directionsService: google.maps.DirectionsService = new google.maps.DirectionsService();
  protected directionsResult: google.maps.DirectionsResult | null = null;
  protected directionsDisplayed = signal<number>(0);

  protected isLoadingCheck = false;
  protected isLoadingRequested = false;
  protected isLoadingAccept = false;
  protected isLoadingEndUpdate = false;
  protected isLoadingStart = false;
  protected isLoadingEnd = false;
  protected ride = signal<Ride | null>(null);
  protected newRides = signal<Ride[]>([]);

  constructor() {
    effect(() => {
      const myLoc = this.myLocation();
      const driverId = this.authStore.user()?.id;
      const currentRideId = this.ride()?.id;
      if (myLoc && driverId && currentRideId) {
        this.signalCustomerMyLocation(myLoc, driverId, currentRideId);
      }
    });
  }

  ngOnInit() {
    this.locateMe();
    this.checkForActiveRide();
    this.listenToLocationRequests();
    this.listenToRideRequests();
    this.listenToRideAccepted();
    this.listenToRideCanceled();
    this.listenToRideEndChanged();
  }

  checkForActiveRide() {
    if (!this.authStore.user()) {
      return;
    }
    this.isLoadingCheck = true;
    this.rideService
      .rideStatus(localStorage.getItem('driver_ride_id'), 'driver', this.authStore.user()!.id)
      .pipe(finalize(() => (this.isLoadingCheck = false)))
      .subscribe({
        next: (res: Ride) => {
          if (!res?.id || res?.end_time) {
            this.locateMe();
            this.checkForRequestedRides();
            return;
          }
          this.handleSubmittedRideRes(res);
          if (!res.start_time) {
            this.toastService.success('Klijent Vas očekuje!');
            return;
          }
          this.toastService.success('Vožnja je u toku!');
        },
        error: (err) => {
          console.error(err);
          this.locateMe();
          this.checkForRequestedRides();
        },
      });
  }

  locateMe() {
    navigator.geolocation.getCurrentPosition((position) => {
      // const latlng = {
      //   lat: position.coords.latitude,
      //   lng: position.coords.longitude,
      // };
      const latlng =
        this.authStore.user()!.id === 1
          ? {
              lat: 43.311445,
              lng: 21.926225,
            }
          : {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
      this.myLocation.set(latlng);
      if (!this.directionsResult) {
        this.options = {
          ...this.options,
          center: latlng,
        };
      }
    });
  }

  checkForRequestedRides() {
    this.isLoadingRequested = true;
    this.rideService
      .requestedRides(this.authStore.user()!.id)
      .pipe(finalize(() => (this.isLoadingRequested = false)))
      .subscribe({
        next: (res: Ride[]) => {
          this.newRides.set(res);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  private listenToLocationRequests() {
    this.echoService.listen('drivers', '\\location-requested', (res: { ride: Ride }) => {
      const myLoc = this.myLocation();
      const driverId = this.authStore.user()?.id;
      if (myLoc && driverId && !this.ride()) {
        this.sendMyLocation(myLoc, driverId, res.ride.id);
      }
    });
  }

  sendMyLocation(myLoc: { lat: number; lng: number }, driverId: number, rideId: number) {
    this.driverService.sendMyLocation(myLoc, driverId, rideId).subscribe({
      next: (res: boolean) => {
        console.info(`System is ${!res && 'not'} notified about my location`);
      },
      error: (error) => {
        console.error('System is not notified about my location: ', error);
      },
    });
  }

  private listenToRideRequests() {
    this.echoService.listen('drivers', '\\ride-requested', (res: { ride: Ride }) => {
      this.newRides.set([...this.newRides(), res.ride]);
      this.toastService.show('Dostupna je nova vožnja!');
    });
  }

  private listenToRideAccepted() {
    this.echoService.listen('drivers', '\\ride-accepted', (res: { ride: Ride }) => {
      this.newRides.set(
        this.newRides().filter((singleRide) => {
          if (this.directionsDisplayed() === res.ride.id) {
            this.clearRoute();
          }
          return singleRide.id !== res.ride.id;
        })
      );
    });
  }

  private listenToRideEndChanged() {
    this.echoService.listen('drivers', '\\end-changed', (res: { ride: Ride }) => {
      this.newRides.set(
        this.newRides().map((singleRide) => {
          if (singleRide.id === res.ride.id) {
            return res.ride;
          }
          return singleRide;
        })
      );
    });
    this.echoService.listen(`drivers.${this.authStore.user()!.id}`, '\\end-changed', (res: { ride: Ride }) => {
      this.ride.set(res.ride);
      this.timeoutsForDispatchingMyLocation().forEach((timeoutId) => clearTimeout(timeoutId));
      this.previewRoute(res.ride);
    });
  }

  private listenToRideCanceled() {
    this.echoService.listen('drivers', '\\ride-canceled', (res: { ride: Ride }) => {
      this.newRides.set(
        this.newRides().filter((singleRide) => {
          if (this.directionsDisplayed() === res.ride.id) {
            this.clearRoute();
          }
          return singleRide.id !== res.ride.id;
        })
      );
    });
    this.echoService.listen(`drivers.${this.authStore.user()!.id}`, '\\ride-canceled', (res: { ride: Ride }) => {
      if (this.ride()?.id === res.ride.id) {
        this.toastService.show('Vožnja je otkazana!');
        this.ride.set(null);
        localStorage.removeItem('driver_ride_id');
        this.clearRoute();
        this.timeoutsForDispatchingMyLocation().forEach((timeoutId) => clearTimeout(timeoutId));
        // Check if somehow driver has more than 1 ride
        this.checkForActiveRide();
      }
    });
  }

  previewSelectedRoute(ride: Ride): void {
    this.previewRoute(ride, false);
    this.directionsDisplayed.set(ride.id);
  }

  previewRoute(ride: Ride, imitateDrive = true): void {
    const start = this.myLocation()!;
    let stops: google.maps.DirectionsWaypoint[] = [
      {
        location: { lat: ride.start_lat, lng: ride.start_lng },
        stopover: true,
      },
    ];
    let end = { lat: ride.end_lat!, lng: ride.end_lng! };
    if (!end) {
      this.toastService.show('Završna adresa nije uneta!');
      end = { lat: ride.start_lat, lng: ride.start_lng };
      stops = [];
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
        if (imitateDrive) {
          this.imitateMoving();
        }
        const durationToCustomer = Math.floor((result?.routes?.[0]?.legs?.[0]?.duration?.value || 0) / 60);
        const durationToFinish = Math.floor((result?.routes?.[0]?.legs?.[1]?.duration?.value || 0) / 60);
        this.toastService.show(
          `Potrebno je ${durationToCustomer} min vožnje do korisnika${stops.length ? `, a onda još ${durationToFinish} min do kraja vožnje.` : '.'}`
        );
      })
      .catch((error) => {
        this.directionsResult = null;
        this.directionsDisplayed.set(0);
        this.toastService.error('Kreiranje putanje nije bilo moguće. Pokušajte ponovo kasnije!');
        console.error(error);
      });
  }

  clearRoute() {
    this.directionsResult = null;
    this.directionsDisplayed.set(0);
    this.locateMe();
  }

  acceptRide(ride: Ride) {
    this.isLoadingAccept = true;
    this.rideService
      .acceptRide(ride.id, this.authStore.user()!.id)
      .pipe(finalize(() => (this.isLoadingAccept = false)))
      .subscribe({
        next: (res: Ride) => {
          this.handleSubmittedRideRes(res);
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Prihvatanje vožnje nije uselo. Pokušajte ponovo!');
          this.ride.set(null);
          this.clearRoute();
        },
      });
  }

  handleSubmittedRideRes(res: Ride) {
    this.ride.set(res);
    localStorage.setItem('driver_ride_id', res.id.toString());
    this.previewRoute(res);
  }

  openEditAddress(data: { position: string; oldAddress: string; lat: number; lng: number }) {
    this.openAddCustomAddressDialog(data.oldAddress, data.lat, data.lng);
  }

  openAddCustomAddressDialog(oldAddress: string, lat: number, lng: number) {
    const modalRef = this.modalService.open(AddCustomAddressComponent, {
      backdrop: 'static',
      backdropClass: 'z-index-2 modal-backdrop',
      windowClass: 'z-index-2 d-flex justify-content-center align-items-center',
      size: 'lg',
      modalDialogClass: 'w-100',
    });
    modalRef.componentInstance.oldAddress = oldAddress;
    modalRef.componentInstance.oldCoords = { lat, lng };

    modalRef.result
      .then((response) => {
        if (response) {
          if (response.lat && response.lng) {
            this.updateEndLocation(response.address, response.lat, response.lng);
            return;
          }
          this.findLatLng(response.address);
        }
      })
      .catch(() => noop());
  }

  findLatLng(address: string): void {
    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(this.cityCenter().lat - 0.1, this.cityCenter().lng - 0.1),
      new google.maps.LatLng(this.cityCenter().lat + 0.1, this.cityCenter().lng + 0.1)
    );
    this.geocoder
      .geocode({ address, bounds })
      .then((result) => {
        this.updateEndLocation(
          result.results[0].formatted_address,
          result.results[0].geometry.location.lat(),
          result.results[0].geometry.location.lng()
        );
      })
      .catch((error) => {
        console.error(error);
        this.toastService.error('Nismo pronašli željeno mesto na Google Mapi');
      });
  }

  updateEndLocation(address: string, lat: number, lng: number) {
    this.isLoadingEndUpdate = true;
    this.rideService
      .updateEnd(this.ride()!.id, address, lat, lng)
      .pipe(finalize(() => (this.isLoadingEndUpdate = false)))
      .subscribe({
        next: (res: Ride) => {
          this.ride.set(res);
          this.timeoutsForDispatchingMyLocation().forEach((timeoutId) => clearTimeout(timeoutId));
          this.previewRoute(this.ride()!);
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nova završna adresa nije sačuvana. Pokušajte ponovo!');
        },
      });
  }

  startRide() {
    if (!this.ride()?.end_location) {
      this.toastService.error('Dodajte završnu lokaciju!');
      return;
    }

    this.dispatchStartRide();
  }

  dispatchStartRide() {
    this.isLoadingStart = true;
    this.rideService
      .startRide(this.ride()!.id)
      .pipe(finalize(() => (this.isLoadingStart = false)))
      .subscribe({
        next: (res: Ride) => {
          this.ride.set(res);
          this.toastService.success('Vožnja je započeta!');
          this.imitateMoving();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo!');
        },
      });
  }

  endRide() {
    this.isLoadingEnd = true;
    this.rideService
      .endRide(this.ride()!.id)
      .pipe(finalize(() => (this.isLoadingEnd = false)))
      .subscribe({
        next: () => {
          this.ride.set(null);
          localStorage.removeItem('driver_ride_id');
          this.clearRoute();
          this.timeoutsForDispatchingMyLocation().forEach((timeoutId) => clearTimeout(timeoutId));
          this.toastService.show('Vožnja je završena!');
          // Check if somehow user has more than 1 ride
          this.checkForActiveRide();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
        },
      });
  }

  imitateMoving() {
    if (!this.ride()) {
      return;
    }
    const toCustomer = !this.ride()!.start_time;

    const mergedPoints: google.maps.LatLng[] = this.mergePoints(toCustomer);

    const displayablePoints = this.pickPoints(mergedPoints);
    for (let i = 0; i <= displayablePoints.length; i++) {
      if (i === displayablePoints.length) {
        const point = toCustomer
          ? { lat: this.ride()!.start_lat, lng: this.ride()!.start_lng }
          : { lat: this.ride()!.end_lat!, lng: this.ride()!.end_lng! };
        this.dispatchTimeoutChange(point!.lat, point!.lng, i);
        return;
      }

      this.dispatchTimeoutChange(displayablePoints[i].lat(), displayablePoints[i].lng(), i);
    }
  }

  dispatchTimeoutChange(lat: number, lng: number, index: number) {
    const timeoutID = setTimeout(() => {
      this.myLocation.set({
        lat: lat,
        lng: lng,
      });
    }, index * 3000);
    this.timeoutsForDispatchingMyLocation.set([...this.timeoutsForDispatchingMyLocation(), timeoutID]);
  }

  mergePoints(toCustomer: boolean) {
    const leg = this.directionsResult?.routes?.[0]?.legs?.[toCustomer ? 0 : 1];
    const legSteps = leg?.steps ?? [];

    let mergedPoints: google.maps.LatLng[] = [];
    for (let i = 0; i < legSteps.length; i++) {
      mergedPoints = [...mergedPoints, ...(legSteps[i]?.path ?? [])];
    }
    return mergedPoints;
  }

  pickPoints(points: google.maps.LatLng[], maxPoints: number = 15): google.maps.LatLng[] {
    const pointsLength = points.length;
    if (pointsLength <= maxPoints) {
      return points;
    }

    const interval = Math.floor(pointsLength / maxPoints);
    const startPointIndex = Math.floor(Math.random() * interval);
    const selectedPoints = [];
    for (let i = startPointIndex; i < pointsLength; i += interval) {
      selectedPoints.push(points[i]);
    }
    return selectedPoints.slice(0, maxPoints);
  }

  signalCustomerMyLocation(myLoc: { lat: number; lng: number }, driverId: number, rideId: number) {
    this.rideService.sendMyLocation(myLoc, driverId, rideId).subscribe({
      next: () => {
        console.info('User is notified about my location');
      },
      error: (error) => {
        console.error('User is not notified about my location: ', error);
      },
    });
  }

  ngOnDestroy() {
    const driverId = this.authStore.user()?.id;
    if (driverId) {
      this.echoService.leave(`drivers.${driverId}`);
    }
    this.echoService.leave(`drivers`);
  }
}
