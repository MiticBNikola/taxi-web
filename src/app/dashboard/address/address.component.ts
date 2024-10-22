import { NgClass } from '@angular/common';
import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faCrosshairs,
  faEdit,
  faEye,
  faEyeSlash,
  faFlag,
  faLocationDot,
  faPlay,
  faSignsPost,
  faSpinner,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { noop } from 'rxjs';

import { ConfirmationComponent } from '../../_shared/modals/confirmation/confirmation.component';
import { AuthStore } from '../../_shared/store/auth/auth.store';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [FaIconComponent, NgClass],
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
  protected readonly faEye = faEye;
  protected readonly faEyeSlash = faEyeSlash;
  protected readonly faCheck = faCheck;
  protected readonly faSpinner = faSpinner;
  protected readonly faCrosshairs = faCrosshairs;

  private authStore = inject(AuthStore);
  private modalService = inject(NgbModal);

  isFirst = input<boolean>(false);
  isLast = input<boolean>(false);
  address = input.required<string>();
  point = input.required<{ lat: number; lng: number }>();
  rideInProgress = input<boolean>(false);
  loading = input<boolean>(false);
  displayedDirections = input<boolean>(false);
  pickingInProgress = input<boolean>(false);

  @Output() signalOpenEditor: EventEmitter<{ position: string; oldAddress: string; lat: number; lng: number }> =
    new EventEmitter();
  @Output() signalLocateMe: EventEmitter<void> = new EventEmitter();
  @Output() signalPickLocation: EventEmitter<void> = new EventEmitter();
  @Output() signalRemoveAddress: EventEmitter<void> = new EventEmitter();
  @Output() signalPreviewRoute: EventEmitter<void> = new EventEmitter();
  @Output() signalHidePreviewRoute: EventEmitter<void> = new EventEmitter();
  @Output() signalAcceptRide: EventEmitter<void> = new EventEmitter();

  isDriver = computed(() => {
    return this.authStore.type() === 'driver';
  });

  locateMe(): void {
    this.signalLocateMe.emit();
  }

  pickLocation() {
    this.signalPickLocation.emit();
  }

  changeDestinationByDriver() {
    // if (!this.ride()?.start_time) {
    // this.toastService.error('Morate prvo da započnete vožnju!');
    // return;
    // }
    this.changeAddress();
  }

  changeAddress(): void {
    this.signalOpenEditor.emit({
      position: this.isFirst() ? 'first' : 'last',
      oldAddress: this.address(),
      lat: this.point().lat,
      lng: this.point().lng,
    });
  }

  removeAddress(): void {
    const modalRef = this.modalService.open(ConfirmationComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop',
      windowClass: 'd-flex justify-content-center align-items-center',
      size: 'lg',
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

  togglePreviewRoute() {
    if (this.displayedDirections()) {
      this.signalHidePreviewRoute.emit();
      return;
    }
    this.signalPreviewRoute.emit();
  }

  acceptRide() {
    const modalRef = this.modalService.open(ConfirmationComponent, {
      backdrop: 'static',
      backdropClass: 'modal-backdrop',
      windowClass: 'd-flex justify-content-center align-items-center',
      size: 'lg',
    });

    modalRef.componentInstance.title = 'Potvrda';
    modalRef.componentInstance.sentence = `Da li ste sigurni da želite da prihvatite vožnju?`;
    modalRef.componentInstance.confirmation = 'Da';
    modalRef.result
      .then(() => {
        this.signalPreviewRoute.emit();
        this.signalAcceptRide.emit();
      })
      .catch(() => noop());
  }
}
