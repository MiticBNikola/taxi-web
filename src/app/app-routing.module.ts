import {NgModule} from '@angular/core';
import {DashboardComponent} from './dashboard/dashboard.component';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {RegisterComponent} from './auth/register/register.component';
import {HomeComponent} from './home/home.component';
import {UserDetailComponent} from './user/user-detail/user-detail.component';
import {UserEditorComponent} from './user/user-editor/user-editor.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'user', component: UserDetailComponent },
  { path: 'settings', component: UserEditorComponent, data: {
      name: 'Nikola',
      email: 'mitke',
      phoneNumber: 123456,
      professionalQualifications: 'SSS',
      drivingLicenceCategory: 'B',
      drivingLicenceNumber: 1231456
    } },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
