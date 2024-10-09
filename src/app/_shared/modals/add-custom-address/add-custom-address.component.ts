import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  input,
  InputSignal,
  OnInit,
  viewChild,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faClose, faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
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
  protected readonly faClose = faClose;

  private toastService = inject(ToastService);
  private modalRef = inject(NgbActiveModal);

  @Input() oldAddress: string = '';
  @Input() isEdit: boolean = false;
  @Input() center: { lat: number; lng: number } = {
    lat: 43.320994,
    lng: 21.89573,
  };

  private addressInput = viewChild.required<ElementRef>('addresstext');

  protected address: FormControl | null = null;
  protected submitted = false;

  ngOnInit() {
    this.address = new FormControl(this.oldAddress, [Validators.required]);
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

    const autocomplete = new google.maps.places.Autocomplete(this.addressInput().nativeElement, options);
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
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
    this.modalRef.close(this.address?.value);
  }
}
