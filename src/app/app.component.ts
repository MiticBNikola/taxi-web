import { NgSwitch } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './_layout/footer/footer.component';
import { HeaderComponent } from './_layout/header/header.component';
import { NavComponent } from './_layout/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, NgSwitch, HeaderComponent, NavComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'taxi-web';
}
