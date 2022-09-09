import { CommonModule, DecimalPipe } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { AddressInputComponent } from './components/address-input/address-input.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { HeaderInterceptor } from './interceptors/headInterceptor';
import {AddCustomAddressComponent} from './components/add-custom-address/add-custom-address.component';
import {ConfirmDialogComponent} from './components/confirm-dialog/confirm-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
            declarations: [
              // AddressInputComponent,
              ForgotPasswordComponent,
              AddCustomAddressComponent,
              ConfirmDialogComponent,
            ],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MatDialogModule,
  ],
            providers:    [
              DecimalPipe,
              {
                provide:  HTTP_INTERCEPTORS,
                useClass: HeaderInterceptor,
                multi:    true
              }
            ],
            exports:      [
              CommonModule,
              NgbModule,
              FormsModule,
              ReactiveFormsModule,
            ],
          })
export class SharedModule {
}
