import { Injectable } from '@angular/core';

import { BaseApiService } from '../base-api.service';

@Injectable({ providedIn: 'root' })
export class ManagerService extends BaseApiService {
  baseUrl = `${this.apiURL}/manager`;

  show(id: number) {
    return this.get(`${this.baseUrl}/${id}`);
  }
}
