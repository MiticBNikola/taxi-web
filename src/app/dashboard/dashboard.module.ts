import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { GoogleMapsModule } from '@angular/google-maps';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { DashboardDispatcherViewComponent } from './dashboard-dispatcher-view/dashboard-dispatcher-view.component';
import { DashboardDriverViewComponent } from './dashboard-driver-view/dashboard-driver-view.component';
import {DashboardUserViewComponent} from './dashboard-user-view/dashboard-user-view.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AddressComponent } from './address/address.component';



@NgModule({
  declarations: [
    DashboardComponent,
    DashboardDispatcherViewComponent,
    DashboardDriverViewComponent,
    DashboardUserViewComponent,
    AddressComponent
  ],
  imports: [
    CommonModule,
    GoogleMapsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
  ]
})
export class DashboardModule { }
