import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AddCustomAddressComponent} from '../../_shared/components/add-custom-address/add-custom-address.component';
import {noop} from 'rxjs';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-dashboard-user-view',
  templateUrl: './dashboard-user-view.component.html',
  styleUrls: ['./dashboard-user-view.component.css'],
  animations: [
    trigger('slideDownUp', [
      transition(':enter', [style({height: 0}), animate(450)]),
      transition(':leave', [animate(450, style({height: 0}))]),
    ]),
  ]
})
export class DashboardUserViewComponent implements OnInit {

  public form: FormGroup;
  public map: google.maps.Map;
  public geocoder: google.maps.Geocoder = new google.maps.Geocoder();
  public directionsRenderer: google.maps.DirectionsRenderer;
  public directionsService: google.maps.DirectionsService;
  public markers: google.maps.Marker[] = [];
  public addresses: string[] = [];
  public center: google.maps.LatLngLiteral = {
    lat: 43.320994,
    lng: 21.895730,
  };

  constructor(public toastrService: ToastrService,
              public fb: FormBuilder,
              private modalService: NgbModal) {
  }

  ngOnInit(): void {

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
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.locateMe();
  }

  locateMe(): void {

    navigator.geolocation.getCurrentPosition((position) => {
      const myLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      this.map.setCenter(myLocation);
      this.markers.push(new google.maps.Marker({
        position: myLocation,
        map: this.map,
        icon: 'https://img.icons8.com/ios-filled/50/000000/top-view-man.png'
      }));
      this.updateAddress(myLocation.lat, myLocation.lng, 'first');
      if (this.markers.length > 1) {
        this.createRoute();
      }
    });
  }

  updateMarkers(latitude: number, longitude: number, position: string): void {

    switch (position) {
      case 'first':
        this.markers[0].setPosition({
          lat: latitude,
          lng: longitude
        });
        break;
      case 'middle':
        this.markers.splice(this.markers.length - 1, 0, new google.maps.Marker({
          position: {
            lat: latitude,
            lng: longitude
          },
          map: this.map
        }));
        break;
      case 'last':
        this.markers.push(new google.maps.Marker({
          position: {
            lat: latitude,
            lng: longitude
          },
          map: this.map
        }));
        break;
    }
  }

  updateLocation(location: google.maps.LatLng, index): void {

    this.markers[index].setPosition(location);
    this.geocoder.geocode({location}, (results, status) => {
      let address = '';
      if (status === google.maps.GeocoderStatus.OK) {
        address = results[0].formatted_address;
      } else {
        address = 'Nepoznata adresa.';
      }
      this.addresses[index] = address;
    });
    if (this.markers.length > 1) {
      this.createRoute();
    }
  }

  removeDestination(index): void {

    this.markers.splice(index, 1);
    this.addresses.splice(index, 1);
    if (this.markers.length > 1) {
      this.createRoute();
    } else {
      this.clearRoute();
    }
  }

  locateAddress(position, address): void {

    const defaultBounds = {
      north: this.center.lat + 0.1,
      south: this.center.lat - 0.1,
      east: this.center.lng + 0.1,
      west: this.center.lng - 0.1,
    };
    this.geocoder.geocode({address, bounds: defaultBounds}, (results, status) => {
        if (status === 'OK') {
          console.log(results);
          this.updateMarkers(results[0].geometry.location.lat(), results[0].geometry.location.lng(), position);
          this.updateAddress(results[0].geometry.location.lat(), results[0].geometry.location.lng(), position);
          if (this.markers.length > 1) {
            this.createRoute();
          }
        } else {
          console.log('Geocode was not successful for the following reason: ' + status);
          this.toastrService.error(status);
        }
      }
    );
  }

  openAddCustomAddressDialog(position): void {

    const modalRef = this.modalService.open(AddCustomAddressComponent, {
      backdropClass: 'z-index-2',
      windowClass: 'z-index-2'
    });
    modalRef.componentInstance.center = this.center;
    modalRef.componentInstance.map = this.map;
    modalRef.result
      .then(response => {
        if (response) {
          this.locateAddress(position, response);
        }
      })
      .catch(() => noop());
  }

  createRoute(): void {

    this.directionsRenderer.setMap(this.map);

    for (const marker of this.markers) {
      marker.setMap(null);
    }

    const start = new google.maps.LatLng(this.markers[0].getPosition().lat(), this.markers[0].getPosition().lng());
    const lastIndex = this.markers.length > 0 ? this.markers.length - 1 : 0;
    const end = new google.maps.LatLng(this.markers[lastIndex].getPosition().lat(), this.markers[lastIndex].getPosition().lng());
    const stops: google.maps.DirectionsWaypoint[] = [];
    for (let i = 1; i < this.markers.length - 1; i++) {
      stops.push({
        location: new google.maps.LatLng(this.markers[i].getPosition().lat(), this.markers[i].getPosition().lng()),
        stopover: true
      });
    }

    this.directionsService.route({
      origin: start,
      destination: end,
      waypoints: stops,
      travelMode: google.maps.TravelMode.DRIVING
    }, ((result, status) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(result);
      } else {
        console.log(result);
      }
    }));
  }

  clearRoute(): void {

    this.directionsRenderer.setMap(null);
    this.markers = [];
    this.addresses = [];
    this.locateMe();
  }

  updateAddress(lat, lng, position): void {

    const latLng = new google.maps.LatLng(lat, lng);
    this.geocoder.geocode({location: latLng}, (results, status) => {
      let address = '';
      if (status === google.maps.GeocoderStatus.OK) {
        address = results[0].formatted_address;
      } else {
        address = 'Nepoznata adresa.';
      }

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

  orderVehicle(): void {

  }

}

