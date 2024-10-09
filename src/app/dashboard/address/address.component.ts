import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEdit, faFlag, faLocationDot, faPlay, faSignsPost, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { noop } from 'rxjs';

import { AddCustomAddressComponent } from '../../_shared/modals/add-custom-address/add-custom-address.component';
import { ConfirmationComponent } from '../../_shared/modals/confirmation/confirmation.component';
import { ToastService } from '../../_shared/services/toast.service';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [FaIconComponent],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
})
export class AddressComponent {
  protected readonly faLocationDot = faLocationDot;
  protected readonly faTrash = faTrash;
  protected readonly faEdit = faEdit;
  protected readonly faSignsPost = faSignsPost;
  protected readonly faPlay = faPlay;
  protected readonly faFlag = faFlag;

  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);

  isFirst = input.required<boolean>();
  isLast = input.required<boolean>();
  address = input.required<string>();
  center = input.required<{ lat: number; lng: number }>();

  @Output() signalLocation: EventEmitter<{ lat: number; lng: number }> = new EventEmitter();
  @Output() signalRemoveAddress: EventEmitter<void> = new EventEmitter();

  private geocoder: google.maps.Geocoder = new google.maps.Geocoder();

  locateMe(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      this.signalLocation.emit({ lat: position.coords.latitude, lng: position.coords.longitude });
    });
  }

  changeAddress(): void {
    const modalRef = this.modalService.open(AddCustomAddressComponent, {
      backdrop: 'static',
      backdropClass: 'z-index-2 modal-backdrop',
      windowClass: 'z-index-2',
      size: 'md',
    });
    modalRef.componentInstance.oldAddress = this.address();
    modalRef.componentInstance.isEdit = true;
    modalRef.result
      .then((response) => {
        if (response) {
          this.locateAddress(response);
        }
      })
      .catch(() => noop());
  }

  locateAddress(address: string): void {
    const defaultBounds = {
      north: this.center().lat + 0.1,
      south: this.center().lat - 0.1,
      east: this.center().lng + 0.1,
      west: this.center().lng - 0.1,
    };
    this.geocoder
      .geocode({ address, bounds: defaultBounds })
      .then((results) => {
        this.signalLocation.emit({
          lat: results.results[0].geometry.location.lat(),
          lng: results.results[0].geometry.location.lng(),
        });
      })
      .catch((error) => {
        console.error(error);
        this.toastService.error('Nismo pronašli željeno mesto na Google Mapi');
      });
  }

  removeAddress(): void {
    const modalRef = this.modalService.open(ConfirmationComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Upozorenje';
    modalRef.componentInstance.sentence = 'Da li ste sigurni da želite da uklonite adresu?';
    modalRef.componentInstance.confirmation = 'Da';
    modalRef.result
      .then(() => {
        this.signalRemoveAddress.emit();
      })
      .catch(() => noop());
  }
}
