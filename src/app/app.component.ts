import { NgSwitch } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './_layout/footer/footer.component';
import { HeaderComponent } from './_layout/header/header.component';
import { NavComponent } from './_layout/nav/nav.component';
import { ToastComponent } from './_shared/components/toast/toast.component';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, NgSwitch, HeaderComponent, NavComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'taxi-web';

  ngOnInit() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_API_KEY}&loading=async&libraries=places&v=weekly`;
    document.body.appendChild(script);
  }
}
