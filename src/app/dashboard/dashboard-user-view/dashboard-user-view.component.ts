import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-dashboard-user-view',
  templateUrl: './dashboard-user-view.component.html',
  styleUrls: ['./dashboard-user-view.component.css']
})
export class DashboardUserViewComponent implements OnInit {

  public form: FormGroup;
  public myMarker: google.maps.Marker;
  // public finishMarker: google.maps.Marker;
  public geocoder: google.maps.Geocoder = new google.maps.Geocoder();
  public center: google.maps.LatLngLiteral = {
    lat: 43.320994,
    lng: 21.895730,
  };
  public map: google.maps.Map;

  constructor(public toastrService: ToastrService,
              public fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.locateMe();
    this.initMap();
    this.form = this.fb.group({
      address: [null, [Validators.required]]
    });
  }

  initMap(): void {
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        mapTypeId: 'roadmap',
        zoomControl: true,
        scrollwheel: true,
        gestureHandling: 'cooperative',
        zoom: 15,
        maxZoom: 30,
        minZoom: 12,
        backgroundColor: 'bg-secondary',
        center: this.center,
        clickableIcons: false
      }
    );
    // this.map.addListener('click', (event) => {
    //   this.addMarker(event.latLng);
    // });
  }

  locateMe(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      this.map.setCenter(this.center);
      this.map.setZoom(15);
      this.myMarker = new google.maps.Marker({
        position: this.center,
        map: this.map,
        icon: 'https://img.icons8.com/ios-filled/50/000000/top-view-man.png'
      });
    });
  }

  // addMarker(position: google.maps.LatLng): void {
  //   if (this.finishMarker) {
  //     this.finishMarker.setMap(null);
  //   }
  //   this.finishMarker = new google.maps.Marker({
  //     position: {
  //       lat: position.lat(),
  //       lng: position.lng()
  //     },
  //     map: this.map
  //   });
  // }

  // removeDestination(): void {
  //   this.finishMarker.setMap(null);
  // }

  // submitForm(): void {
  //   if (this.form.invalid) {
  //     this.toastrService.error('Unesite ispravnu adresu!');
  //     return;
  //   }
  //   this.geocoder.geocode({address: this.form.value.address}, (results, status) => {
  //     if (status === 'OK') {
  //       this.map.setCenter(results[0].geometry.location);
  //       this.map.setZoom(17);
  //       this.addMarker(results[0].geometry.location);
  //     } else {
  //       console.log('Geocode was not successful for the following reason: ' + status);
  //       this.toastrService.error(status);
  //     }
  //   });
  // }

}

