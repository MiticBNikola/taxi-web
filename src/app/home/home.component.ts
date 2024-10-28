import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGift, faMap } from '@fortawesome/free-solid-svg-icons';
import { faRoad } from '@fortawesome/free-solid-svg-icons/faRoad';

import { AuthStore } from '../_shared/store/auth/auth.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FaIconComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly faRoad = faRoad;
  protected readonly faMap = faMap;
  protected readonly faGift = faGift;

  private authStore = inject(AuthStore);

  protected isDriver = computed(() => {
    return this.authStore.type() === 'driver';
  });
  protected isManager = computed(() => {
    return this.authStore.type() === 'manager';
  });
}
