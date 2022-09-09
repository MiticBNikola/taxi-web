import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-custom-address',
  templateUrl: './add-custom-address.component.html',
  styleUrls: ['./add-custom-address.component.css']
})
export class AddCustomAddressComponent implements OnInit {

  @Input() oldAddress: string;
  address: FormControl;

  constructor(private modalRef: NgbActiveModal) {
  }

  ngOnInit(): void {

    this.buildAddressForm();
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
