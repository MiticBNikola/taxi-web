import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { xsrfInterceptor } from './_shared/inetrceptors/xsrfInterceptor';
import { AuthService } from './_shared/store/auth/auth.service';
import { routes } from './app.routes';

export function initializeApp(authService: AuthService): () => Promise<void> {
  return () => authService.getUser();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([xsrfInterceptor])),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AuthService],
      useFactory: initializeApp,
    },
  ],
};
