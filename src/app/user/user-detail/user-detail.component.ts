import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../_shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  public isLoading = true;
  form: FormGroup;
  user = {
    name: 'Nikola',
    email: 'mitke',
    phoneNumber: 123456,
    professionalQualifications: 'SSS',
    drivingLicenceCategory: 'B',
    drivingLicenceNumber: 1231456
  };

  constructor(private fb: FormBuilder,
              public dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.populateForm();
    this.isLoading = false;
  }

  populateForm() {
    this.form = this.fb.group({
      name:        [this.user ?  this.user.name : null, []],
      email:        [this.user ?  this.user.email : null, []],
      phoneNumber:        [this.user ?  this.user.phoneNumber : null, []],
      professionalQualifications:        [this.user ?  this.user.professionalQualifications : null, []],
      drivingLicenceCategory:        [this.user ?  this.user.drivingLicenceCategory : null, []],
      drivingLicenceNumber:        [this.user ?  this.user.drivingLicenceNumber : null, []],
    });
  }

  onDeleteClick(){
    const row = this.user;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '60vw',
      data:  row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.isLoading = true;
      }
    });
  }
}
