import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SharedModule } from './_shared/shared.modal';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LayoutModule } from './_layout/layout.module';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from './auth/auth.module';
import { StoreModule } from '@ngrx/store';
import { metaReducers, reducers } from './reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EntityDataModule } from '@ngrx/data';
import { EffectsModule } from '@ngrx/effects';
import { RouterState, StoreRouterConnectingModule } from '@ngrx/router-store';
import { HomeModule } from './home/home.module';
import { CommonModule } from '@angular/common';
import { UserModule } from './user/user.module';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
            declarations: [
              AppComponent,
              ConfirmDialogComponent,
            ],
            imports:      [
              CommonModule,
              BrowserModule,
              BrowserAnimationsModule,
              ToastrModule.forRoot(),
              AppRoutingModule,

              LayoutModule,
              AuthModule,
              DashboardModule,
              HomeModule,
              UserModule,
              StoreModule.forRoot(reducers, {
                metaReducers,
                runtimeChecks: {
                  strictStateImmutability:     true,
                  strictActionImmutability:    true,
                  strictActionSerializability: true,
                  strictStateSerializability:  true
                }
              }),
              StoreDevtoolsModule.instrument({
                                               maxAge:  25,
                                               logOnly: environment.production
                                             }),
              EntityDataModule.forRoot({}),
              EffectsModule.forRoot([]),
              StoreRouterConnectingModule.forRoot({
                                                    stateKey:    'router',
                                                    routerState: RouterState.Minimal
                                                  }),
              MatDialogModule,
              NgbModule,
              ReactiveFormsModule,
              SharedModule
            ],
            providers:    [],
            bootstrap:    [AppComponent]
          })
export class AppModule {
}
