import {NgModule} from '@angular/core';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {AuthService} from './auth.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import {authReducer} from './reducers';
import {AuthGuard} from './auth.guard';
import {EffectsModule} from '@ngrx/effects';
import {AuthEffects} from './auth.effects';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [
    CommonModule,
    BrowserModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatInputModule,
    StoreModule.forFeature('auth', authReducer),
    EffectsModule.forFeature([AuthEffects]),
    RouterModule,
  ],
  exports: [
    HttpClientModule
  ],
  providers: [
    AuthService,
    AuthGuard
  ]
})
export class AuthModule {
}
