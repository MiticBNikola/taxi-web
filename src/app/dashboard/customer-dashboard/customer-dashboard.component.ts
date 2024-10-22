import { NgClass } from '@angular/common';
import { Component, effect, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { GoogleMapsModule, MapDirectionsRenderer } from '@angular/google-maps';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFlag, faSignsPost, faSpinner, faTaxi, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize, noop } from 'rxjs';

import { AddCustomAddressComponent } from '../../_shared/modals/add-custom-address/add-custom-address.component';
import { ConfirmationComponent } from '../../_shared/modals/confirmation/confirmation.component';
import { Ride } from '../../_shared/models/Ride';
import { EchoService } from '../../_shared/services/echo.service';
import { ToastService } from '../../_shared/services/toast.service';
import { AuthStore } from '../../_shared/store/auth/auth.store';
import { RideService } from '../../_shared/store/ride.service';
import { AddressComponent } from '../address/address.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [NgClass, GoogleMapsModule, AddressComponent, MapDirectionsRenderer, FaIconComponent],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.scss',
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  protected readonly faTaxi = faTaxi;
  protected readonly faFlag = faFlag;
  protected readonly faSignsPost = faSignsPost;
  protected readonly faTimes = faTimes;
  protected readonly faSpinner = faSpinner;

  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);
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
  protected addresses: string[] = [];
  icons = input<HTMLElement[]>([]);
  protected myLocation: { lat: number; lng: number } | null = null;
  protected driverLocation = signal<{ lat: number; lng: number } | null>(null);
  protected startLocation = signal<{ lat: number; lng: number } | null>(null);
  protected middleLocations: { lat: number; lng: number }[] = [];
  protected endLocation = signal<{ lat: number; lng: number } | null>(null);
  protected pickingFirstInProgress = false;
  protected pickingLastInProgress = false;

  private geocoder = new google.maps.Geocoder();
  private directionsService: google.maps.DirectionsService = new google.maps.DirectionsService();
  protected directionsResult: google.maps.DirectionsResult | null = null;

  protected isLoadingCheck = false;
  protected isLoading = false;
  protected isLoadingCancel = false;
  protected enableStops: boolean = false;
  protected ride = signal<Ride | null>(null);

  constructor() {
    effect(() => {
      if (this.startLocation() && this.endLocation()) {
        this.createRoute();
      }
    });
  }

  ngOnInit() {
    this.checkForActiveRide();
  }

  listenToRideAccepted(rideId: number) {
    this.echoService.listen(`rides.${rideId}`, '\\ride-accepted', (res: { ride: Ride }) => {
      this.toastService.success('Vozač je krenuo ka Vama!');
      this.ride.set(res.ride);
    });
  }

  listenToDriverPosition(rideId: number) {
    this.echoService.listen(
      `rides.${rideId}`,
      '\\driver-position',
      (res: { driver_location: { lat: number; lng: number }; driver_id: number }) => {
        this.driverLocation.set(res.driver_location);
      }
    );
  }

  listenToRideEndChanged(rideId: number) {
    this.echoService.listen(`rides.${rideId}`, '\\end-changed', (res: { ride: Ride }) => {
      this.toastService.show('Vozač je promenio krajnju adresu!');
      this.ride.set(res.ride);
      this.updatePosition(res.ride.end_lat!, res.ride.end_lng!, res.ride.end_location!, 'last');
    });
  }

  listenToRideStarted(rideId: number) {
    this.echoService.listen(`rides.${rideId}`, '\\ride-started', (res: { ride: Ride }) => {
      this.toastService.show('Vožnja je započeta!');
      this.ride.set(res.ride);
    });
  }

  listenToRideEnded(rideId: number) {
    this.echoService.listen(`rides.${rideId}`, '\\ride-ended', () => {
      this.toastService.show('Vožnja je gotova!');
      this.ride.set(null);
      localStorage.removeItem('customer_ride_id');
      this.driverLocation.set(null);
      this.clearRoute();
      // Check if somehow user has more than 1 ride
      this.checkForActiveRide();
    });
  }

  locateMe() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.findAddress(position.coords.latitude, position.coords.longitude, 'first', true);
    });
  }

  checkForActiveRide() {
    this.isLoadingCheck = true;
    this.rideService
      .rideStatus(localStorage.getItem('customer_ride_id'), this.authStore.user()?.id)
      .pipe(finalize(() => (this.isLoadingCheck = false)))
      .subscribe({
        next: (res: Ride) => {
          if (!res?.id || res?.end_time) {
            this.locateMe();
            return;
          }
          this.handleSubmittedRideRes(res);
          this.updatePosition(res.start_lat, res.start_lng, res.start_location, 'first');
          this.updatePosition(res.end_lat!, res.end_lng!, res.end_location!, 'last');
          if (!res.driver_id) {
            this.toastService.success('Vožnja je na čekanju. Sačekajte potvrdu vozača!');
            return;
          }
          if (!res.start_time) {
            this.toastService.success('Vozač je krenuo ka Vama!');
            return;
          }
          this.toastService.success('Vožnja je u toku!');
        },
        error: (err) => {
          console.error(err);
          this.locateMe();
        },
      });
  }

  /**
   * Finding address based on LatLng
   * Generally used for finding current location
   *
   * @param lat
   * @param lng
   * @param position
   * @param myLocation
   */
  findAddress(lat: number, lng: number, position: string, myLocation: boolean = false): void {
    let address = '';
    this.geocoder
      .geocode({ location: { lat, lng } })
      .then((result) => {
        address = result.results[0].formatted_address;
        lat = result.results[0].geometry.location.lat();
        lng = result.results[0].geometry.location.lng();
      })
      .catch((error) => {
        console.error(error);
        address = 'Nepoznata adresa.';
      })
      .finally(() => {
        this.updatePosition(lat, lng, address, position, myLocation);
      });
  }

  openAddCustomAddressDialog(position: string, oldData?: { oldAddress: string; lat: number; lng: number }) {
    const modalRef = this.modalService.open(AddCustomAddressComponent, {
      backdrop: 'static',
      backdropClass: 'z-index-2 modal-backdrop',
      windowClass: 'z-index-2 d-flex justify-content-center align-items-center',
      size: 'lg',
      modalDialogClass: 'w-100',
    });
    if (oldData) {
      modalRef.componentInstance.oldAddress = oldData.oldAddress;
      modalRef.componentInstance.oldCoords = { lat: oldData.lat, lng: oldData.lng };
    }
    modalRef.componentInstance.center = this.cityCenter();
    modalRef.result
      .then((response) => {
        if (response) {
          if (response.lat && response.lng) {
            this.updatePosition(response.lat, response.lng, response.address, position);
            return;
          }
          this.findLatLng(position, response.address);
        }
      })
      .catch(() => noop());
  }

  /**
   * Finding LatLng based on address
   * Generally used in case of end set or driver end change
   *
   * @param position
   * @param address
   */
  findLatLng(position: string, address: string): void {
    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(this.cityCenter().lat - 0.1, this.cityCenter().lng - 0.1),
      new google.maps.LatLng(this.cityCenter().lat + 0.1, this.cityCenter().lng + 0.1)
    );
    this.geocoder
      .geocode({ address, bounds })
      .then((result) => {
        this.updatePosition(
          result.results[0].geometry.location.lat(),
          result.results[0].geometry.location.lng(),
          result.results[0].formatted_address,
          position
        );
      })
      .catch((error) => {
        console.error(error);
        this.toastService.error('Nismo pronašli željeno mesto na Google Mapi');
      });
  }

  updatePosition(lat: number, lng: number, address: string, position: string, myLocation: boolean = false): void {
    this.setMarkers(lat, lng, position, myLocation);
    this.setAddress(address, position);
  }

  setMarkers(latitude: number, longitude: number, position: string, myLocation: boolean = false): void {
    if (myLocation) {
      this.myLocation = {
        lat: latitude,
        lng: longitude,
      };
    }
    if (position === 'first' && !this.directionsResult) {
      this.options = {
        ...this.options,
        center: {
          lat: latitude,
          lng: longitude,
        },
      };
    }
    switch (position) {
      case 'first':
        this.startLocation.set({
          lat: latitude,
          lng: longitude,
        });
        break;
      case 'middle':
        this.middleLocations.push({
          lat: latitude,
          lng: longitude,
        });
        break;
      case 'last':
        this.endLocation.set({
          lat: latitude,
          lng: longitude,
        });
        break;
    }
  }

  setAddress(address: string, position: string): void {
    switch (position) {
      case 'first':
        this.addresses[0] = address;
        break;
      case 'middle':
        this.addresses.splice(this.addresses.length - 1, 0, address);
        break;
      case 'last':
        if (this.addresses.length === 1) {
          this.addresses.push(address);
        } else {
          this.addresses.splice(this.addresses.length - 1, 1, address);
        }
        break;
    }
  }

  createRoute(): void {
    if (!this.startLocation() || !this.endLocation()) {
      this.toastService.error('Morate uneti početnu i završnu lokaciju!');
      return;
    }

    const start = new google.maps.LatLng(this.startLocation()!.lat, this.startLocation()!.lng);
    const end = new google.maps.LatLng(this.endLocation()!.lat, this.endLocation()!.lng);
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
    this.startLocation.set(null);
    this.middleLocations = [];
    this.endLocation.set(null);
    this.addresses = [];
    this.directionsResult = null;
    this.locateMe();
  }

  openEditAddress(data: { position: string; oldAddress: string; lat: number; lng: number }) {
    this.openAddCustomAddressDialog(data.position, { oldAddress: data.oldAddress, lat: data.lat, lng: data.lng });
  }

  enablePickingLocation(isFirst: boolean, isLast: boolean) {
    if (isFirst) {
      this.pickingFirstInProgress = !this.pickingFirstInProgress;
      this.pickingLastInProgress = false;
      if (this.pickingFirstInProgress) {
        this.toastService.show('Izaberite početnu lokaciju na mapi!');
      }
      return;
    }
    if (isLast) {
      this.pickingFirstInProgress = false;
      this.pickingLastInProgress = !this.pickingLastInProgress;
      if (this.pickingLastInProgress) {
        this.toastService.show('Izaberite završnu lokaciju na mapi!');
      }
    }
  }

  handlePickingLocation(event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) {
    if (!event.latLng?.lat() || !event.latLng?.lng()) {
      return;
    }
    if (this.pickingFirstInProgress || this.pickingLastInProgress) {
      this.findAddress(event.latLng!.lat(), event.latLng!.lng(), this.pickingFirstInProgress ? 'first' : 'last');
      this.pickingFirstInProgress = false;
      this.pickingLastInProgress = false;
    }
  }

  removePoint(index: number, isLast: boolean): void {
    if (isLast) {
      if (this.middleLocations.length) {
        this.endLocation.set(this.middleLocations[this.middleLocations.length - 1]);
        this.middleLocations.splice(this.middleLocations.length - 1, 1);
      } else {
        this.endLocation.set(null);
      }
    } else {
      // addresses includes start location, so it needs to be minus one
      this.middleLocations.splice(index - 1, 1);
    }

    this.addresses.splice(index, 1);

    if (!this.endLocation()) {
      this.clearRoute();
    }
  }

  orderVehicle() {
    if (!this.endLocation()) {
      this.toastService.error('Dodajte završnu lokaciju!');
      return;
    }

    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(this.cityCenter().lat - 0.1, this.cityCenter().lng - 0.1),
      new google.maps.LatLng(this.cityCenter().lat + 0.1, this.cityCenter().lng + 0.1)
    );
    if (
      !bounds.contains(new google.maps.LatLng(this.startLocation()!.lat, this.startLocation()!.lng)) ||
      !bounds.contains(new google.maps.LatLng(this.endLocation()!.lat, this.endLocation()!.lng))
    ) {
      this.toastService.error('Zahtevana odredišta su van opsega moguće vožnje!');
      return;
    }

    const modalRef = this.modalService.open(ConfirmationComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop',
      windowClass: 'd-flex justify-content-center align-items-center',
      size: 'lg',
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
      .makeRequest(
        this.addresses[0],
        this.startLocation()!,
        this.addresses[this.addresses.length - 1],
        this.endLocation()!,
        this.authStore.user()?.id
      )
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: Ride) => {
          this.handleSubmittedRideRes(res);
          this.toastService.success('Vožnja je kreirana. Sačekajte potvrdu vozača!');
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
        },
      });
  }

  handleSubmittedRideRes(res: Ride) {
    this.ride.set(res);
    localStorage.setItem('customer_ride_id', res.id.toString());
    this.listenToRideAccepted(res.id);
    this.listenToDriverPosition(res.id);
    this.listenToRideEndChanged(res.id);
    this.listenToRideStarted(res.id);
    this.listenToRideEnded(res.id);
  }

  cancelRide() {
    if (!this.ride()) {
      this.toastService.error('Nemate aktivnu vožnju!');
      return;
    }
    const rideId = this.ride()!.id;

    const modalRef = this.modalService.open(ConfirmationComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop',
      windowClass: 'd-flex justify-content-center align-items-center',
      size: 'lg',
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
          this.ride.set(null);
          localStorage.removeItem('customer_ride_id');
          this.driverLocation.set(null);
          this.clearRoute();
          this.toastService.success('Vožnja je otkazana.');
          // Check if somehow user has more than 1 ride
          this.checkForActiveRide();
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

  ngOnDestroy() {
    this.echoService.disconnect();
  }
}
