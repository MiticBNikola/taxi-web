import { NgClass } from '@angular/common';
import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { GoogleMapsModule, MapDirectionsRenderer } from '@angular/google-maps';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faSpinner, faTaxi } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';

import { Ride } from '../../_shared/models/Ride';
import { EchoService } from '../../_shared/services/echo.service';
import { ToastService } from '../../_shared/services/toast.service';
import { AuthStore } from '../../_shared/store/auth/auth.store';
import { RideService } from '../../_shared/store/ride.service';
import { AddressComponent } from '../address/address.component';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [NgClass, GoogleMapsModule, AddressComponent, MapDirectionsRenderer, FaIconComponent],
  providers: [EchoService],
  templateUrl: './driver-dashboard.component.html',
  styleUrl: './driver-dashboard.component.scss',
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
  protected readonly faTaxi = faTaxi;
  protected readonly faSpinner = faSpinner;

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
  icons = input<HTMLElement[]>([]);
  protected myLocation = signal<{ lat: number; lng: number } | null>(null);

  private geocoder = new google.maps.Geocoder();
  private directionsService: google.maps.DirectionsService = new google.maps.DirectionsService();
  protected directionsResult: google.maps.DirectionsResult | null = null;
  protected directionsDisplayed = signal<number>(-1);

  protected isLoadingAccept = false;
  protected isLoadingEndUpdate = false;
  protected isLoadingStart = false;
  protected isLoadingEnd = false;
  protected rideData = signal<{
    ride: Ride;
    startLoc?: { lat: number; lng: number };
    endLoc?: { lat: number; lng: number };
  } | null>(null);
  protected ridesData = signal<
    {
      ride: Ride;
      startLoc?: { lat: number; lng: number };
      endLoc?: { lat: number; lng: number };
    }[]
  >([]);

  ngOnInit() {
    this.locateMe();
    this.listenToRideRequests();
    this.listenToRideAccepted();
    this.listenToRideCanceled();
    this.listenToRideEndChanged();
  }

  locateMe() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.myLocation.set({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      this.options = {
        ...this.options,
        center: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      };
    });
  }

  private listenToRideRequests() {
    this.echoService.listen('drivers', '\\ride-requested', (res: { ride: Ride }) => {
      const ridesLength = this.ridesData().length;
      this.ridesData.set([...this.ridesData(), { ride: res.ride }]);
      this.locateAddress(ridesLength, res.ride.start_location, true);
      if (res.ride.end_location) {
        this.locateAddress(ridesLength, res.ride.end_location);
      }
      this.toastService.show('Dostupna je nova vožnja!');
    });
  }

  private listenToRideAccepted() {
    this.echoService.listen('drivers', '\\ride-accepted', (res: { ride: Ride }) => {
      this.ridesData.set(
        this.ridesData().filter((rideData, index) => {
          if (rideData.ride.id === res.ride.id && this.directionsDisplayed() === index) {
            this.clearRoute();
          }
          return rideData.ride.id !== res.ride.id;
        })
      );
    });
  }

  private listenToRideEndChanged() {
    this.echoService.listen('drivers', '\\end-changed', (res: { ride: Ride }) => {
      let wantedIndex = -1;
      this.ridesData.set(
        this.ridesData().map((singleRideData, index) => {
          if (singleRideData.ride.id === res.ride.id) {
            wantedIndex = index;
            return {
              ...singleRideData,
              ride: res.ride,
              endLoc: undefined,
            };
          }
          return singleRideData;
        })
      );
      if (res.ride.end_location && wantedIndex !== -1) {
        this.locateAddress(wantedIndex, res.ride.end_location);
      }
    });
    this.echoService.listen(`drivers.${this.authStore.user()!.id}`, '\\end-changed', (res: { ride: Ride }) => {
      this.rideData.set({
        ...this.rideData(),
        ride: res.ride,
      });
      this.locateAddress(-1, res.ride.end_location!);
    });
  }

  private listenToRideCanceled() {
    this.echoService.listen('drivers', '\\ride-canceled', (res: { ride: Ride }) => {
      this.ridesData.set(
        this.ridesData().filter((rideData, index) => {
          if (rideData.ride.id === res.ride.id && this.directionsDisplayed() === index) {
            this.clearRoute();
          }
          return rideData.ride.id !== res.ride.id;
        })
      );
    });
    this.echoService.listen(`drivers.${this.authStore.user()!.id}`, '\\ride-canceled', (res: { ride: Ride }) => {
      if (this.rideData()?.ride.id === res.ride.id) {
        this.toastService.show('Vožnja je otkazana!');
        this.rideData.set(null);
        this.clearRoute();
      }
    });
  }

  private locateAddress(position: number, address: string, isStart: boolean = false): void {
    const defaultBounds = {
      north: this.cityCenter().lat + 0.1,
      south: this.cityCenter().lat - 0.1,
      east: this.cityCenter().lng + 0.1,
      west: this.cityCenter().lng - 0.1,
    };
    this.geocoder
      .geocode({ address, bounds: defaultBounds })
      .then((result) => {
        const latLng = new google.maps.LatLng({
          lat: result.results[0].geometry.location.lat(),
          lng: result.results[0].geometry.location.lng(),
        });
        if (position === -1) {
          this.rideData.set({
            ...this.rideData()!,
            endLoc: { lat: latLng.lat(), lng: latLng.lng() },
          });
          return;
        }
        if (isStart) {
          this.ridesData.set(
            this.ridesData().map((singleRideData, index) => {
              if (index === position) {
                return {
                  ...singleRideData,
                  startLoc: { lat: latLng.lat(), lng: latLng.lng() },
                };
              }
              return singleRideData;
            })
          );
          return;
        }
        this.ridesData.set(
          this.ridesData().map((singleRideData, index) => {
            if (index === position) {
              return {
                ...singleRideData,
                endLoc: { lat: latLng.lat(), lng: latLng.lng() },
              };
            }
            return singleRideData;
          })
        );
      })
      .catch((error) => {
        console.error(error);
        this.toastService.error('Nismo pronašli željeno mesto na Google Mapi');
      });
  }

  previewSelectedRoute(
    ride: {
      ride: Ride;
      startLoc?: { lat: number; lng: number };
      endLoc?: { lat: number; lng: number };
    },
    index: number
  ): void {
    this.previewRoute(ride);
    this.directionsDisplayed.set(index);
  }

  previewRoute(ride: {
    ride: Ride;
    startLoc?: { lat: number; lng: number };
    endLoc?: { lat: number; lng: number };
  }): void {
    const start = this.myLocation()!;
    let stops: google.maps.DirectionsWaypoint[] = [
      {
        location: ride.startLoc!,
        stopover: true,
      },
    ];
    let end = ride.endLoc!;
    if (!end) {
      this.toastService.show('Završna adresa nije uneta!');
      end = ride.startLoc!;
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
        const durationToCustomer = Math.floor((result?.routes?.[0]?.legs?.[0]?.duration?.value || 0) / 60);
        const durationToFinish = Math.floor((result?.routes?.[0]?.legs?.[1]?.duration?.value || 0) / 60);
        this.toastService.show(
          `Potrebno je ${durationToCustomer} min vožnje do korisnika${stops.length ? `, a onda još ${durationToFinish} min do kraja vožnje.` : '.'}`
        );
      })
      .catch((error) => {
        this.directionsResult = null;
        this.directionsDisplayed.set(-1);
        this.toastService.error('Kreiranje putanje nije bilo moguće. Pokušajte ponovo kasnije!');
        console.error(error);
      });
  }

  clearRoute() {
    this.directionsResult = null;
    this.directionsDisplayed.set(-1);
    this.locateMe();
  }

  acceptRide(index: number) {
    this.isLoadingAccept = true;
    const acceptedRide = this.ridesData()[index];
    this.rideService
      .acceptRide(this.ridesData()[index].ride.id, this.authStore.user()!.id)
      .pipe(finalize(() => (this.isLoadingAccept = false)))
      .subscribe({
        next: (res: Ride) => {
          this.rideData.set({
            ...acceptedRide,
            ride: res,
          });
          this.previewRoute(this.rideData()!);
          this.imitateMoving(true);
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Prihvatanje vožnje nije uselo. Pokušajte ponovo!');
          this.rideData.set(null);
          this.clearRoute();
        },
      });
  }

  updatePoint(location: { lat: number; lng: number }): void {
    let address = 'Nepoznata adresa.';
    this.geocoder
      .geocode({ location })
      .then((result) => {
        address = result.results[0].formatted_address;
      })
      .catch((error) => {
        console.error(error);
        this.toastService.error('Naziv adrese nije pronađen.');
      })
      .finally(() => {
        this.updateEndLocation(this.rideData()!.ride, address, location);
      });
  }

  updateEndLocation(ride: Ride, address: string, location: { lat: number; lng: number }) {
    this.isLoadingEndUpdate = true;
    this.rideService
      .updateEnd(ride.id, address)
      .pipe(finalize(() => (this.isLoadingEndUpdate = false)))
      .subscribe({
        next: (res: Ride) => {
          this.rideData.set({
            ...this.rideData()!,
            ride: res,
            endLoc: location,
          });
          this.previewRoute(this.rideData()!);
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nova završna adresa nije sačuvana. Pokušajte ponovo!');
        },
      });
  }

  startRide() {
    if (!this.rideData()?.endLoc) {
      this.toastService.error('Dodajte završnu lokaciju!');
      return;
    }

    this.dispatchStartRide();
  }

  dispatchStartRide() {
    this.isLoadingStart = true;
    this.rideService
      .startRide(this.rideData()!.ride.id)
      .pipe(finalize(() => (this.isLoadingStart = false)))
      .subscribe({
        next: (res: Ride) => {
          this.rideData.set({
            ...this.rideData(),
            ride: res,
          });
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
      .endRide(this.rideData()!.ride.id)
      .pipe(finalize(() => (this.isLoadingEnd = false)))
      .subscribe({
        next: () => {
          this.rideData.set(null);
          this.clearRoute();
          this.toastService.show('Vožnja je završena!');
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Nešto je iskrslo. Pokušajte ponovo kasnije!');
        },
      });
  }

  imitateMoving(toCustomer = false) {
    const leg = this.directionsResult?.routes?.[0]?.legs?.[toCustomer ? 0 : 1];
    if (!leg?.steps) {
      return;
    }
    for (let i = 0; i <= leg.steps.length; i++) {
      if (!leg.steps?.[i]?.path) {
        if (i === leg.steps.length) {
          setTimeout(
            () => {
              const point = toCustomer ? this.rideData()!.startLoc : this.rideData()!.endLoc;
              this.myLocation.set({
                lat: point!.lat,
                lng: point!.lng,
              });
            },
            (i + 1) * 500
          );
        }
        return;
      }
      for (let j = 0; j < leg.steps[i].path.length; j++) {
        setTimeout(
          () => {
            this.myLocation.set({
              lat: leg.steps[i].path[j].lat(),
              lng: leg.steps[i].path[j].lng(),
            });
          },
          (i + 1) * 500
        );
      }
    }
  }

  ngOnDestroy() {
    this.echoService.disconnect();
  }
}
