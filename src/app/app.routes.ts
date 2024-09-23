import { Route } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserEditorComponent } from './user-editor/user-editor.component';

export const routes: Route[] = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'user', component: UserDetailComponent },
  {
    path: 'settings',
    component: UserEditorComponent,
    data: {
      name: 'Nikola',
      email: 'mitke',
      phoneNumber: 123456,
      professionalQualifications: 'SSS',
      drivingLicenceCategory: 'B',
      drivingLicenceNumber: 1231456,
    },
  },
  { path: '**', redirectTo: '/home' },
];
