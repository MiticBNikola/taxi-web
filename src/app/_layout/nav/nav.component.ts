import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';

import { AuthService } from '../../_shared/store/auth/auth.service';
import { AuthStore } from '../../_shared/store/auth/auth.store';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    RouterLink,
    NgOptimizedImage,
    FontAwesomeModule,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownItem,
    NgbDropdownToggle,
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  user = faUser;
  private authService = inject(AuthService);
  private authStore = inject(AuthStore);
  private router = inject(Router);

  protected isLoggedIn = computed(() => {
    return !!this.authStore.user();
  });

  logout() {
    this.authStore.setLoading(true);
    this.authService
      .logout()
      .pipe(finalize(() => this.authStore.setLoading(false)))
      .subscribe({
        next: () => {
          this.authStore.clearAuthUser();
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
