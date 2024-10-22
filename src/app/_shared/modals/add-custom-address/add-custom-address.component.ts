import { NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, Input, OnInit, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faLocationDot, faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-custom-address',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, FaIconComponent],
  templateUrl: './add-custom-address.component.html',
  styleUrl: './add-custom-address.component.scss',
})
export class AddCustomAddressComponent implements OnInit, AfterViewInit {
  protected readonly faPlus = faPlus;
  protected readonly faSave = faSave;
  protected readonly faLocationDot = faLocationDot;

  private toastService = inject(ToastService);
  private modalRef = inject(NgbActiveModal);

  @Input() oldAddress: string = '';
  @Input() oldCoords: { lat: number; lng: number } | null = null;
  @Input() isEdit: boolean = false;
  @Input() center: { lat: number; lng: number } = {
    lat: 43.320994,
    lng: 21.89573,
  };

  private addressInput = viewChild.required<ElementRef>('addresstext');

  protected address: FormControl | null = null;
  protected addressData: { address?: string; lat?: number; lng?: number } = {};
  protected submitted = false;

  ngOnInit() {
    this.address = new FormControl(this.oldAddress, [Validators.required]);
    this.addressData.address = this.oldAddress;
    if (this.oldCoords) {
      this.addressData.lat = this.oldCoords.lat;
      this.addressData.lng = this.oldCoords.lng;
    }
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
      componentRestrictions: { country: 'rs' },
      bounds: defaultBounds,
      strictBounds: true,
      fields: ['geometry', 'formatted_address'],
      types: ['address'],
    };

    this.addressInput().nativeElement.focus();
    const autocomplete = new google.maps.places.Autocomplete(this.addressInput().nativeElement, options);
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      this.addressData = {
        address: autocomplete.getPlace().formatted_address,
        lat: autocomplete.getPlace().geometry?.location?.lat(),
        lng: autocomplete.getPlace().geometry?.location?.lng(),
      };
      this.address?.setValue(autocomplete.getPlace().formatted_address);
    });
  }

  hideAddCustomAddressModal(): void {
    this.modalRef.dismiss();
  }

  findLocation(): void {
    this.submitted = true;
    if (!this.address?.valid) {
      this.toastService.error('Pravilno popunite sva obavezna polja!');
      return;
    }
    if (this.address?.value === this.oldAddress) {
      this.hideAddCustomAddressModal();
      return;
    }
    const submitData = this.prepareSubmitData();
    this.modalRef.close(submitData);
  }

  prepareSubmitData() {
    let submitData = { address: this.address?.value };
    if (this.address?.value === this.addressData.address) {
      submitData = {
        ...submitData,
        ...(this.addressData.lat && { lat: this.addressData.lat }),
        ...(this.addressData.lng && { lng: this.addressData.lng }),
      };
    }
    return submitData;
  }
}
