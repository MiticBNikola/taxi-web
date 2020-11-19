import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.css']
})
export class UserEditorComponent implements OnInit {
  isLoading = true;
  form: FormGroup;
  user;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private toastr: ToastrService) { }

  ngOnInit(): void {
    this.user = this.route.data.subscribe(value => this.populateForm(value));
    this.isLoading = false;
  }

  populateForm(value) {
    this.form = this.fb.group({
      name:        [value.name, [Validators.required]],
      email:        [value.email, [Validators.required, Validators.email]],
      phoneNumber:        [value.phoneNumber, [Validators.required]],
      professionalQualifications:        [value.professionalQualifications, [Validators.required]],
      drivingLicenceCategory:        [value.drivingLicenceCategory, [Validators.required]],
      drivingLicenceNumber:        [value.drivingLicenceNumber, [Validators.required, Validators.minLength(9)]],
    });
  }

  edit() {

  }
}
