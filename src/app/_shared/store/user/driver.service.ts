import { Injectable } from '@angular/core';

import { BaseApiService } from '../base-api.service';

@Injectable({ providedIn: 'root' })
export class DriverService extends BaseApiService {
  baseUrl = `${this.apiURL}/driver`;

  show(id: number) {
    return this.get(`${this.baseUrl}/${id}`);
  }
}
