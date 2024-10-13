import { NgSwitch } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './_layout/footer/footer.component';
import { HeaderComponent } from './_layout/header/header.component';
import { NavComponent } from './_layout/nav/nav.component';
import { ToastComponent } from './_shared/components/toast/toast.component';
import { ToastService } from './_shared/services/toast.service';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, NgSwitch, HeaderComponent, NavComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private toastService = inject(ToastService);

  title = 'taxi-web';
  googleMapsFullyLoaded = false;

  constructor() {
    this.loadGoogleMaps();
  }

  loadGoogleMaps(): Promise<void> {
    if (this.googleMapsFullyLoaded) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_API_KEY}&loading=async&libraries=places&v=weekly`;
      document.body.appendChild(script);
      script.onload = () => {
        const checkGoogleMaps = setInterval(() => {
          if (
            typeof google !== 'undefined' &&
            google.maps &&
            google.maps.places &&
            google.maps.Geocoder &&
            google.maps.DirectionsService &&
            google.maps.LatLng
          ) {
            clearInterval(checkGoogleMaps);
            this.googleMapsFullyLoaded = true;
          } else {
            console.error('Waiting for Google Maps to load...');
          }
        }, 50);
        resolve();
      };
      script.onerror = (error) => {
        this.toastService.error('Google Maps ne funkcioniše. Probajte ponovo kasnije!');
        reject(error);
      };
    });
  }
}
