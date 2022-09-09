import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AddCustomAddressComponent} from '../../_shared/components/add-custom-address/add-custom-address.component';
import {ConfirmDialogComponent} from '../../_shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})
export class AddressComponent implements OnInit {

  public geocoder: google.maps.Geocoder = new google.maps.Geocoder();
  @Input() isFirst: boolean;
  @Input() isLast: boolean;
  @Input() address: string;

  @Output() signalLocation: EventEmitter<google.maps.LatLng> = new EventEmitter<google.maps.LatLng>();
  @Output() signalRemoveAddress: EventEmitter<any> = new EventEmitter<any>();

  constructor(public toastrService: ToastrService,
              private modalService: NgbModal) {
  }

  ngOnInit(): void {
  }

  locateMe(): void {

    navigator.geolocation.getCurrentPosition((position) => {

      const latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      this.signalLocation.emit(latLng);
    });
  }

  changeAddress(): void {

    const modalRef = this.modalService.open(AddCustomAddressComponent);
    modalRef.componentInstance.oldAddress = this.address;
    modalRef.result
      .then(response => {
        if (response) {
          this.locateAddress(response);
        }
      });
  }

  locateAddress(address): void {

    this.geocoder.geocode({address}, (results, status) => {

      if (status === 'OK') {
        const latLng = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
        this.signalLocation.emit(latLng);
      } else {
        console.log('Geocode was not successful for the following reasons: ' + status);
        this.toastrService.error('Nepoznata adresa.');
      }
    });
  }

  removeAddress(): void {

    const modalRef = this.modalService.open(ConfirmDialogComponent);
    modalRef.result
      .then(response => {
        if (response) {
          this.signalRemoveAddress.emit();
        }
      });
  }

}
