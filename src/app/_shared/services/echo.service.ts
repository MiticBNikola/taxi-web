import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EchoService {
  private echo?: Echo;
  private platformId: object = inject(PLATFORM_ID);

  constructor() {
    inject(NgZone).runOutsideAngular(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initEcho();
      }
    });
  }

  private initEcho() {
    (Window as any).Pusher = Pusher;
    this.echo = new Echo({
      broadcaster: 'reverb',
      key: environment.REVERB_APP_KEY,
      wsHost: environment.REVERB_WS_HOST,
      wsPort: environment.REVERB_WS_PORT,
      forceTLS: false,
      enabledTransports: ['ws'],
    });
  }

  listen(channelName: string, eventName: string, callback: (res: any) => void) {
    if (!this.echo) {
      return false;
    }
    return this.echo.listen(channelName, eventName, callback);
  }

  disconnect() {
    if (!this.echo) {
      return;
    }
    this.echo.disconnect();
  }
}
