import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isObject} from 'rxjs/internal-compatibility';

@Component({
  selector: 'app-add-custom-address',
  templateUrl: './add-custom-address.component.html',
  styleUrls: ['./add-custom-address.component.css']
})
export class AddCustomAddressComponent implements OnInit, AfterViewInit {

  @Input() oldAddress: string;
  @Input() center;
  @Input() map: google.maps.Map;
  address: FormControl;

  constructor(private modalRef: NgbActiveModal) {
  }

  ngOnInit(): void {

    this.buildAddressForm();
  }

  ngAfterViewInit(): void {
    this.initializeSearchBar();
  }

  initializeSearchBar(): void {

    // Create a bounding box with sides ~10km away from the center point
    const defaultBounds = {
      north: this.center.lat + 0.1,
      south: this.center.lat - 0.1,
      east: this.center.lng + 0.1,
      west: this.center.lng - 0.1,
    };

    const options = {
      componentRestrictions: {country: 'rs'},
      bounds: defaultBounds,
      strictBounds: true,
      fields: ['address_components', 'geometry', 'name'],
      types: ['address'],
    };

    const addressInput = document.getElementById('address') as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(addressInput, options);
    autocomplete.addListener('place_changed', () => {
      console.log(autocomplete.getPlace(), autocomplete.getPlace().geometry.location.lat(), autocomplete.getPlace().geometry.location.lng());
      this.address.setValue(autocomplete.getPlace().name);
    });
  }

  buildAddressForm(): void {

    this.address = new FormControl(this.oldAddress ? this.oldAddress : '', [Validators.required]);
  }

  hideAddCustomAddressModal(): void {

    this.modalRef.close();
  }

  findLocation(): void {

    if (!this.address.valid) {
      return;
    }
    this.modalRef.close(this.address.value);
  }

}
